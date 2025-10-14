"""FastAPI application with streaming support for Samim's chatbot."""
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
import os
from dotenv import load_dotenv
from bot import SamimBot

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Samim's AI Assistant")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global bot instance
bot_instance = None

@app.on_event("startup")
async def startup_event():
    """Initialize the bot on startup."""
    global bot_instance
    try:
        bot_instance = await SamimBot.create()
        logger.info("Bot initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing bot: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise

@app.get("/")
async def index():
    """Serve the chat interface."""
    return FileResponse('static/chat.html')

@app.get("/favicon.ico")
async def favicon():
    """Return a 204 No Content response for favicon requests."""
    return Response(status_code=204)

@app.post("/api/chat/stream")
async def stream_chat(request: Request):
    """Stream chat responses using Server-Sent Events."""
    try:
        data = await request.json()
        question = data.get('question', '')
        
        if not question:
            return {"error": "No question provided"}
        
        if not bot_instance:
            return {"error": "Bot not initialized"}
        
        logger.info(f"Received query: {question}")
        
        async def generate_response():
            try:
                chunk_count = 0
                async for chunk in bot_instance.ask_bot(question):
                    chunk_count += 1
                    logger.info(f"Sending chunk {chunk_count}: {chunk}")
                    yield f"data: {json.dumps(chunk)}\n\n"
                logger.info(f"Total chunks sent: {chunk_count}")
            except Exception as e:
                import traceback
                logger.error(f"Error generating response: {e}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
        
        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            }
        )
    
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return {"error": "Internal server error"}

if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host='0.0.0.0', port=port)
