from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class ProgramProgress(BaseModel):
    percent: float = 0
    done: int = 0
    total: int = 0


class ProgramInfo(BaseModel):
    id: str
    code: Optional[str] = None
    title: Optional[str] = None
    paymentStatus: Optional[str] = None
    progress: Optional[ProgramProgress] = None


class NextTask(BaseModel):
    id: str
    title: str
    type: Optional[str] = None


class UpcomingEvent(BaseModel):
    id: str
    title: str
    body: Optional[str] = None
    date: Optional[str] = None


class ParticipantContext(BaseModel):
    participantId: str
    surface: Literal["onboard", "home", "learn", "community"]
    firstLogin: bool = False
    name: Optional[str] = None
    programs: list[ProgramInfo] = Field(default_factory=list)
    primaryProgram: Optional[ProgramInfo] = None
    location: Optional[str] = None
    domain: Optional[str] = None
    batchId: Optional[str] = None
    phase: Optional[str] = None
    nextTask: Optional[NextTask] = None
    progressPercent: Optional[float] = None
    upcomingEvent: Optional[UpcomingEvent] = None
    requestedJob: Optional[Literal["onboard", "nudge", "recommend", "event"]] = None


class WhisperRequest(BaseModel):
    context: ParticipantContext


class WhisperResponse(BaseModel):
    id: str
    message: str
    job: Literal["onboard", "nudge", "recommend", "event"]
    source: Literal["llm", "fallback"] = "llm"
    rag_snippets: list[str] = Field(default_factory=list)


class OtpSendRequest(BaseModel):
    phone: str = Field(..., max_length=20)


class OtpVerifyRequest(BaseModel):
    phone: str = Field(..., max_length=20)
    code: str = Field(..., max_length=8)
