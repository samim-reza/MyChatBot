import os
import json
import glob
from dotenv import load_dotenv
import logging
import requests
import numpy as np
import re
from datetime import datetime
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENDPOINT = "https://my-chat-bot-793v1ez.svc.aped-4627-b74a.pinecone.io"
MESSAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "messages")
DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db")
PERSONAL_INFO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "personal_info")

class Message:
    def __init__(self, sender, content, timestamp=""):
        self.sender = sender
        self.content = content
        self.timestamp = timestamp
    
    def __str__(self):
        return f"Sender: {self.sender}\nMessage: {self.content}\nTimestamp: {self.timestamp}"
    
    def to_dict(self):
        return {
            "sender": self.sender,
            "content": self.content,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(data.get("sender", "Unknown"), data.get("content", ""), data.get("timestamp", ""))

class PineconeVectorStore:
    def __init__(self, namespace="messages"):
        """Initialize the Pinecone vector store."""
        try:
            from pinecone import Pinecone, ServerlessSpec
            
            # Initialize Pinecone with the new API (v3.x)
            pc = Pinecone(api_key=PINECONE_API_KEY)
            
            # Get or create index
            index_name = "my-chat-bot"
            self.namespace = namespace
            
            # Check if the index exists
            try:
                # Try to get the index
                self.index = pc.Index(index_name)
                logger.info(f"Connected to existing Pinecone index: {index_name}")
            except Exception:
                # Create the index if it doesn't exist
                logger.info(f"Creating new Pinecone index: {index_name}")
                self.index = pc.create_index(
                    name=index_name,
                    dimension=768,  # Using the same dimension as before
                    metric="cosine",  # Using cosine similarity
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-west-2"
                    )
                )
            
            # Count items in the namespace
            try:
                stats = self.index.describe_index_stats()
                namespace_count = stats.get("namespaces", {}).get(self.namespace, {}).get("vector_count", 0)
                logger.info(f"Loaded Pinecone index with {namespace_count} vectors in namespace {self.namespace}.")
            except Exception as e:
                logger.warning(f"Could not get stats for namespace {self.namespace}: {e}")
            
        except Exception as e:
            logger.error(f"Error initializing Pinecone: {e}")
            raise
    
    def _create_embedding(self, text):
        """Create a simple embedding for the text."""
        # Simple hash-based embedding approach
        # This is not ideal for semantic search but will work for demonstration
        # In production, you'd want to use a proper embedding model
        np.random.seed(hash(text) % 2**32)
        return list(np.random.rand(768).astype(float))
    
    def add_documents(self, messages):
        """Add messages to the vector store."""
        if not messages:
            return
        
        # Prepare data for batch addition
        records = []
        
        for i, msg in enumerate(messages):
            # Create a unique ID
            id_prefix = f"msg_{int(time.time())}_{i}"
            
            # Create embedding
            embedding = self._create_embedding(str(msg))
            
            # Create metadata
            metadata = msg.to_dict()
            metadata["text"] = str(msg)  # Store full text in metadata
            
            # Add to records list (using new API format)
            records.append({
                "id": id_prefix,
                "values": embedding,
                "metadata": metadata
            })
        
        # Add vectors in batches to avoid API limits
        batch_size = 100
        for i in range(0, len(records), batch_size):
            end = min(i + batch_size, len(records))
            batch = records[i:end]
            
            try:
                self.index.upsert(
                    vectors=batch,
                    namespace=self.namespace
                )
            except Exception as e:
                logger.error(f"Error adding vectors to Pinecone: {e}")
        
        logger.info(f"Added {len(messages)} documents to Pinecone.")
    
    def search(self, query, k=5):
        """Search for similar messages."""
        try:
            # Create query embedding
            query_embedding = self._create_embedding(query)
            
            # Query Pinecone with new API
            results = self.index.query(
                vector=query_embedding,
                top_k=k,
                namespace=self.namespace,
                include_metadata=True
            )
            
            messages = []
            
            # Process results with the new response format
            for match in results.matches:
                metadata = match.metadata if hasattr(match, 'metadata') else {}
                message = Message(
                    metadata.get("sender", "Unknown"),
                    metadata.get("content", metadata.get("text", "")),
                    metadata.get("timestamp", "")
                )
                messages.append(message)
            
            return messages
            
        except Exception as e:
            logger.error(f"Error searching Pinecone: {e}")
            return []

def extract_messages_from_json(json_file):
    """Extract messages from a Facebook JSON file."""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if the JSON has the expected structure
        if not isinstance(data, dict) or 'messages' not in data:
            logger.warning(f"Skipping {json_file} - unexpected format")
            return []
        
        processed_messages = []
        
        # Extract messages with sender name and content
        for msg in data['messages']:
            if 'content' in msg and msg['content'] and 'sender_name' in msg:
                sender = msg['sender_name']
                content = msg['content']
                timestamp = msg.get('timestamp_ms', '')
                
                # Create a message object
                processed_messages.append(Message(sender, content, timestamp))
        
        return processed_messages
    
    except Exception as e:
        logger.error(f"Error processing {json_file}: {e}")
        return []

def process_all_messages():
    """Process all message files."""
    all_messages = []
    
    # Find all JSON files in message folders
    json_files = []
    for root, dirs, files in os.walk(MESSAGES_DIR):
        for file in files:
            if file.endswith('.json'):
                json_files.append(os.path.join(root, file))
    
    logger.info(f"Found {len(json_files)} JSON files")
    
    # Process each JSON file
    for json_file in json_files:
        messages = extract_messages_from_json(json_file)
        all_messages.extend(messages)
    
    return all_messages

def process_messages():
    """Process messages and create vector store."""
    messages = process_all_messages()
    logger.info(f"Processed {len(messages)} messages")
    
    if not messages:
        logger.warning("No messages to process")
        return
    
    # Create and save vector store
    vector_store = PineconeVectorStore(namespace="messages")
    vector_store.add_documents(messages)
    logger.info(f"Created vector store with {len(messages)} messages")

class Tools:
    """Tools that can be called by the chatbot."""
    
    @staticmethod
    def get_current_time():
        """Get the current time."""
        now = datetime.now()
        return now.strftime("%Y-%m-%d %H:%M:%S")
    
    @staticmethod
    def get_portfolio_link():
        """Get Samim's portfolio link."""
        return "https://samim-reza.github.io/"
    
    @staticmethod
    def get_cv_link():
        """Get Samim's CV link."""
        return "https://samim-reza.github.io/CV_Samim_Reza.pdf"
    
    @staticmethod
    def search_personal_info(query):
        """Search for specific information in the personal info files."""
        try:
            results = []
            for root, dirs, files in os.walk(PERSONAL_INFO_DIR):
                for file in files:
                    if file.endswith('.json'):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                data = json.load(f)
                                
                            if isinstance(data, list):
                                for item in data:
                                    if isinstance(item, dict):
                                        # Check if any values contain the query
                                        for key, value in item.items():
                                            if isinstance(value, str) and query.lower() in value.lower():
                                                results.append(item)
                                                break
                            elif isinstance(data, dict):
                                for key, value in data.items():
                                    if isinstance(value, str) and query.lower() in value.lower():
                                        results.append({key: value})
                        except Exception as e:
                            logger.error(f"Error reading {file_path}: {e}")
            
            return results if results else "No specific information found."
        except Exception as e:
            logger.error(f"Error searching personal info: {e}")
            return "Error searching personal information."

class SamimChatbot:
    def __init__(self):
        """Initialize the chatbot."""
        try:
            self.vector_store = PineconeVectorStore(namespace="messages")
        except Exception as e:
            logger.error(f"Error initializing vector store: {e}")
            raise ValueError("Vector store not found or invalid. Run process_messages.py first.")
        
        self.api_key = GROQ_API_KEY
        self.tools = Tools()
        
        # Define available tools
        self.available_tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_current_time",
                    "description": "Get the current time and date",
                    "parameters": {}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_portfolio_link",
                    "description": "Get Samim's portfolio website link",
                    "parameters": {}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_cv_link",
                    "description": "Get Samim's CV or resume link",
                    "parameters": {}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_personal_info",
                    "description": "Search for specific information in Samim's personal data",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The search query to look for in personal information"
                            }
                        },
                        "required": ["query"]
                    }
                }
            }
        ]
    
    def _execute_tool_call(self, tool_call):
        """Execute a tool call and return the result."""
        try:
            function_name = tool_call["function"]["name"]
            
            if function_name == "get_current_time":
                return self.tools.get_current_time()
                
            elif function_name == "get_portfolio_link":
                return self.tools.get_portfolio_link()
                
            elif function_name == "get_cv_link":
                return self.tools.get_cv_link()
                
            elif function_name == "search_personal_info":
                args = json.loads(tool_call["function"]["arguments"])
                query = args.get("query", "")
                return json.dumps(self.tools.search_personal_info(query))
                
            else:
                return f"Unknown tool: {function_name}"
                
        except Exception as e:
            logger.error(f"Error executing tool call: {e}")
            return f"Error executing tool: {str(e)}"
    
    def get_response(self, user_query):
        """Get a response from the chatbot for a user query."""
        try:
            # Create two vector stores for different namespaces
            messages_store = PineconeVectorStore(namespace="messages")
            personal_info_store = PineconeVectorStore(namespace="personal_info")
            
            # Search in both namespaces
            messages_results = messages_store.search(user_query, k=5)
            personal_info_results = personal_info_store.search(user_query, k=5)
            
            # Combine results
            relevant_messages = messages_results + personal_info_results
            context = "\n\n".join([str(msg) for msg in relevant_messages])
            
            # First message to initialize the conversation and provide context
            messages = [
                {
                    "role": "system",
                    "content": """You are Samim Reza's personal AI assistant. You represent Samim when he's unavailable.
                    
                    Keep these facts about Samim in mind:
                    - Computer Science Engineering student at Green University of Bangladesh
                    - Passionate about programming, robotics, and problem-solving
                    - Three-time ICPC regionalist with 1000+ problems solved on various online judges
                    - Currently serving as a Teaching Assistant, Programming Trainer, and Robotics Engineer Intern
                    - Technical expertise includes various programming languages, robotics technologies including ROS, embedded systems, and IoT development
                    - the correct spelling of the Samim name in bengali is "শামীম"
                    
                    When responding:
                    - Be professional but friendly and conversational
                    - Always provide specific information from the context when available
                    - Use Samim's style: casual, preferring to respond in Bengali (Bangla) or mixing Bengali and English
                    - If asked about links, contacts or other personal information, use the appropriate tool to fetch that information
                    - For truly missing information that doesn't appear in the context at all, politely suggest contacting Samim directly
                    - When you need specific information about Samim, use the tools available to you"""
                },
                {
                    "role": "user",
                    "content": f"""User query: {user_query}
                    
                    Here are some relevant messages from Samim's conversations and personal information that might help:
                    {context}"""
                }
            ]
            
            # Use Groq API directly with requests and tools
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messages": messages,
                "model": "openai/gpt-oss-20b",
                "max_tokens": 1024,
                "temperature": 0.5,
                "tools": self.available_tools,
                "tool_choice": "auto"
            }
            
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                response_data = response.json()
                assistant_message = response_data["choices"][0]["message"]
                
                # Check if tool calls are present
                if "tool_calls" in assistant_message:
                    tool_calls = assistant_message["tool_calls"]
                    
                    # Execute each tool call
                    for tool_call in tool_calls:
                        tool_result = self._execute_tool_call(tool_call)
                        
                        # Add the tool call and result to messages
                        messages.append(assistant_message)
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call["id"],
                            "name": tool_call["function"]["name"],
                            "content": tool_result
                        })
                    
                    # Make a follow-up request with the tool results
                    payload = {
                        "messages": messages,
                        "model": "openai/gpt-oss-20b",
                        "max_tokens": 1024,
                        "temperature": 0.5
                    }
                    
                    response = requests.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    
                    if response.status_code == 200:
                        final_response = response.json()
                        return final_response["choices"][0]["message"]["content"]
                    else:
                        logger.error(f"Error from Groq API (follow-up): {response.status_code} - {response.text}")
                        return "I'm sorry, there was an error connecting to my language model. Please try again later."
                
                # If no tool calls were made, return the original response
                return assistant_message["content"]
            else:
                logger.error(f"Error from Groq API: {response.status_code} - {response.text}")
                return "I'm sorry, there was an error connecting to my language model. Please try again later."
        
        except Exception as e:
            logger.error(f"Error getting response: {e}")
            return "I'm sorry, I'm having trouble processing your request right now. Please try again later."

def view_vector_db():
    """View the contents of the vector database."""
    try:
        from pinecone import Pinecone
        
        # Initialize Pinecone with new API
        pc = Pinecone(api_key=PINECONE_API_KEY)
        
        # Connect to the index
        try:
            index = pc.Index("my-chat-bot")
            namespace = "messages"
            
            # Get stats
            stats = index.describe_index_stats()
            namespace_data = stats.namespaces.get(namespace, {})
            count = namespace_data.vector_count if hasattr(namespace_data, 'vector_count') else 0
            
            if count == 0:
                print("Vector database is empty.")
                return
            
            print(f"Vector database contains {count} vectors in namespace '{namespace}'.")
            
            # Fetch a sample of vectors with new API
            # Note: Pinecone doesn't have a direct "get all" method like ChromaDB
            # So we'll search with a random vector to get some samples
            random_vector = list(np.random.rand(768).astype(float))
            results = index.query(
                vector=random_vector,
                top_k=5,  # Get 5 sample documents
                namespace=namespace,
                include_metadata=True
            )
            
            print("\n===== Sample Messages =====")
            
            # Display sample documents with new API response format
            for i, match in enumerate(results.matches):
                metadata = match.metadata if hasattr(match, 'metadata') else {}
                print(f"\n--- Document {i+1} ---")
                print(f"ID: {match.id}")
                print(f"Score: {match.score}")
                content = metadata.get("text", "")
                print(f"Content: {content[:100]}{'...' if len(content) > 100 else ''}")
                print(f"Sender: {metadata.get('sender', 'Unknown')}")
                print(f"Timestamp: {metadata.get('timestamp', 'Not available')}")
            
            print(f"\nShowing {len(results.matches)}/{count} documents as a sample.")
            
        except Exception as e:
            print(f"Error accessing Pinecone index: {e}")
            print("Run process_messages.py first to create the vector database.")
            
    except ImportError:
        print("Pinecone package is not installed. Run: pip install pinecone-client")
    except Exception as e:
        print(f"Error accessing vector database: {e}")


# For testing purposes
if __name__ == "__main__":
    # If called with --view argument, show the database content
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--view":
        view_vector_db()
    else:
        process_messages()