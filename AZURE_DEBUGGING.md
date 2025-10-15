# Debugging Azure Deployment Issues

## Issue: Bot says "I don't have that information" for Facebook/Email on Azure but works locally

### Root Cause
The issue is likely one of these:
1. **Index name mismatch** - Fixed! Changed from "my-chat-bot" to "samim-chatbot"
2. **Empty Pinecone index** - Data not uploaded to the correct index
3. **Environment variables not set** - API keys missing in Azure

---

## Step 1: Check Azure Configuration

### A. Visit Debug Endpoint
After deploying, visit:
```
https://your-app-name.azurewebsites.net/api/debug/config
```

This will show you:
- ✅ If Pinecone API key is set
- ✅ If Groq API key is set
- ✅ Which index name is being used
- ✅ If the index exists
- ✅ Namespace statistics (how many vectors in each namespace)

### B. Expected Output (Good)
```json
{
  "status": "ok",
  "pinecone_configured": true,
  "groq_configured": true,
  "index_name": "samim-chatbot",
  "available_indexes": ["samim-chatbot"],
  "index_exists": true,
  "namespaces": {
    "personal": {"vector_count": 19},
    "academic": {"vector_count": 74},
    "projects": {"vector_count": 13},
    "style": {"vector_count": 19}
  },
  "bot_initialized": true
}
```

### C. If You See Problems

**Problem**: `"pinecone_configured": false`
**Solution**: Set `PINECONE_API_KEY` in Azure Configuration

**Problem**: `"groq_configured": false`
**Solution**: Set `GROQ_API_KEY` in Azure Configuration

**Problem**: `"index_exists": false` or empty namespaces
**Solution**: Your data hasn't been uploaded. Run `python3 update_pinecone.py` locally

**Problem**: `"available_indexes": ["my-chat-bot"]` but looking for "samim-chatbot"
**Solution**: Run `python3 recreate_pinecone_index.py` then `python3 update_pinecone.py`

---

## Step 2: Fix Empty Pinecone Index

If the debug endpoint shows empty namespaces or index doesn't exist:

### Local Machine:
```bash
# 1. Recreate index with correct name and dimensions
python3 recreate_pinecone_index.py

# 2. Upload all your personal data
python3 update_pinecone.py

# 3. Verify data is there
python3 test_pinecone.py
```

**Expected output from test_pinecone.py:**
```
Searching for 'facebook' in personal namespace...
Found 5 results:
--- Result 1 ---
Content: basic_identity.facebook: https://www.facebook.com/samimreza101
```

---

## Step 3: Verify Azure Environment Variables

Go to Azure Portal:
1. Your Web App → **Configuration** → **Application settings**

Add/verify these settings:
```
GROQ_API_KEY = your_groq_api_key_here
PINECONE_API_KEY = your_pinecone_api_key_here
PINECONE_INDEX_NAME = samim-chatbot
```

⚠️ **Important**: Click **"Save"** at the top, then **"Restart"** your app!

---

## Step 4: Deploy Updated Code

### Push to GitHub:
```bash
git add .
git commit -m "Fix index name mismatch and add debug endpoint"
git push origin master
```

### Azure Auto-Deploy:
- Azure will detect the push
- Automatically redeploy (5-10 minutes)
- Check "Deployment Center" → "Logs" for progress

### After Deployment:
1. Visit `/api/debug/config` to verify configuration
2. Check "Log stream" for any errors during startup
3. Test the chatbot with "give me your facebook id"

---

## Step 5: Monitor Logs

### Real-time Logs:
1. Azure Portal → Your Web App
2. "Log stream" (left menu)
3. Look for:
   - ✅ `"Bot initialized successfully"`
   - ✅ `"Loaded semantic embeddings model: all-MiniLM-L6-v2"`
   - ❌ Any errors about missing keys or index

### Debug Bot Responses:
The bot now prints debug info in logs:
```
[DEBUG] QUESTION: give me your facebook id
[DEBUG] RETRIEVED CONTEXT:
basic_identity.facebook: https://www.facebook.com/samimreza101
basic_identity.linkedin: https://www.linkedin.com/in/samim-reza
```

If you don't see the Facebook URL in retrieved context, the vector search isn't finding it.

---

## Step 6: Test Locally vs Azure

### Local Test:
```bash
python3 app.py
# Visit http://localhost:8000
# Ask: "give me your facebook id"
# Should return: https://www.facebook.com/samimreza101
```

### Azure Test:
```
https://your-app-name.azurewebsites.net
Ask: "give me your facebook id"
```

Both should give the same answer!

---

## Common Issues & Solutions

### Issue 1: Different answers locally vs Azure
**Cause**: Using different Pinecone indexes
**Fix**: 
- Set `PINECONE_INDEX_NAME=samim-chatbot` in Azure
- Ensure data is uploaded to "samim-chatbot" index

### Issue 2: "I don't have that information" for everything
**Cause**: Pinecone index is empty or wrong index
**Fix**: 
- Check `/api/debug/config` - verify namespaces have vectors
- If empty, run `python3 update_pinecone.py` locally

### Issue 3: Bot initialized but can't find answers
**Cause**: Vector search not finding relevant docs
**Fix**:
- Increased `k=5` for personal namespace (more results)
- Check logs for retrieved context
- May need to adjust search parameters

### Issue 4: Timeout during deployment
**Cause**: Large dependencies (sentence-transformers)
**Fix**: Already handled - startup command has 600s timeout

### Issue 5: Module not found errors
**Cause**: requirements.txt missing dependencies
**Fix**: requirements.txt includes all needed packages

---

## Quick Checklist

Before deploying to Azure:
- [ ] Pinecone index exists: `samim-chatbot`
- [ ] Data uploaded: Run `python3 update_pinecone.py`
- [ ] Data verified: Run `python3 test_pinecone.py`
- [ ] Code committed: `git push origin master`

In Azure Portal:
- [ ] Environment variables set (3 variables)
- [ ] Startup command configured
- [ ] Deployment completed successfully
- [ ] Debug endpoint checked: `/api/debug/config`
- [ ] Log stream shows no errors

Test:
- [ ] Local works: "give me your facebook id" ✓
- [ ] Azure works: Same question on deployed URL ✓

---

## Debug Commands

### Check what indexes exist:
```python
from pinecone import Pinecone
import os
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
print([idx.name for idx in pc.list_indexes()])
```

### Check index stats:
```python
index = pc.Index("samim-chatbot")
print(index.describe_index_stats())
```

### Test search manually:
```bash
python3 test_pinecone.py
```

---

## Still Not Working?

1. **Check Azure Log Stream** - Errors during startup?
2. **Visit `/api/debug/config`** - What does it show?
3. **Check Pinecone Dashboard** - Does index have data?
4. **Test locally first** - Does it work on your machine?
5. **Compare environment variables** - Same keys locally and Azure?

Need more help? Check the logs and share:
- Output from `/api/debug/config`
- Log stream output during a query
- Output from local `python3 test_pinecone.py`
