"""Generate IL Guide whispers via OpenAI or rule-based fallback."""

from __future__ import annotations

import json
import re
import uuid
from typing import Literal

from .config import settings
from .fallback import generate_fallback, _pick_quote
from .prompts import SYSTEM_PROMPT, job_instruction
from .rag import retrieve_curriculum_snippets
from .rotation import get_last_message_id, set_last_message_id
from .schemas import ParticipantContext, WhisperResponse

Job = Literal["onboard", "nudge", "recommend", "event"]


def resolve_job(ctx: ParticipantContext, endpoint_job: Job) -> Job:
    if ctx.requestedJob:
        return ctx.requestedJob
    if ctx.firstLogin or endpoint_job == "onboard":
        return "onboard"
    return endpoint_job


def _context_payload(ctx: ParticipantContext, job: Job, rag_snippets: list[str], quote: dict | None) -> dict:
    payload = ctx.model_dump(exclude_none=True)
    payload["assignedJob"] = job
    payload["jobInstruction"] = job_instruction(job)
    if rag_snippets:
        payload["curriculumSnippets"] = rag_snippets
    if quote:
        payload["vettedQuote"] = quote
    return payload


async def _call_openai(ctx: ParticipantContext, job: Job, rag_snippets: list[str]) -> str | None:
    if not settings.openai_api_key:
        return None

    quote = None
    if job in ("nudge", "recommend") and ctx.surface in ("home", "community"):
        last = get_last_message_id(ctx.participantId, ctx.surface)
        quote = _pick_quote(last)

    user_content = json.dumps(_context_payload(ctx, job, rag_snippets, quote), ensure_ascii=False)

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        response = await client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.7,
            max_tokens=180,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"Generate one IL Guide whisper for job '{job}'. "
                        f"Context JSON:\n{user_content}"
                    ),
                },
            ],
        )
        raw = response.choices[0].message.content or ""
        data = json.loads(raw)
        message = (data.get("message") or "").strip()
        if message and 10 <= len(message) <= 500:
            return message
    except Exception:
        return None
    return None


def _message_id(job: Job, ctx: ParticipantContext) -> str:
    if ctx.nextTask:
        return f"{job}-{ctx.surface}-{ctx.nextTask.id}"
    if ctx.upcomingEvent and job == "event":
        return f"event-{ctx.upcomingEvent.id}"
    return f"{job}-{ctx.surface}-{uuid.uuid4().hex[:8]}"


async def generate_whisper(ctx: ParticipantContext, endpoint_job: Job) -> WhisperResponse:
    job = resolve_job(ctx, endpoint_job)
    last_id = get_last_message_id(ctx.participantId, ctx.surface)

    rag_snippets: list[str] = []
    if job == "recommend":
        rag_snippets = retrieve_curriculum_snippets(ctx)

    llm_message = await _call_openai(ctx, job, rag_snippets)
    if llm_message:
        msg_id = _message_id(job, ctx)
        if msg_id == last_id:
            result = generate_fallback(ctx, job, last_id)
        else:
            result = WhisperResponse(
                id=msg_id,
                message=llm_message,
                job=job,
                source="llm",
                rag_snippets=rag_snippets,
            )
    else:
        result = generate_fallback(ctx, job, last_id)

    if result.id == last_id and result.id != "fallback":
        result = generate_fallback(ctx, job, last_id)

    # Trim to spec: 1-3 sentences
    sentences = re.split(r"(?<=[.!?])\s+", result.message.strip())
    if len(sentences) > 3:
        result.message = " ".join(sentences[:3])

    set_last_message_id(ctx.participantId, ctx.surface, result.id)
    return result
