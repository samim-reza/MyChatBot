#!/usr/bin/env python3
"""Quick test to see what's in Pinecone personal namespace."""
import asyncio
import os
from dotenv import load_dotenv
from pinecone import Pinecone
from services.embeddings import CustomHashEmbeddings
from langchain_pinecone import PineconeVectorStore

load_dotenv()

async def test_search():
    """Test searching for facebook in personal namespace."""
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    INDEX_NAME = "my-chat-bot"
    
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(INDEX_NAME)
    embeddings = CustomHashEmbeddings()
    
    # Setup personal namespace
    vector_store = PineconeVectorStore(
        index=index,
        embedding=embeddings,
        namespace="personal",
        text_key="content"
    )
    
    # Test search for facebook
    print("Searching for 'facebook' in personal namespace...")
    results = await vector_store.asimilarity_search("facebook", k=5)
    
    print(f"\nFound {len(results)} results:")
    for i, doc in enumerate(results, 1):
        print(f"\n--- Result {i} ---")
        print(f"Content: {doc.page_content}")
        print(f"Metadata: {doc.metadata}")
    
    # Also test with "email"
    print("\n" + "="*80)
    print("Searching for 'email' in personal namespace...")
    results = await vector_store.asimilarity_search("email", k=5)
    
    print(f"\nFound {len(results)} results:")
    for i, doc in enumerate(results, 1):
        print(f"\n--- Result {i} ---")
        print(f"Content: {doc.page_content}")
        print(f"Metadata: {doc.metadata}")

if __name__ == "__main__":
    asyncio.run(test_search())
