# 🔄 Migration from Pinecone to ChromaDB

## Why Switch to ChromaDB?

### The Problem with Pinecone on Azure:
- ❌ Embeddings mismatch (local vs Azure)
- ❌ Heavy dependencies (torch ~800MB)
- ❌ Complex setup and debugging
- ❌ External dependency (requires API key)
- ❌ Free tier limitations

### ChromaDB Benefits:
- ✅ **File-based** - Database stored with code
- ✅ **Consistent** - Same embeddings everywhere
- ✅ **Lightweight** - No torch dependency
- ✅ **Simple** - Just commit and deploy
- ✅ **Free** - No API costs
- ✅ **Fast** - Local file access

---

## What Changed

### Files Modified:
1. **`requirements.txt`** - Replaced pinecone with chromadb + langchain-chroma
2. **`app.py`** - Updated to use `bot_chroma.py`
3. **`.gitignore`** - Allow chroma_db/ to be committed

### Files Created:
1. **`services/chroma_service.py`** - ChromaDB setup (replaces llm_service.py)
2. **`bot_chroma.py`** - Bot using ChromaDB (replaces bot.py)
3. **`populate_chroma.py`** - Script to create ChromaDB from personal.json

### Files No Longer Needed:
- ~~`update_pinecone.py`~~
- ~~`test_pinecone.py`~~
- ~~`recreate_pinecone_index.py`~~
- ~~`services/embeddings.py`~~
- ~~`services/llm_service.py`~~ (kept for reference)

---

## Migration Steps

### Step 1: Install Dependencies
```bash
pip install langchain-chroma langchain-huggingface chromadb
```

### Step 2: Populate ChromaDB
```bash
python3 populate_chroma.py
```

**Expected output:**
```
🔄 Starting ChromaDB population...
✅ Loaded personal.json successfully

🔄 Loading HuggingFace embeddings model...
✅ Embeddings model loaded

================================================================================
Collection: personal
Documents: 19

Sample documents:
  1. basic_identity.full_name: Samim Reza
  2. basic_identity.nicknames: Samim
  3. basic_identity.current_role: Undergraduate Student
================================================================================

🔄 Populating collection 'personal'...
✅ Added 19 documents to 'personal'

================================================================================
✅ ChromaDB population complete!
📁 Database location: /home/samim01/Code/MyChatBot/chroma_db
================================================================================
```

### Step 3: Test Locally
```bash
python3 app.py
```

Visit: http://localhost:8000

Ask: **"give me your facebook id"**

Expected: ✅ `https://www.facebook.com/samimreza101`

### Step 4: Commit ChromaDB to Git
```bash
git add chroma_db/
git add .
git commit -m "Switch from Pinecone to ChromaDB for reliable deployments"
git push origin master
```

**Important**: The `chroma_db/` directory MUST be committed! It contains your vector database.

### Step 5: Deploy to Azure

Azure will:
1. Pull the code (including chroma_db/)
2. Install dependencies (no torch needed!)
3. Start the app
4. Bot works immediately ✅

**No environment variables needed!** (except GROQ_API_KEY)

---

## Verification

### Check Debug Endpoint

**Local:**
```bash
curl http://localhost:8000/api/debug/config
```

**Azure:**
```
https://your-app.azurewebsites.net/api/debug/config
```

**Expected Response:**
```json
{
  "status": "ok",
  "database_type": "ChromaDB",
  "groq_configured": true,
  "chroma_db_exists": true,
  "chroma_db_path": "/path/to/chroma_db",
  "collections": {
    "personal": {"document_count": 19},
    "academic": {"document_count": 74},
    "projects": {"document_count": 13},
    "style": {"document_count": 19}
  },
  "bot_initialized": true,
  "embeddings_type": "HuggingFace (all-MiniLM-L6-v2)"
}
```

---

## Azure Configuration

### Remove Pinecone Variables
Azure Portal → Configuration → Application settings

**Delete these:**
- ~~`PINECONE_API_KEY`~~
- ~~`PINECONE_INDEX_NAME`~~

**Keep only:**
- `GROQ_API_KEY` ← Still needed!

### Update Startup Command (if needed)
```
gunicorn --bind=0.0.0.0 --timeout 600 --workers 1 --worker-class uvicorn.workers.UvicornWorker app:app
```

(Timeout can be lower now - no torch to install!)

---

## Database Size

ChromaDB is very small:
- **personal.json**: ~5KB
- **chroma_db/**: ~2MB (includes embeddings)
- **Total**: ~2MB (vs 800MB torch!)

Git can handle this easily. Azure free tier has plenty of space.

---

## Advantages

### 1. **Consistency**
- Same database file everywhere
- Same embeddings everywhere
- No local vs cloud differences

### 2. **Simplicity**
- One command: `python3 populate_chroma.py`
- One commit: `git add chroma_db/`
- No API keys to manage (except Groq)

### 3. **Reliability**
- No network calls to external vector DB
- No embedding model loading issues
- Works on free tier

### 4. **Speed**
- Local file access (faster than API)
- Smaller dependencies (faster deployment)
- Quick startup

### 5. **Cost**
- $0/month (vs Pinecone costs)
- No API usage charges
- Works on Azure free tier

---

## Updating Data

When you update `personal.json`:

```bash
# Re-populate ChromaDB
python3 populate_chroma.py

# Commit the updated database
git add chroma_db/
git commit -m "Update personal data"
git push origin master

# Azure auto-deploys with new data!
```

---

## Troubleshooting

### Issue: "No module named 'chromadb'"
**Solution**: `pip install chromadb langchain-chroma langchain-huggingface`

### Issue: "Collection not found"
**Solution**: Run `python3 populate_chroma.py`

### Issue: Azure shows 0 documents
**Solution**: Check if `chroma_db/` was committed to git
```bash
git ls-files chroma_db/
```
Should show files. If empty, run:
```bash
git add chroma_db/ -f
git commit -m "Add ChromaDB"
git push
```

### Issue: Still using old Pinecone code
**Solution**: Make sure app.py imports `bot_chroma`:
```python
from bot_chroma import SamimBot  # Not from bot import SamimBot
```

---

## Comparison

| Feature | Pinecone | ChromaDB |
|---------|----------|----------|
| Setup | Complex (API keys, index creation) | Simple (run one script) |
| Dependencies | torch (800MB) + pinecone | chromadb (50MB) |
| Deployment | Slow (15-20 min) | Fast (5 min) |
| Consistency | Can differ (embedding issues) | Always same |
| Cost | Free tier limited | Completely free |
| Azure Tier | Needs Basic B1 | Works on Free F1 |
| Debugging | Hard (external service) | Easy (local files) |
| Updates | Complex (upload to cloud) | Simple (commit & push) |

---

## Next Steps

1. ✅ Run `populate_chroma.py` locally
2. ✅ Test locally - verify it works
3. ✅ Commit chroma_db/ to git
4. ✅ Push to GitHub
5. ✅ Remove Pinecone env vars from Azure
6. ✅ Wait for Azure deployment (~5 min)
7. ✅ Test Azure deployment
8. 🎉 Enjoy consistent, reliable chatbot!

---

**Status**: Ready to migrate! Run the steps above.
