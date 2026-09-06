from typing import Literal
from datetime import date

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
    
class GrowthPlanRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    goal: str = Field(
        min_length=10,
        max_length=500,
    )

    current_experience: str = Field(
        min_length=2,
        max_length=100,
    )

    target_date: date

    weekly_hours: int = Field(
        ge=1,
        le=40,
    )

    @field_validator(
        "goal",
        "current_experience",
    )
    @classmethod
    def normalize_growth_plan_text(
        cls,
        value: str,
    ) -> str:
        cleaned = " ".join(value.split())

        if not cleaned:
            raise ValueError(
                "This field cannot be empty."
            )

        return cleaned

    @field_validator("target_date")
    @classmethod
    def validate_target_date(
        cls,
        value: date,
    ) -> date:
        if value <= date.today():
            raise ValueError(
                "Target date must be in the future."
            )

        return value


class GrowthMilestone(BaseModel):
    title: str
    description: str
    target_period: str
    completion_criteria: list[str] = Field(
        default_factory=list
    )


class WeeklyAction(BaseModel):
    week: str
    focus: str
    actions: list[str] = Field(
        default_factory=list
    )


class GrowthRisk(BaseModel):
    risk: str
    mitigation: str


class GrowthPlan(BaseModel):
    plan_title: str
    goal_summary: str
    skill_gaps: list[str] = Field(
        default_factory=list
    )
    milestones: list[GrowthMilestone] = Field(
        default_factory=list
    )
    weekly_actions: list[WeeklyAction] = Field(
        default_factory=list
    )
    success_measures: list[str] = Field(
        default_factory=list
    )
    risks: list[GrowthRisk] = Field(
        default_factory=list
    )
    first_three_actions: list[str] = Field(
        default_factory=list,
        min_length=3,
        max_length=3,
    )


class GrowthPlanResponse(BaseModel):
    plan_id: str
    plan: GrowthPlan


class GrowthPlanListItem(BaseModel):
    plan_id: str
    plan_title: str
    goal_summary: str
    target_date: str
    weekly_hours: int
    created_at: str | None = None