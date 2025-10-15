"""LLM and ChromaDB Vector Store setup services."""
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
import chromadb
from chromadb.config import Settings
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
CHROMA_DB_DIR = "./chroma_db"

# Initialize embeddings and client once (singletons)
_embeddings_instance = None
_chroma_client = None

def get_embeddings():
    """Get or create embeddings instance (singleton)."""
    global _embeddings_instance
    if _embeddings_instance is None:
        print("🔄 Loading HuggingFace embeddings model...")
        _embeddings_instance = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        print("✅ Embeddings model loaded successfully")
    return _embeddings_instance

def get_chroma_client():
    """Get or create persistent ChromaDB client (singleton)."""
    global _chroma_client
    if _chroma_client is None:
        print(f"🔄 Initializing ChromaDB persistent client at {CHROMA_DB_DIR}...")
        _chroma_client = chromadb.PersistentClient(
            path=CHROMA_DB_DIR,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=False
            )
        )
        print("✅ ChromaDB client initialized")
    return _chroma_client


async def setup_vector_store(collection_name: str = "personal"):
    """Setup ChromaDB vector store."""
    try:
        embeddings = get_embeddings()
        client = get_chroma_client()
        
        vector_store = Chroma(
            client=client,
            collection_name=collection_name,
            embedding_function=embeddings
        )
        
        # Get count
        count = vector_store._collection.count()
        print(f"✅ Loaded collection '{collection_name}' with {count} documents")
        
        return vector_store
    except Exception as e:
        print(f"❌ Error setting up vector store '{collection_name}': {e}")
        import traceback
        print(traceback.format_exc())
        raise


async def setup_prompt_template():
    """Setup the RAG prompt template for Samim's chatbot."""
    RAG_PROMPT_WITH_HISTORY = """
You are Samim Reza's personal AI assistant. You represent Samim when he's unavailable.

CRITICAL INSTRUCTIONS:
- You MUST answer questions using ONLY the information provided in the "Context from Samim's data" section below.
- If the context contains the answer, use it directly. DO NOT make up information.
- If the context doesn't contain the answer, say "I don't have that information right now. You can reach Samim at samimreza2111@gmail.com for more details."
- Be conversational, friendly, and concise.
- When asked about email, phone, social media links - check the context first and provide the exact information found there.
- If asked about age, calculate from birth date: 21 November 2000 but never tell the exact birth date tell the age only.

Chat History:
{chat_history}

Context from Samim's data:
{context}

Question:
{question}

Answer (respond naturally as Samim would, using ONLY the context provided above):
"""
    return PromptTemplate(
        template=RAG_PROMPT_WITH_HISTORY,
        input_variables=["chat_history", "context", "question"]
    )


async def setup_llm(
    model: str = "llama-3.1-8b-instant",
    temperature: float = 0.5,
    max_tokens: int = 300,
    streaming: bool = True
):
    """Setup Groq LLM via ChatOpenAI."""
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        streaming=streaming,
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL
    )
