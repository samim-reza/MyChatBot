"""FastAPI application for Samim's portfolio and streaming chatbot."""
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from bot_chroma import SessionManager
from services.chroma_service import get_collection, COLLECTION_NAME
from services.groq_service import GROQ_MODEL_PRIMARY, GROQ_MODEL_FALLBACK

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_QUESTION_LENGTH = 2000

app = FastAPI(title="Samim's AI Assistant")
DATA_DIR = Path("data")
CHROMA_DB_DIR = DATA_DIR / "chroma_db"
CHAT_PAGE = Path("static/chat.html")
PORTFOLIO_BUILD_DIR = Path("portfolio/out")
PORTFOLIO_INDEX = PORTFOLIO_BUILD_DIR / "index.html"


def _mount_portfolio_assets():
    if (PORTFOLIO_BUILD_DIR / "_next").exists():
        app.mount(
            "/_next",
            StaticFiles(directory=PORTFOLIO_BUILD_DIR / "_next"),
            name="portfolio-next",
        )

    for folder in ("assets", "meta", "project", "company", "certificates", "blog"):
        asset_dir = PORTFOLIO_BUILD_DIR / folder
        if asset_dir.exists():
            app.mount(
                f"/{folder}",
                StaticFiles(directory=asset_dir),
                name=f"portfolio-{folder}",
            )


_mount_portfolio_assets()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = SessionManager()


def _resolve_portfolio_page(path: str) -> Optional[Path]:
    if not PORTFOLIO_BUILD_DIR.exists():
        return None

    clean_path = path.strip("/")
    if not clean_path:
        return PORTFOLIO_INDEX if PORTFOLIO_INDEX.exists() else None

    direct = PORTFOLIO_BUILD_DIR / clean_path
    if direct.is_file():
        return direct

    html_file = PORTFOLIO_BUILD_DIR / clean_path / "index.html"
    if html_file.exists():
        return html_file

    return None


@app.get("/")
async def index():
    if PORTFOLIO_INDEX.exists():
        return FileResponse(PORTFOLIO_INDEX)
    return FileResponse(CHAT_PAGE)


@app.get("/chat")
async def chat_page():
    return FileResponse(CHAT_PAGE)


@app.get("/favicon.ico")
async def favicon():
    for candidate in (
        PORTFOLIO_BUILD_DIR / "favicon.ico",
        PORTFOLIO_BUILD_DIR / "assets" / "samim-pixel-avatar.png",
    ):
        if candidate.exists():
            return FileResponse(candidate)
    return Response(status_code=204)


@app.get("/api/debug/config")
async def debug_config():
    try:
        doc_count = 0
        if CHROMA_DB_DIR.exists():
            try:
                doc_count = get_collection().count()
            except Exception:
                pass

        return {
            "status": "ok",
            "database_type": "ChromaDB",
            "collection": COLLECTION_NAME,
            "groq_configured": bool(os.getenv("GROQ_API_KEY")),
            "chroma_db_exists": CHROMA_DB_DIR.exists(),
            "chroma_db_path": str(CHROMA_DB_DIR.absolute()) if CHROMA_DB_DIR.exists() else "Not created",
            "document_count": doc_count,
            "embeddings_type": "Hash-based (lightweight, no ML dependencies)",
            "llm_primary": GROQ_MODEL_PRIMARY,
            "llm_fallback": GROQ_MODEL_FALLBACK,
            "portfolio_dir": str(PORTFOLIO_BUILD_DIR),
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/api/chat/stream")
async def stream_chat(request: Request):
    try:
        data = await request.json()
        question = str(data.get("question", "")).strip()
        session_id = str(data.get("session_id", "")) or (request.client.host if request.client else "anonymous")

        if not question:
            return {"error": "No question provided"}
        if len(question) > MAX_QUESTION_LENGTH:
            return {"error": f"Question too long (max {MAX_QUESTION_LENGTH} characters)"}

        bot = sessions.get_bot(session_id)
        logger.info(f"Received query ({session_id[:8]}): {question}")

        async def generate_response():
            try:
                async for chunk in bot.ask_bot(question):
                    yield f"data: {json.dumps(chunk)}\n\n"
            except Exception as e:
                logger.error(f"Error generating response: {e}")
                yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            },
        )
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return {"error": "Internal server error"}


@app.get("/{path:path}")
async def portfolio_fallback(path: str):
    if path.startswith("api/"):
        return Response(status_code=404)

    page = _resolve_portfolio_page(path)
    if page:
        return FileResponse(page)

    if PORTFOLIO_INDEX.exists():
        return FileResponse(PORTFOLIO_INDEX)

    return Response(status_code=404)


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
