import logging
from contextlib import asynccontextmanager
from functools import lru_cache

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth import get_current_user, initialize_firebase
from app.config import Settings, get_settings
from app.firestore_service import FirestoreService
from app.gemini_service import GeminiService
from app.models import (
    ChatRequest,
    ChatResponse,
    ConversationItem,
    SummaryRequest,
    SummaryResponse,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

logger = logging.getLogger("gemini-growth-companion")


@lru_cache(maxsize=1)
def get_firestore_service() -> FirestoreService:
    settings = get_settings()
    return FirestoreService(
        project_id=settings.google_cloud_project
    )


@lru_cache(maxsize=1)
def get_gemini_service() -> GeminiService:
    return GeminiService(get_settings())


@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()
    initialize_firebase(settings)

    logger.info(
        "Application started in environment=%s",
        settings.environment,
    )

    yield

    logger.info("Application stopped.")


settings = get_settings()

app = FastAPI(
    title="Gemini Growth Companion API",
    version="1.0.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request,
    exception: Exception,
) -> JSONResponse:
    logger.exception(
        "Unhandled error while processing %s",
        request.url.path,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected server error occurred."
        },
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "gemini-growth-companion-api",
    }


@app.get(
    "/api/conversations",
    response_model=list[ConversationItem],
)
async def list_conversations(
    current_user: dict = Depends(get_current_user),
    firestore_service: FirestoreService = Depends(get_firestore_service),
) -> list[dict]:
    uid = current_user["uid"]
    return firestore_service.list_conversations(uid)


@app.post(
    "/api/chat",
    response_model=ChatResponse,
)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    firestore_service: FirestoreService = Depends(get_firestore_service),
    gemini_service: GeminiService = Depends(get_gemini_service),
    application_settings: Settings = Depends(get_settings),
) -> ChatResponse:
    uid = current_user["uid"]

    firestore_service.ensure_user_profile(
        uid=uid,
        email=current_user.get("email"),
        name=current_user.get("name"),
    )

    conversation_id = request.conversation_id
    if conversation_id is None:
        conversation_id = firestore_service.create_conversation(
            uid=uid,
            initial_message=request.message,
        )
    elif not firestore_service.conversation_exists(
        uid,
        conversation_id,
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    try:
        gemini_service.validate_prompt(request.message)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    firestore_service.add_message(
        uid=uid,
        conversation_id=conversation_id,
        role="user",
        content=request.message,
    )

    history = firestore_service.get_messages(
        uid=uid,
        conversation_id=conversation_id,
        limit=application_settings.maximum_history_messages,
    )

    try:
        reply = gemini_service.generate_reply(history)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        logger.exception(
            "Gemini generation failed for uid=%s",
            uid,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI service could not generate a response.",
        ) from exc

    firestore_service.add_message(
        uid=uid,
        conversation_id=conversation_id,
        role="model",
        content=reply,
    )

    return ChatResponse(
        conversation_id=conversation_id,
        response=reply,
    )


@app.post(
    "/api/summarize",
    response_model=SummaryResponse,
)
async def summarize(
    request: SummaryRequest,
    current_user: dict = Depends(get_current_user),
    firestore_service: FirestoreService = Depends(get_firestore_service),
    gemini_service: GeminiService = Depends(get_gemini_service),
) -> SummaryResponse:
    uid = current_user["uid"]

    if not firestore_service.conversation_exists(
        uid,
        request.conversation_id,
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    messages = firestore_service.get_messages(
        uid=uid,
        conversation_id=request.conversation_id,
        limit=100,
    )

    try:
        summary = gemini_service.generate_summary(messages)
    except (ValueError, RuntimeError) as exc:
        logger.exception(
            "Summary generation failed for uid=%s",
            uid,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI service could not generate the summary.",
        ) from exc

    firestore_service.save_summary(
        uid=uid,
        conversation_id=request.conversation_id,
        summary=summary,
    )

    return SummaryResponse(
        conversation_id=request.conversation_id,
        summary=summary,
    )