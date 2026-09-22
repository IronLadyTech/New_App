from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .generator import generate_whisper
from .schemas import WhisperRequest, WhisperResponse

app = FastAPI(
    title="IL Guide API",
    description="Iron Lady in-app mentor whisper service",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_api_key(x_api_key: str | None = Header(default=None)) -> None:
    if not settings.il_guide_api_key:
        return
    if x_api_key != settings.il_guide_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "il-guide",
        "llm": bool(settings.openai_api_key),
        "redis": bool(settings.redis_url),
        "rag": bool(settings.chroma_persist_dir),
    }


@app.post("/onboard", response_model=WhisperResponse)
async def onboard(
    body: WhisperRequest,
    _: None = Depends(verify_api_key),
):
    ctx = body.context.model_copy(update={"firstLogin": True, "surface": "onboard"})
    return await generate_whisper(ctx, "onboard")


@app.post("/nudge", response_model=WhisperResponse)
async def nudge(
    body: WhisperRequest,
    _: None = Depends(verify_api_key),
):
    return await generate_whisper(body.context, "nudge")


@app.post("/recommend", response_model=WhisperResponse)
async def recommend(
    body: WhisperRequest,
    _: None = Depends(verify_api_key),
):
    return await generate_whisper(body.context, "recommend")


@app.post("/event", response_model=WhisperResponse)
async def event(
    body: WhisperRequest,
    _: None = Depends(verify_api_key),
):
    return await generate_whisper(body.context, "event")
