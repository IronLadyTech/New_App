"""Rule-based whisper generation when LLM is unavailable."""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Optional

from .schemas import ParticipantContext, WhisperResponse

_QUOTES_PATH = Path(__file__).parent / "quotations.json"


def _load_quotes() -> list[dict]:
    with open(_QUOTES_PATH, encoding="utf-8") as f:
        return json.load(f)


def _program_label(ctx: ParticipantContext) -> str:
    p = ctx.primaryProgram
    if not p:
        return "your program"
    return p.code or p.title or "your program"


def _pick_quote(exclude_id: Optional[str], offset: int = 0) -> Optional[dict]:
    quotes = _load_quotes()
    pool = [q for q in quotes if q["id"] != exclude_id] or quotes
    return pool[(hash(exclude_id or "") + offset) % len(pool)]


def _first_name(name: Optional[str]) -> Optional[str]:
    if not name:
        return None
    return name.split()[0]


def generate_fallback(
    ctx: ParticipantContext,
    job: str,
    last_id: Optional[str],
) -> WhisperResponse:
    name = _first_name(ctx.name)
    prog = _program_label(ctx)
    pct = ctx.progressPercent or 0
    next_task = ctx.nextTask
    candidates: list[WhisperResponse] = []

    if job == "onboard":
        loc = f" in {ctx.location}" if ctx.location else ""
        dom = f", coming from {ctx.domain}" if ctx.domain else ""
        msg = (
            f"Welcome, {name}. You're registered for {prog}{loc}{dom}. "
            f"First step: open Learn and complete your first task."
            if name
            else f"Welcome. You're registered for {prog}. Open Learn and complete your first task when you're ready."
        )
        return WhisperResponse(id="onboard-1", message=msg, job="onboard", source="fallback")

    if job == "nudge":
        if ctx.surface == "home":
            if next_task and pct < 100:
                tid = f"home-progress-{next_task.id}"
                msg = (
                    f"{name}, you're at {int(pct)}% in {prog}. Next up: {next_task.title}."
                    if name
                    else f"You're at {int(pct)}% in {prog}. Next up: {next_task.title}."
                )
                candidates.append(WhisperResponse(id=tid, message=msg, job="nudge", source="fallback"))
            elif pct >= 100:
                candidates.append(
                    WhisperResponse(
                        id="home-done",
                        message=f"{prog} tasks are complete. Check Engage for what's happening in your cohort.",
                        job="nudge",
                        source="fallback",
                    )
                )
            quote = _pick_quote(last_id)
            if quote:
                candidates.append(
                    WhisperResponse(
                        id=quote["id"],
                        message=f'"{quote["text"]}" — {quote["author"]}. Keep the momentum going in {prog}.',
                        job="nudge",
                        source="fallback",
                    )
                )
        elif ctx.surface == "community":
            quote = _pick_quote(last_id, 1)
            if quote:
                candidates.append(
                    WhisperResponse(
                        id=f"community-{quote['id']}",
                        message=f"\"{quote['text']}\" — {quote['author']}. Share what you're applying from {prog} in the feed.",
                        job="nudge",
                        source="fallback",
                    )
                )
            candidates.append(
                WhisperResponse(
                    id="community-engage",
                    message=f"Your cohort is here. Post a win or a question — IL Guide keeps you moving, but the community carries you.",
                    job="nudge",
                    source="fallback",
                )
            )
        else:
            candidates.append(
                WhisperResponse(
                    id="nudge-generic",
                    message="Open Learn and take the next step in your program.",
                    job="nudge",
                    source="fallback",
                )
            )

    elif job == "recommend":
        if next_task:
            candidates.append(
                WhisperResponse(
                    id=f"learn-rec-{next_task.id}",
                    message=f'Curated with your facilitators: start with "{next_task.title}" — it\'s the right next move in {prog}.',
                    job="recommend",
                    source="fallback",
                )
            )
        else:
            candidates.append(
                WhisperResponse(
                    id="learn-all-done",
                    message=f"You've cleared the current {prog} list. Revisit any task that needs improvement, or check Home for announcements.",
                    job="recommend",
                    source="fallback",
                )
            )

    elif job == "event":
        ev = ctx.upcomingEvent
        if ev:
            date_bit = f" on {ev.date}" if ev.date else ""
            candidates.append(
                WhisperResponse(
                    id=f"event-{ev.id}",
                    message=f"Upcoming: {ev.title}{date_bit}. Worth blocking time — it connects directly to {prog}.",
                    job="event",
                    source="fallback",
                )
            )
        else:
            candidates.append(
                WhisperResponse(
                    id="event-none",
                    message=f"No events in your feed right now. Stay focused on {prog} — the next session will show up here.",
                    job="event",
                    source="fallback",
                )
            )

    fresh = [c for c in candidates if c.id != last_id]
    pool = fresh or candidates
    if pool:
        return random.choice(pool)

    return WhisperResponse(
        id="fallback",
        message="Open Learn and take the next step in your program.",
        job=job if job in ("onboard", "nudge", "recommend", "event") else "nudge",
        source="fallback",
    )
