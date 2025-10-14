"""LLM and Vector Store setup services."""
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

async def setup_vector_store(
    namespace: str = "messages",
    index_name: str = "my-chat-bot"
):
    """Setup Pinecone vector store with custom embeddings."""
    from .embeddings import CustomHashEmbeddings
    
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Check if index exists
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=768,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
    
    index = pc.Index(index_name)
    embeddings = CustomHashEmbeddings()
    
    return PineconeVectorStore(
        index=index,
        embedding=embeddings,
        namespace=namespace,
        text_key="content"
    )


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
    max_tokens: int = 300
):
    """Setup Groq LLM using OpenAI-compatible interface."""
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL,
        streaming=True
    )
