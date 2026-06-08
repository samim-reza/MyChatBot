"""FastAPI application with streaming support for Samim's chatbot."""
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from bot_chroma import SamimBot
from services.chroma_service import get_collection, COLLECTION_NAME

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Samim's AI Assistant")
DATA_DIR = Path("data")
CHROMA_DB_DIR = DATA_DIR / "chroma_db"

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bot_instance = None


@app.on_event("startup")
async def startup_event():
    global bot_instance
    try:
        bot_instance = await SamimBot.create()
        logger.info("Bot initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing bot: {e}")
        raise


@app.get("/")
async def index():
    return FileResponse("static/chat.html")


@app.get("/favicon.ico")
async def favicon():
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
            "bot_initialized": bot_instance is not None,
            "embeddings_type": "Hash-based (lightweight, no ML dependencies)",
            "llm": "Groq llama-3.1-8b-instant",
        }
    except Exception as e:
        return {"status": "error", "error": str(e), "bot_initialized": bot_instance is not None}


@app.post("/api/chat/stream")
async def stream_chat(request: Request):
    try:
        data = await request.json()
        question = data.get("question", "")

        if not question:
            return {"error": "No question provided"}
        if not bot_instance:
            return {"error": "Bot not initialized"}

        logger.info(f"Received query: {question}")

        async def generate_response():
            try:
                async for chunk in bot_instance.ask_bot(question):
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


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
