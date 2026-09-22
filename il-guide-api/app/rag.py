"""Optional ChromaDB curriculum retrieval for content curator job."""

from __future__ import annotations

from typing import Optional

from .config import settings
from .schemas import ParticipantContext

_chroma = None
_collection = None
_init_attempted = False


def _init_chroma():
    global _chroma, _collection, _init_attempted
    if _init_attempted:
        return _collection
    _init_attempted = True
    if not settings.chroma_persist_dir:
        return None
    try:
        import chromadb

        _chroma = chromadb.PersistentClient(path=settings.chroma_persist_dir)
        _collection = _chroma.get_or_create_collection(settings.chroma_collection)
    except Exception:
        _collection = None
    return _collection


def retrieve_curriculum_snippets(ctx: ParticipantContext, limit: int = 3) -> list[str]:
    collection = _init_chroma()
    if collection is None:
        return []

    prog = ctx.primaryProgram
    code = (prog.code if prog else "") or ""
    phase = ctx.phase or ""
    query_parts = [p for p in [code, phase, ctx.nextTask.title if ctx.nextTask else ""] if p]
    if not query_parts:
        return []

    query = " ".join(query_parts)
    try:
        result = collection.query(query_texts=[query], n_results=limit)
        docs = result.get("documents") or [[]]
        return [d for d in docs[0] if d]
    except Exception:
        return []
