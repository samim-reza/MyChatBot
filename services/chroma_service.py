"""ChromaDB setup with lightweight hash embeddings."""
from pathlib import Path

import chromadb
from chromadb.config import Settings

from services.embeddings import HashEmbeddingFunction

CHROMA_DB_DIR = str(Path("data") / "chroma_db")
COLLECTION_NAME = "samim_knowledge"

_client = None
_collection = None


def get_chroma_client():
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=CHROMA_DB_DIR,
            settings=Settings(anonymized_telemetry=False),
        )
    return _client


def get_collection():
    global _collection
    if _collection is None:
        client = get_chroma_client()
        _collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=HashEmbeddingFunction(),
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def reset_collection():
    """Delete and recreate the knowledge collection."""
    global _collection
    client = get_chroma_client()
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
    _collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=HashEmbeddingFunction(),
        metadata={"hnsw:space": "cosine"},
    )
    return _collection
