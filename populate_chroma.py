#!/usr/bin/env python3
"""
Populate ChromaDB with personal data from personal.json
"""
import json
import os
from typing import List, Dict, Any
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

CHROMA_DB_DIR = "./chroma_db"

def flatten_json_to_text(data: Dict[str, Any], prefix: str = "") -> List[str]:
    """Convert JSON data to text chunks."""
    texts = []
    
    if isinstance(data, dict):
        for key, value in data.items():
            current_key = f"{prefix}.{key}" if prefix else key
            
            if isinstance(value, (dict, list)):
                texts.extend(flatten_json_to_text(value, current_key))
            else:
                texts.append(f"{current_key}: {value}")
    
    elif isinstance(data, list):
        for i, item in enumerate(data):
            texts.extend(flatten_json_to_text(item, f"{prefix}[{i}]"))
    
    return texts


def categorize_personal_data(data: Dict[str, Any]) -> Dict[str, List[str]]:
    """Categorize personal data into collections."""
    categories = {
        "personal": [],
        "academic": [],
        "projects": [],
        "style": []
    }
    
    # Personal info
    if "basic_identity" in data:
        categories["personal"].extend(flatten_json_to_text({"basic_identity": data["basic_identity"]}))
    if "family" in data:
        categories["personal"].extend(flatten_json_to_text({"family": data["family"]}))
    
    # Academic
    if "education" in data:
        categories["academic"].extend(flatten_json_to_text({"education": data["education"]}))
    if "experience" in data:
        categories["academic"].extend(flatten_json_to_text({"experience": data["experience"]}))
    if "skills" in data:
        categories["academic"].extend(flatten_json_to_text({"skills": data["skills"]}))
    if "research" in data:
        categories["academic"].extend(flatten_json_to_text({"research": data["research"]}))
    
    # Projects
    if "projects" in data:
        categories["projects"].extend(flatten_json_to_text({"projects": data["projects"]}))
    
    # Style/Personality
    if "communication_style" in data:
        categories["style"].extend(flatten_json_to_text({"communication_style": data["communication_style"]}))
    if "response_patterns" in data:
        categories["style"].extend(flatten_json_to_text({"response_patterns": data["response_patterns"]}))
    
    return categories


def main():
    print("🔄 Starting ChromaDB population...")
    
    # Load personal data
    with open("personal_info/personal.json", "r") as f:
        personal_data = json.load(f)
    print("✅ Loaded personal.json successfully\n")
    
    # Initialize embeddings
    print("🔄 Loading HuggingFace embeddings model...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
    print("✅ Embeddings model loaded\n")
    
    # Categorize data
    categories = categorize_personal_data(personal_data)
    
    # Populate each collection
    for collection_name, texts in categories.items():
        if not texts:
            print(f"⚠️  Skipping empty collection: {collection_name}")
            continue
        
        print(f"{'='*80}")
        print(f"Collection: {collection_name}")
        print(f"Documents: {len(texts)}")
        print(f"\nSample documents:")
        for i, text in enumerate(texts[:3]):
            print(f"  {i+1}. {text}")
        print(f"{'='*80}\n")
        
        # Create documents
        documents = [
            Document(
                page_content=text,
                metadata={
                    "source": "personal_info.json",
                    "collection": collection_name,
                    "chunk_id": i
                }
            )
            for i, text in enumerate(texts)
        ]
        
        # Create or update collection
        print(f"🔄 Populating collection '{collection_name}'...")
        vector_store = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory=CHROMA_DB_DIR
        )
        
        # Clear existing data
        try:
            existing_ids = vector_store.get()['ids']
            if existing_ids:
                vector_store.delete(existing_ids)
                print(f"  🗑️  Cleared {len(existing_ids)} existing documents")
        except:
            pass
        
        # Add new documents
        vector_store.add_documents(documents)
        print(f"✅ Added {len(documents)} documents to '{collection_name}'\n")
    
    print("="*80)
    print("✅ ChromaDB population complete!")
    print(f"📁 Database location: {os.path.abspath(CHROMA_DB_DIR)}")
    print("="*80)


if __name__ == "__main__":
    main()
