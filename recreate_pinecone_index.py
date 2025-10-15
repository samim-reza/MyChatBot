"""Recreate Pinecone index with correct dimensions for all-MiniLM-L6-v2 model."""
import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))

INDEX_NAME = "samim-chatbot"

# Check if index exists
existing_indexes = [index.name for index in pc.list_indexes()]

if INDEX_NAME in existing_indexes:
    print(f"Deleting existing index '{INDEX_NAME}'...")
    pc.delete_index(INDEX_NAME)
    print("Index deleted successfully!")

# Create new index with correct dimension (384 for all-MiniLM-L6-v2)
print(f"\nCreating new index '{INDEX_NAME}' with dimension 384...")
pc.create_index(
    name=INDEX_NAME,
    dimension=384,  # all-MiniLM-L6-v2 produces 384-dimensional embeddings
    metric='cosine',
    spec=ServerlessSpec(
        cloud='aws',
        region='us-east-1'
    )
)

print(f"Index '{INDEX_NAME}' created successfully!")
print("\nNext step: Run 'python3 update_pinecone.py' to populate the index with your data.")
