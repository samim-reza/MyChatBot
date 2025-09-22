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
        return f"Sender: {self.sender}\nMessage: {self.content}"
    
    def to_dict(self):
        return {
            "sender": self.sender,
            "content": self.content,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(data.get("sender", "Unknown"), data.get("content", ""), data.get("timestamp", ""))

def decode_text(text):
    if not text:
        return text
    # Heuristic: decode only if mojibake is present
    try:
        # If there are lots of characters in the range 0x80-0xff, it's likely mojibake
        if any(ord(c) > 127 for c in text):
            try:
                return text.encode('latin1').decode('utf-8')
            except Exception:
                try:
                    return text.encode('windows-1252').decode('utf-8')
                except Exception:
                    pass
        return text
    except Exception:
        return text

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
            
            # Initialize LangChain components if available
            self.langchain_store = None
            if LANGCHAIN_AVAILABLE:
                try:
                    self._init_langchain_store()
                except Exception as e:
                    logger.error(f"Error initializing LangChain store: {e}")
            
        except Exception as e:
            logger.error(f"Error initializing Pinecone: {e}")
            raise
            
    def _init_langchain_store(self):
        """Initialize LangChain vector store if LangChain is available."""
        if not LANGCHAIN_AVAILABLE:
            return
            
        try:
            from pinecone import Pinecone
            
            # Initialize Pinecone with the new API
            pc = Pinecone(api_key=PINECONE_API_KEY)
            index = pc.Index("my-chat-bot")
            
            # Create LangChain embeddings using SimpleHashEmbeddings
            embeddings = SimpleHashEmbeddings(dim=768)
            
            # Initialize LangChain Pinecone vectorstore
            self.langchain_store = LangchainPinecone(
                index=index,
                embedding=embeddings,
                namespace=self.namespace,
                text_key="text"  # The key in metadata that contains the text content
            )
            
            logger.info(f"LangChain vector store initialized for namespace {self.namespace}")
        except Exception as e:
            logger.error(f"Failed to initialize LangChain vector store: {e}")
            self.langchain_store = None
    
    def _create_embedding(self, text):
        """Create a simple embedding for the text."""
        # Simple hash-based embedding approach
        # This is not ideal for semantic search but will work for demonstration
        # In production, you'd want to use a proper embedding model
        np.random.seed(hash(text) % 2**32)
        # Convert numpy float64 values to native Python floats
        return [float(x) for x in np.random.rand(768)]
    
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
            
            # Only keep minimal metadata
            metadata = {}
            if hasattr(msg, "sender"):
                metadata["sender"] = msg.sender
            if hasattr(msg, "content"):
                metadata["content"] = msg.content
            if hasattr(msg, "timestamp"):
                metadata["timestamp"] = msg.timestamp
            # If the message is from a table file, keep only received/sent
            if msg.sender in ["received", "sent"]:
                metadata = {
                    "type": msg.sender,
                    "text": msg.content
                }
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
            
            # Print raw Pinecone results for debugging
            print("\n[Pinecone Raw Search Results]")
            for match in results.matches:
                print(f"ID: {getattr(match, 'id', None)} | Score: {getattr(match, 'score', None)} | Metadata: {getattr(match, 'metadata', None)}")
            print("[End of Pinecone Raw Search Results]\n")
            
            messages = []
            for match in results.matches:
                metadata = match.metadata if hasattr(match, 'metadata') else {}
                text = metadata.get("content") or metadata.get("text") or ""
                text = decode_text(text)
                sender_type = metadata.get("type", metadata.get("sender", "Unknown"))
                sender_type = decode_text(sender_type)
                message = Message(sender_type, text)
                messages.append(message)
            return messages
        except Exception as e:
            logger.error(f"Error searching Pinecone: {e}")
            return []

def extract_messages_from_json(json_file):
    """Extract messages from a Facebook JSON file or a table file."""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # If it's a table file (list of dicts with 'received' and 'sent')
        if isinstance(data, list) and data and isinstance(data[0], dict) and "received" in data[0]:
            processed_messages = []
            for item in data:
                received = item.get("received", "")
                sent = item.get("sent", "")
                # Store only minimal metadata
                processed_messages.append(Message("received", received, ""))
                processed_messages.append(Message("sent", sent, ""))
            return processed_messages

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
        # Only process message_1.json and message_1_table.json
        if os.path.basename(json_file) not in ["message_1.json", "message_1_table.json"]:
            continue
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
    """Helper tools for the chatbot."""
    
    @staticmethod
    def get_current_time():
        """Get the current time."""
        now = datetime.now()
        return now.strftime("%Y-%m-%d %H:%M:%S")
    
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

def get_reply_pairs(messages):
    """
    Given a list of Message objects (from Pinecone search),
    return a list of dicts with 'received' and 'sent' pairs.
    """
    pairs = []
    received_msgs = [m for m in messages if m.sender == "received" and m.content]
    sent_msgs = [m for m in messages if m.sender == "sent" and m.content]
    # Pair each received with the next sent (by order)
    for i, r in enumerate(received_msgs):
        sent = sent_msgs[i].content if i < len(sent_msgs) else None
        pairs.append({"received": r.content, "sent": sent})
    return pairs

class SamimChatbot:
    def __init__(self):
        """Initialize the chatbot."""
        try:
            # Initialize the vector store connection
            self.messages_store = PineconeVectorStore(namespace="messages")
            self.personal_info_store = PineconeVectorStore(namespace="personal_info")
            
            # Initialize LangChain components
            self.langchain_chain = None
            if LANGCHAIN_AVAILABLE:
                try:
                    self._init_langchain()
                except Exception as e:
                    logger.error(f"Error initializing LangChain: {e}")
                    
        except Exception as e:
            logger.error(f"Error initializing vector store: {e}")
            raise ValueError("Vector store not found or invalid. Run process_messages.py first.")
        
        self.api_key = GROQ_API_KEY
        
    def _init_langchain(self):
        """Initialize LangChain components in a simpler way."""
        if not LANGCHAIN_AVAILABLE:
            logger.warning("LangChain not available")
            return
        
        try:
            logger.info("LangChain initialization: This is a simplified version without complex chains")
            # We're just using the regular approach without complex LangChain setup
            # This helps avoid compatibility issues while still having the LangChain imports
            pass
        except Exception as e:
            logger.error(f"Error in LangChain initialization: {e}")
            
    def get_from_vector_store(self, user_query, namespace="personal_info", k=5):
        """Retrieve relevant information from the vector store."""
        try:
            # Create a vector store instance
            store = PineconeVectorStore(namespace=namespace)
            
            # Search for relevant information
            results = store.search(user_query, k=k)
            
            # Define contact-related titles for matching
            contact_titles = {
                "linkedin": ["LinkedIn Link", "LinkedIn", "linkedin"],
                "github": ["GitHub Link", "GitHub", "github"],
                "facebook": ["Facebook Link", "Facebook", "facebook"],
                "email": ["Contact Email", "Email", "email", "ইমেইল"],
                "cv": ["CV Link", "CV", "Resume", "resume"],
                "portfolio": ["Portfolio Link", "Portfolio", "Website", "website", "ওয়েবসাইট"],
                "contact": ["Contact", "যোগাযোগ", "contact information", "Contact Information"]
            }
            
            user_query_lower = user_query.lower();
            
            # Check for specific contact query
            for keyword, titles in contact_titles.items():
                if any(term in user_query_lower for term in [keyword, *titles]):
                    # Find matches for this specific contact type
                    matches = []
                    for result in results:
                        content = result.content.lower()
                        # Check if any title matches and the content contains a URL or email
                        if any(title.lower() in content for title in titles) and any(pattern in content for pattern in ["http", "www.", "@", ".com"]):
                            matches.append(result.content)
                    
                    if matches:
                        return "\n\n".join(matches)
                    else:
                        # Try a more specific search with higher k
                        specific_results = store.search(keyword, k=10)
                        for result in specific_results:
                            content = result.content.lower()
                            if any(title.lower() in content for title in titles) and any(pattern in content for pattern in ["http", "www.", "@", ".com"]):
                                matches.append(result.content)
                        
                        if matches:
                            return "\n\n".join(matches)
            
            # For general contact/links query
            if any(term in user_query_lower for term in ["যোগাযোগ", "contact", "link", "লিংক", "links", "profiles", "social", "প্রোফাইল", "profile"]):
                all_contacts = []
                # Check all results for any contact info
                for result in results:
                    content = result.content.lower()
                    # Add if it contains a URL or email pattern and has a contact-related keyword
                    if any(pattern in content for pattern in ["http", "www.", "@", ".com"]):
                        for keyword, titles in contact_titles.items():
                            if any(title.lower() in content for title in titles):
                                all_contacts.append(result.content)
                                break
                
                if all_contacts:
                    return "\n\n".join(all_contacts)
            
            # Return all relevant results if no specific contact info was found
            if results:
                return "\n\n".join([result.content for result in results])
                
        except Exception as e:
            logger.error(f"Error searching vector store: {e}")
            
        return None

    def get_response(self, user_query):
        """Get a response from the chatbot for a user query."""
        try:
            # Convert to lowercase once for efficiency
            user_query_lower = user_query.lower()
            
            # For simple greetings, provide a direct response without API calls
            simple_greetings = ["hi", "hello", "hey", "কেমন আছো", "কেমন আছেন", "হ্যালো", "হাই", "how are you", "what's up", "sup"]
            if any(greeting in user_query_lower for greeting in simple_greetings) and len(user_query_lower.split()) < 5:
                return "হ্যালো! আমি শামীমের পার্সোনাল AI অ্যাসিস্ট্যান্ট। আপনি কেমন আছেন? আমি আপনাকে কিভাবে সাহায্য করতে পারি?"
            
            # For contact-related queries, use a direct approach
            contact_terms = {
                "linkedin": ["linkedin", "লিঙ্কডিন", "linked in"],
                "github": ["github"],
                "facebook": ["facebook"],
                "email": ["email", "mail", "ইমেইল"],
                "cv": ["cv", "resume"],
                "portfolio": ["portfolio", "website", "ওয়েবসাইট"],
                "contact": ["contact", "যোগাযোগ"]
            }
            
            # Check for specific contact terms
            for category, terms in contact_terms.items():
                if any(term in user_query_lower for term in terms):
                    # Get contact info from vector store
                    vector_result = self.get_from_vector_store(category, k=5)
                    if vector_result:
                        # Extract URLs or emails
                        import re
                        urls = re.findall(r'https?://[^\s]+', vector_result)
                        emails = re.findall(r'\S+@\S+\.\S+', vector_result)
                        
                        # Format response based on category
                        if urls or emails:
                            link = urls[0] if urls else emails[0] if emails else None
                            if link:
                                if "linkedin" in category:
                                    return f"শামীমের LinkedIn প্রোফাইল লিংক হলো: {link}"
                                elif "github" in category:
                                    return f"শামীমের GitHub প্রোফাইল লিংক হলো: {link}"
                                elif "facebook" in category:
                                    return f"শামীমের Facebook প্রোফাইল লিংক হলো: {link}" 
                                elif "email" in category:
                                    return f"শামীমের ইমেইল হলো: {link}"
                                elif "cv" in category:
                                    return f"শামীমের CV ডাউনলোড করতে পারেন এখান থেকে: {link}"
                                elif "portfolio" in category:
                                    return f"শামীমের পোর্টফোলিও ওয়েবসাইট: {link}"
                                else:
                                    return f"এই তথ্যটি আপনার জন্য উপযোগী হতে পারে: {link}"
                        else:
                            return f"শামীমের {category} সম্পর্কিত তথ্য: {vector_result}"
            
            # Search in messages namespace for relevant information
            messages_results = self.messages_store.search(user_query, k=5)
            reply_pairs = get_reply_pairs(messages_results)

            # Print only the relevant received/sent pairs
            print("\n--- Relevant Chat Pairs ---")
            for pair in reply_pairs:
                print(f"Received: {pair['received']}\nSent: {pair['sent']}\n")
            print("--- End of Relevant Chat Pairs ---\n")

            # Use only these pairs for context
            context = "\n\n".join(
                [f"Received: {pair['received']}\nSent: {pair['sent']}" for pair in reply_pairs]
            )

            # Optionally, you can still search personal_info if needed
            personal_info_results = self.personal_info_store.search(user_query, k=5)
            context += "\n\n" + "\n\n".join([str(msg) for msg in personal_info_results])

            # Prepare the conversation for the API
            messages = [
                {
                    "role": "system",
                    "content": """
                    You are Samim Reza's personal AI assistant. You represent Samim when he's unavailable.

                    When responding:
                    - If the context contains a chat pair (Received/Sent) that matches the user's query, reply **exactly** as Samim replied in the 'Sent' field. Do not add any extra information, explanation, or style.
                    - If there is no matching chat pair, only then use your assistant knowledge and the facts below.
                    - Do not repeat or summarize the facts unless no chat pair is relevant.
                    - Do not add extra information, be concise and to the point.
                    - you know the queries, think and tell the answer

                    Facts about Samim:
                    - Computer Science Engineering student at Green University of Bangladesh
                    - Passionate about programming, robotics, and problem-solving
                    - Three-time ICPC regionalist with 1000+ problems solved on various online judges
                    - Currently serving as a Teaching Assistant, Programming Trainer, and Robotics Engineer Intern
                    - Technical expertise includes various programming languages, robotics technologies including ROS, embedded systems, and IoT development
                    - The correct spelling of Samim's name in Bengali is "শামীম"
                    """
                },
                {
                    "role": "user",
                    "content": f"""User query: you know this, think and tell me {user_query}
                    
                    Here are some relevant messages from Samim's conversations and personal information that might help:
                    {context}"""
                }
            ]
            
            # Use Groq API directly
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messages": messages,
                "model": "openai/gpt-oss-20b",
                "max_tokens": 1024,
                "temperature": 0.5  # Controls randomness: 0=deterministic, 1=creative
            }
            
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                response_data = response.json()
                assistant_message = response_data["choices"][0]["message"]
                return assistant_message["content"]
            else:
                logger.error(f"Error from Groq API: {response.status_code} - {response.text}")
                return "দুঃখিত, এই মুহূর্তে আমি আপনার প্রশ্নের উত্তর দিতে পারছি না।"
                
        except Exception as e:
            logger.error(f"Error getting response: {e}")
            return "দুঃখিত, একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।"

# Replace LangChain embeddings imports and class
try:
    from langchain_community.vectorstores import Pinecone as LangchainPinecone
    from langchain.chains import RetrievalQA
    from langchain_groq import ChatGroq
    from langchain.prompts import PromptTemplate
    from langchain.schema import Document
    from langchain_core.output_parsers import StrOutputParser
    from langchain_core.runnables import RunnablePassthrough
    from langchain_core.embeddings import Embeddings
    
    # Define a more compatible embeddings class
    class SimpleHashEmbeddings(Embeddings):
        """Very simple hash-based embeddings compatible with LangChain."""
        
        def __init__(self, dim=768):
            """Initialize with embedding dimension."""
            self.dim = dim
        
        def embed_documents(self, texts):
            """Embed a list of documents using hash function."""
            return [self._create_embedding(text) for text in texts]
        
        def embed_query(self, text):
            """Embed a query text using hash function."""
            return self._create_embedding(text)
        
        def _create_embedding(self, text):
            """Create embedding using a hash-based approach."""
            np.random.seed(hash(text) % 2**32)
            return [float(x) for x in np.random.rand(self.dim)]
    
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    print("LangChain not available. Some features will be disabled.")
    print("To install: pip install langchain langchain-groq langchain-community")

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

def check_pinecone_data():
    """Check if data is stored in Pinecone and print stats about it."""
    try:
        from pinecone import Pinecone
        
        # Initialize Pinecone client
        pc = Pinecone(api_key=PINECONE_API_KEY)
        
        # List all indexes
        indexes = pc.list_indexes()
        print(f"\nPinecone indexes in your account: {indexes}")
        
        # Get the chatbot index
        try:
            index = pc.Index("my-chat-bot")
            
            # Get overall stats
            stats = index.describe_index_stats()
            total_vector_count = stats.total_vector_count
            print(f"\nTotal vectors in index: {total_vector_count}")
            
            # Check each namespace
            print("\nNamespace statistics:")
            if hasattr(stats, 'namespaces'):
                for namespace_name, namespace_data in stats.namespaces.items():
                    vector_count = namespace_data.vector_count if hasattr(namespace_data, 'vector_count') else 0
                    print(f"  - {namespace_name}: {vector_count} vectors")
                    
                    # Fetch a small sample from this namespace
                    if vector_count > 0:
                        print(f"\n    Sample vectors from '{namespace_name}':")
                        random_vector = list(np.random.rand(768).astype(float))
                        results = index.query(
                            vector=random_vector,
                            top_k=2,
                            namespace=namespace_name,
                            include_metadata=True
                        )
                        
                        for i, match in enumerate(results.matches):
                            metadata = match.metadata if hasattr(match, 'metadata') else {}
                            sender = metadata.get('sender', 'Unknown')
                            content = metadata.get('content', '')[:50]
                            print(f"    {i+1}. Sender: {sender} | Content: {content}...")
            else:
                print("  No namespace data found")
            
        except Exception as e:
            print(f"Error accessing Pinecone index: {e}")
    
    except ImportError:
        print("Pinecone package is not installed. Run: pip install pinecone-client")
    except Exception as e:
        print(f"Error checking Pinecone data: {e}")

# For testing purposes
if __name__ == "__main__":
    # If called with --view argument, show the database content
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--view":
        view_vector_db()
    elif len(sys.argv) > 1 and sys.argv[1] == "--check":
        check_pinecone_data()
    else:
        process_messages()