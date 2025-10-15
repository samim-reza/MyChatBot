#!/usr/bin/env python3
"""
Simple script to update Pinecone vector store with personal data.
Compatible with current LangChain versions.
"""
import json
import os
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv
from pinecone import Pinecone
from services.embeddings import CustomHashEmbeddings
from langchain_pinecone import PineconeVectorStore

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "samim-chatbot"

def flatten_json_to_text(data: Dict[str, Any], prefix: str = "") -> List[str]:
    """Convert JSON data to text chunks for vectorization."""
    texts = []
    
    if isinstance(data, dict):
        for key, value in data.items():
            current_key = f"{prefix}.{key}" if prefix else key
            
            if isinstance(value, (dict, list)):
                texts.extend(flatten_json_to_text(value, current_key))
            else:
                # Create meaningful text chunks
                texts.append(f"{current_key}: {value}")
    
    elif isinstance(data, list):
        for i, item in enumerate(data):
            if isinstance(item, dict):
                texts.extend(flatten_json_to_text(item, prefix))
            else:
                texts.append(f"{prefix}: {item}")
    
    return texts

def categorize_personal_data(data: Dict[str, Any]) -> Dict[str, List[str]]:
    """Categorize personal data into different namespaces."""
    categories = {
        "personal": [],
        "academic": [],
        "projects": [],
        "style": []
    }
    
    # Personal information
    if "basic_identity" in data:
        categories["personal"].extend(flatten_json_to_text(data["basic_identity"], "basic_identity"))
    
    if "family" in data:
        categories["personal"].extend(flatten_json_to_text(data["family"], "family"))
    
    if "preferences" in data:
        categories["style"].extend(flatten_json_to_text(data["preferences"], "preferences"))
    
    if "boundaries" in data:
        categories["style"].extend(flatten_json_to_text(data["boundaries"], "boundaries"))
    
    # Academic information
    if "education" in data:
        categories["academic"].extend(flatten_json_to_text(data["education"], "education"))
    
    if "experience" in data:
        categories["academic"].extend(flatten_json_to_text(data["experience"], "experience"))
    
    if "research" in data:
        categories["academic"].extend(flatten_json_to_text(data["research"], "research"))
    
    if "technical_skills" in data:
        categories["academic"].extend(flatten_json_to_text(data["technical_skills"], "technical_skills"))
    
    if "competitive_programming" in data:
        categories["academic"].extend(flatten_json_to_text(data["competitive_programming"], "competitive_programming"))
    
    if "awards" in data:
        categories["academic"].extend(flatten_json_to_text(data["awards"], "awards"))
    
    if "roles" in data:
        categories["academic"].extend(flatten_json_to_text(data["roles"], "roles"))
    
    # Projects
    if "projects" in data:
        categories["projects"].extend(flatten_json_to_text(data["projects"], "projects"))
    
    return categories

async def setup_pinecone_store(namespace: str) -> PineconeVectorStore:
    """Setup Pinecone vector store for a specific namespace."""
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Check if index exists
    if INDEX_NAME not in pc.list_indexes().names():
        from pinecone import ServerlessSpec
        pc.create_index(
            name=INDEX_NAME,
            dimension=768,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
        print(f"Created index: {INDEX_NAME}")
    
    index = pc.Index(INDEX_NAME)
    embeddings = CustomHashEmbeddings()
    
    return PineconeVectorStore(
        index=index,
        embedding=embeddings,
        namespace=namespace,
        text_key="content"
    )

async def update_namespace(namespace: str, texts: List[str]):
    """Update a specific namespace with text data."""
    if not texts:
        print(f"No data for namespace: {namespace}")
        return
    
    print(f"Updating namespace '{namespace}' with {len(texts)} texts...")
    
    # Setup vector store
    vector_store = await setup_pinecone_store(namespace)
    
    # Create documents using LangChain Document class
    from langchain_core.documents import Document
    
    documents = []
    for i, text in enumerate(texts):
        doc = Document(
            page_content=text,
            metadata={
                "source": "personal_info.json",
                "namespace": namespace,
                "chunk_id": i
            }
        )
        documents.append(doc)
    
    # Add to vector store
    try:
        # Clear existing data in namespace first (optional)
        # vector_store.delete(delete_all=True, namespace=namespace)
        
        # Add new documents
        ids = await vector_store.aadd_documents(documents)
        print(f"Added {len(ids)} documents to namespace '{namespace}'")
        
    except Exception as e:
        print(f"Error updating namespace '{namespace}': {e}")

async def main():
    """Main function to update Pinecone with personal data."""
    print("Starting Pinecone update...")
    
    # Load personal data
    try:
        with open("personal_info/personal.json", "r", encoding="utf-8") as f:
            personal_data = json.load(f)
        print("Loaded personal.json successfully")
    except Exception as e:
        print(f"Error loading personal.json: {e}")
        return
    
    # Categorize data
    categories = categorize_personal_data(personal_data)
    
    # DEBUG: Print personal category to see if email/facebook are there
    print("\n=== DEBUG: Personal category texts ===")
    for i, text in enumerate(categories['personal']):
        print(f"{i}: {text}")
    print("=" * 80 + "\n")
    
    # Update each namespace
    for namespace, texts in categories.items():
        await update_namespace(namespace, texts)
    
    print("Pinecone update completed!")
    print("\nSummary:")
    for namespace, texts in categories.items():
        print(f"  {namespace}: {len(texts)} chunks")

if __name__ == "__main__":
    asyncio.run(main())