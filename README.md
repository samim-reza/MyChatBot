# Samim's Personal AI Chatbot

This project implements a personal AI chatbot for Samim's website using LangChain, RAG, and Groq LLM. The chatbot is trained on Facebook message history to provide context-aware responses.

## Features

- RAG (Retrieval Augmented Generation) implementation with ChromaDB
- Facebook message history processing and embedding
- Responsive Flask web API
- Simple chat interface for testing

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- Groq API key
- Facebook message data in the `messages` folder

### Installation

1. Install the required packages:

```bash
pip install -r requirements.txt
```

2. Set up environment variables:

Make sure your `.env` file contains:
```
GROQ_API_KEY=your_groq_api_key
PORT=5000  # Or any other port you prefer
```

### Data Processing

Process your Facebook messages to create the vector database:

```bash
python process_messages.py
```

This will:
1. Extract messages from all JSON files in the messages directory
2. Split them into appropriate chunks
3. Create embeddings using Groq
4. Store them in a ChromaDB vector database

### Running the Chatbot

Start the Flask server:

```bash
python app.py
```

The chatbot will be available at:
- Web interface: `http://localhost:5000`
- API endpoint: `http://localhost:5000/api/chat` (POST)

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. Add environment variables:
   - `GROQ_API_KEY`
   - `PORT` (Render will set this automatically)
5. Deploy!

## Usage

### API Usage

Send POST requests to `/api/chat` endpoint with JSON data:

```json
{
  "query": "Your question here"
}
```

Response:

```json
{
  "response": "AI-generated response here"
}
```

## Project Structure

- `app.py` - Flask server and API
- `chatbot.py` - Chatbot implementation with LangChain and RAG
- `process_messages.py` - Data processing and ChromaDB setup
- `requirements.txt` - Project dependencies
- `messages/` - Facebook message data
- `db/` - ChromaDB vector database (created when processing messages)

## Customization

To adjust the chatbot's personality and responses, modify the prompt template in `chatbot.py`.