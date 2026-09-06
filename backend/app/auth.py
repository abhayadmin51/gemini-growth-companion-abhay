from typing import Any

import firebase_admin
from fastapi import Depends, HTTPException, Request, status
from firebase_admin import auth
from firebase_admin import credentials

from app.config import Settings, get_settings


def initialize_firebase(settings: Settings) -> None:
    try:
        firebase_admin.get_app()
        return
    except ValueError:
        pass

    credential = credentials.ApplicationDefault()

    firebase_admin.initialize_app(
        credential,
        {
            "projectId": settings.firebase_project_id,
        },
    )


async def get_current_user(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    authorization = request.headers.get("Authorization", "")

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    id_token = authorization.removeprefix("Bearer ").strip()

    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        decoded_token = auth.verify_id_token(
            id_token,
            check_revoked=True,
        )
    except auth.RevokedIdTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication session has been revoked.",
        ) from exc
    except auth.UserDisabledError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account is disabled.",
        ) from exc
    except auth.InvalidIdTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token.",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed.",
        ) from exc

    if decoded_token.get("aud") != settings.firebase_project_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token was issued for a different Firebase project.",
        )

    if not decoded_token.get("uid"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated token does not contain a user ID.",
        )

    return decoded_token