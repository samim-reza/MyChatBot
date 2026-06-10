"""ChromaDB setup with lightweight hash embeddings."""
from pathlib import Path

import chromadb
from chromadb.config import Settings

from services.embeddings import HashEmbeddingFunction

CHROMA_DB_DIR = str(Path("data") / "chroma_db")
COLLECTION_NAME = "samim_knowledge"

_client = None


def get_chroma_client():
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=CHROMA_DB_DIR,
            settings=Settings(anonymized_telemetry=False),
        )
    return _client


def get_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=HashEmbeddingFunction(),
        metadata={"hnsw:space": "cosine"},
    )


def reset_collection():
    """Delete and recreate the knowledge collection."""
    client = get_chroma_client()
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=HashEmbeddingFunction(),
        metadata={"hnsw:space": "cosine"},
    )
