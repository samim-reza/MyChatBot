# 🤖 Personal AI Assistant - MyChatBot

An intelligent, context-aware chatbot powered by **RAG (Retrieval-Augmented Generation)** technology, featuring real-time streaming responses and semantic search capabilities. This personal AI assistant uses ChromaDB for vector storage and Groq's LLM for generating human-like responses.

[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://mychatbot-b8vm.onrender.com/)
[![Azure Deploy](https://github.com/samim-reza/MyChatBot/actions/workflows/azure-deploy.yml/badge.svg)](https://github.com/samim-reza/MyChatBot/actions/workflows/azure-deploy.yml)
[![Python](https://img.shields.io/badge/Python-3.10-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Features

- **🎯 RAG-Powered Responses**: Retrieves relevant context from personal data before generating responses
- **⚡ Real-time Streaming**: Fast, token-by-token streaming responses for better UX
- **🧠 Semantic Search**: Uses HuggingFace embeddings for intelligent context retrieval
- **💾 Vector Database**: ChromaDB for efficient similarity search across multiple collections
- **🐳 Docker Support**: Fully containerized with optimized build caching
- **📊 Multi-Collection Architecture**: Organized data across personal, academic, projects, and style collections
- **🔄 Conversation History**: Maintains context across multiple turns in a conversation
- **🚀 Production Ready**: Deployed on Render with health checks and monitoring

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         FastAPI Server              │
│  ┌─────────────────────────────┐   │
│  │   SamimBot (RAG Engine)     │   │
│  │                             │   │
│  │  ┌────────────────────────┐ │   │
│  │  │  Query Processing      │ │   │
│  │  └────────────────────────┘ │   │
│  │           │                 │   │
│  │           ▼                 │   │
│  │  ┌────────────────────────┐ │   │
│  │  │  ChromaDB Collections  │ │   │
│  │  │  • Personal (16 docs)  │ │   │
│  │  │  • Academic (31 docs)  │ │   │
│  │  │  • Projects (13 docs)  │ │   │
│  │  │  • Style (0 docs)      │ │   │
│  │  └────────────────────────┘ │   │
│  │           │                 │   │
│  │           ▼                 │   │
│  │  ┌────────────────────────┐ │   │
│  │  │  Context Retrieval     │ │   │
│  │  │  (Semantic Search)     │ │   │
│  │  └────────────────────────┘ │   │
│  │           │                 │   │
│  │           ▼                 │   │
│  │  ┌────────────────────────┐ │   │
│  │  │  Groq LLM (llama-3.1)  │ │   │
│  │  │  Streaming Response    │ │   │
│  │  └────────────────────────┘ │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Docker (optional, for containerized deployment)
- Groq API Key ([Get it here](https://console.groq.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/samim-reza/MyChatBot.git
cd MyChatBot
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Local Development Setup

#### Option A: Using Virtual Environment (Recommended)

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt

# Run the application
python3 app.py
```

#### Option B: Using Docker (Production-like)

```bash
# Build the Docker image
sudo docker build -f Dockerfile.fast -t samim-chatbot:fast .

# Run the container
sudo docker run -d -p 8000:8000 --env-file .env --name samim-chatbot-container samim-chatbot:fast

# View logs
sudo docker logs -f samim-chatbot-container
```

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:8000
```

## 📁 Project Structure

```
MyChatBot/
├── app.py                      # FastAPI application entry point
├── bot_chroma.py               # RAG bot implementation
├── populate_chroma.py          # Script to populate ChromaDB
├── process_messages.py         # Message processing utilities
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Standard Docker build
├── Dockerfile.fast             # Optimized Docker build with caching
├── docker-compose.yml          # Docker Compose configuration
├── Procfile                    # Render deployment configuration
├── .env                        # Environment variables (not in git)
├── services/
│   ├── chroma_service.py       # ChromaDB and LLM setup
│   ├── embeddings.py           # Embedding service
│   └── llm_service.py          # LLM service wrapper
├── static/
│   └── chat.html               # Chat UI interface
├── personal_info/
│   └── personal.json           # Personal data for RAG (not in git)
└── chroma_db/                  # ChromaDB persistent storage
    └── *.sqlite3
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, high-performance web framework
- **Uvicorn**: Lightning-fast ASGI server
- **Python 3.10**: Core programming language

### AI/ML
- **LangChain**: Framework for LLM applications
- **ChromaDB**: Vector database for embeddings
- **HuggingFace Transformers**: Embedding models
- **Groq**: High-performance LLM inference
- **Sentence Transformers**: `all-MiniLM-L6-v2` for embeddings

### Infrastructure
- **Docker**: Containerization
- **Render**: Cloud deployment platform

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | API key for Groq LLM service | Yes | - |
| `ANONYMIZED_TELEMETRY` | Disable ChromaDB telemetry | No | False |

### LLM Configuration

Default settings in `services/chroma_service.py`:

```python
model = "llama-3.1-8b-instant"
temperature = 0.5
max_tokens = 300
streaming = True
```

## 🐳 Docker Commands

### Build and Run

```bash
# Build the image
sudo docker build -f Dockerfile.fast -t samim-chatbot:fast .

# Run container with environment file
sudo docker run -d -p 8000:8000 --env-file .env --name samim-chatbot-container samim-chatbot:fast
```

### Management Commands

```bash
# View logs (follow mode)
sudo docker logs -f samim-chatbot-container

# View last 50 lines of logs
sudo docker logs --tail 50 samim-chatbot-container

# Stop container
sudo docker stop samim-chatbot-container

# Start stopped container
sudo docker start samim-chatbot-container

# Restart container
sudo docker restart samim-chatbot-container

# Remove container
sudo docker rm samim-chatbot-container

# Check container status
sudo docker ps -a | grep samim-chatbot
```

### Quick Rebuild After Code Changes

```bash
sudo docker build -f Dockerfile.fast -t samim-chatbot:fast . && \
sudo docker stop samim-chatbot-container && \
sudo docker rm samim-chatbot-container && \
sudo docker run -d -p 8000:8000 --env-file .env --name samim-chatbot-container samim-chatbot:fast
```

> **Note**: The Dockerfile is optimized for layer caching. Code changes only rebuild the final layers (~1-2 seconds), while dependency installation is cached.

## 📊 Performance Metrics

Based on production logs:

- **Vector Search**: 0.04 - 0.2 seconds
- **LLM First Token**: 0.27 - 0.30 seconds
- **Total Response Time**: 0.35 - 0.55 seconds
- **Collections**:
  - Personal: 16 documents
  - Academic: 31 documents
  - Projects: 13 documents
  - Style: 0 documents

## 🔍 API Endpoints

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Chat interface HTML |
| `/api/chat/stream` | POST | Streaming chat endpoint |
| `/api/debug/config` | GET | Health check and configuration |

### Example Request

```bash
curl -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about your experience"}'
```

## 🗄️ Data Management

### Populate ChromaDB

To add or update data in the vector database:

```bash
python3 populate_chroma.py
```

### Data Format

Personal data should be structured in `personal_info/personal.json`:

```json
{
  "basic_identity": {
    "full_name": "Your Name",
    "email": "your.email@example.com",
    "facebook": "https://facebook.com/yourprofile"
  },
  "education": [...],
  "experience": [...],
  "projects": [...]
}
```

## 🚀 Deployment

### Azure App Service (Recommended)

Automated deployment using GitHub Actions with Docker containerization.

**Features:**
- 🔄 Automatic deployment on push to main/master
- 🐳 Docker-based deployment with optimized caching
- 🔐 Secure credential management
- ✅ Automated health checks
- 📊 Built-in monitoring and logging

**Setup Instructions:**

1. **Create Azure resources** (Container Registry + App Service)
2. **Configure GitHub Secrets**:
   - `AZURE_CREDENTIALS` - Service principal JSON
   - `ACR_USERNAME` - Azure Container Registry username
   - `ACR_PASSWORD` - Azure Container Registry password
   - `GROQ_API_KEY` - Groq API key
3. **Push to GitHub** - Deployment happens automatically!

📖 **Detailed Setup Guide**: [.github/workflows/AZURE_SETUP.md](.github/workflows/AZURE_SETUP.md)

**Access your deployed app:**
```
https://samim-chatbot-app.azurewebsites.net
```

**Estimated Cost**: ~$18/month (B1 tier)

---

### Render Deployment (Alternative)

The application is also configured for Render deployment.

**Features:**
- **Procfile**: Specifies the startup command
- **Health Checks**: `/api/debug/config` endpoint
- **Environment Variables**: Set in Render dashboard

**Deploy to Render:**

1. Connect your GitHub repository
2. Set environment variables in Render dashboard:
   - `GROQ_API_KEY`
   - `ANONYMIZED_TELEMETRY` (optional)
3. Deploy using the Procfile configuration

```bash
web: gunicorn app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

**Free Tier Available**: Perfect for testing and development

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Samim Reza**

- GitHub: [@samim-reza](https://github.com/samim-reza)
- Facebook: [samimreza101](https://www.facebook.com/samimreza101)
- Email: samimreza2111@gmail.com
- Portfolio: [CV](https://samim-reza.github.io/cv.pdf)

## 🙏 Acknowledgments

- [LangChain](https://langchain.com/) - Framework for building LLM applications
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [Groq](https://groq.com/) - Ultra-fast LLM inference
- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [HuggingFace](https://huggingface.co/) - ML models and embeddings

## 📧 Support

For support, email samimreza2111@gmail.com or open an issue in the repository.

---

<div align="center">
  <strong>Built with ❤️ by Samim Reza</strong>
  <br>
  <a href="https://samim-chatbot-app.azurewebsites.net">Live Demo</a> •
  <a href="https://github.com/samim-reza/MyChatBot">GitHub</a>
</div>
