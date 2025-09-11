import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq, GroqEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db")

class SamimChatbot:
    def __init__(self):
        """Initialize the chatbot with the vector store and LLM."""
        self.embedding_function = GroqEmbeddings(
            api_key=GROQ_API_KEY,
            model_name="openai/gpt-oss-20b"
        )
        
        # Load the persisted vector store if it exists
        if os.path.exists(DB_DIR):
            self.vector_store = Chroma(
                persist_directory=DB_DIR,
                embedding_function=self.embedding_function
            )
        else:
            raise ValueError("Vector store not found. Run process_messages.py first.")
        
        # Initialize the LLM with Groq
        self.llm = ChatGroq(
            model_name="openai/gpt-oss-20b",  # Using Llama 3 70B model
            api_key=GROQ_API_KEY,
            temperature=0.5,
            max_tokens=1024
        )
        
        # Create the RAG pipeline
        self.setup_rag_pipeline()
    
    def setup_rag_pipeline(self):
        """Set up the RAG pipeline using LangChain."""
        # Define the prompt template for the chatbot
        template = """
        You are Samim Reza's personal AI assistant. You represent Samim when he's unavailable.
        Use the retrieved message history to understand context and provide helpful responses.
        
        Keep these facts about Samim in mind:
        - Computer Science Engineering student at Green University of Bangladesh
        - Passionate about programming, robotics, and problem-solving
        - Three-time ICPC regionalist with 1000+ problems solved on various online judges
        - Currently serving as a Teaching Assistant, Programming Trainer, and Robotics Engineer Intern
        - Technical expertise includes various programming languages, robotics technologies including ROS, embedded systems, and IoT development
        
        When responding:
        - Be professional but friendly and conversational
        - If you don't know something about Samim specifically, use the general information above
        - If the question is technical, you can provide technical answers based on your knowledge
        - For personal questions about Samim that you can't answer from context, politely suggest contacting Samim directly
        
        Retrieved message context:
        {context}
        
        Question: {question}
        
        AI Assistant (as Samim):
        """
        
        # Create the prompt from template
        prompt = PromptTemplate.from_template(template)
        
        # Define the retrieval function
        retriever = self.vector_store.as_retriever(
            search_kwargs={"k": 5}  # Get top 5 most relevant results
        )
        
        # Create the RAG pipeline
        self.rag_chain = (
            {"context": retriever, "question": RunnablePassthrough()}
            | prompt
            | self.llm
            | StrOutputParser()
        )
    
    def get_response(self, user_query: str) -> str:
        """Get a response from the chatbot for a user query."""
        try:
            response = self.rag_chain.invoke(user_query)
            return response
        except Exception as e:
            print(f"Error getting response: {e}")
            return "I'm sorry, I'm having trouble processing your request right now. Please try again later."

# For testing purposes
if __name__ == "__main__":
    chatbot = SamimChatbot()
    
    # Test query
    test_query = "Tell me about Samim's experience with robotics"
    response = chatbot.get_response(test_query)
    print(f"Query: {test_query}")
    print(f"Response: {response}")