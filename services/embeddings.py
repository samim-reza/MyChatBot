"""Embeddings for Pinecone - using HuggingFace for semantic search."""
import numpy as np
from langchain_core.embeddings import Embeddings
from typing import List


class CustomHashEmbeddings(Embeddings):
    """
    Semantic embeddings using HuggingFace sentence-transformers.
    Falls back to hash-based if model not available.
    """
    
    def __init__(self, dimension: int = 768):
        self.dimension = dimension
        self.model = None
        
        # Try to load sentence-transformers model for semantic search
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            print("Loaded semantic embeddings model: all-MiniLM-L6-v2")
        except Exception as e:
            print(f"Warning: Could not load semantic model, using hash-based: {e}")
            self.model = None
    
    def _create_embedding(self, text: str) -> List[float]:
        """Create embedding - semantic if model loaded, else hash-based."""
        if self.model:
            # Semantic embedding
            embedding = self.model.encode(text, convert_to_numpy=True)
            # Pad or truncate to match dimension
            if len(embedding) < self.dimension:
                embedding = np.pad(embedding, (0, self.dimension - len(embedding)))
            elif len(embedding) > self.dimension:
                embedding = embedding[:self.dimension]
            return embedding.tolist()
        else:
            # Fallback: hash-based (deterministic but not semantic)
            np.random.seed(hash(text) % 2**32)
            return [float(x) for x in np.random.rand(self.dimension)]
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents."""
        if self.model:
            embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
            result = []
            for emb in embeddings:
                if len(emb) < self.dimension:
                    emb = np.pad(emb, (0, self.dimension - len(emb)))
                elif len(emb) > self.dimension:
                    emb = emb[:self.dimension]
                result.append(emb.tolist())
            return result
        else:
            return [self._create_embedding(text) for text in texts]
    
    def embed_query(self, text: str) -> List[float]:
        """Embed a single query."""
        return self._create_embedding(text)
