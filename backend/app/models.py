from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "model"]
    content: str = Field(min_length=1, max_length=5000)

    @field_validator("content")
    @classmethod
    def normalize_content(cls, value: str) -> str:
        cleaned = value.strip()

        if not cleaned:
            raise ValueError("Message cannot be empty.")

        return cleaned


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str = Field(min_length=1, max_length=5000)
    conversation_id: str | None = Field(
        default=None,
        min_length=8,
        max_length=128,
        pattern=r"^[A-Za-z0-9_-]+$",
    )

    @field_validator("message")
    @classmethod
    def normalize_message(cls, value: str) -> str:
        cleaned = value.strip()

        if not cleaned:
            raise ValueError("Message cannot be empty.")

        return cleaned


class ChatResponse(BaseModel):
    conversation_id: str
    response: str


class SummaryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    conversation_id: str = Field(
        min_length=8,
        max_length=128,
        pattern=r"^[A-Za-z0-9_-]+$",
    )


class JournalSummary(BaseModel):
    title: str
    summary: str
    achievements: list[str] = Field(default_factory=list)
    challenges: list[str] = Field(default_factory=list)
    next_actions: list[str] = Field(default_factory=list)
    reflection_question: str


class SummaryResponse(BaseModel):
    conversation_id: str
    summary: JournalSummary


class ConversationItem(BaseModel):
    conversation_id: str
    title: str
    created_at: str | None = None
    updated_at: str | None = None
    has_summary: bool = False