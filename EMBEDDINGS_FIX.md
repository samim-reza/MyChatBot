# 🔥 CRITICAL FIX: Azure Using Wrong Embeddings

## Problem Identified ✅

**Your local works**: Uses semantic embeddings (sentence-transformers)
**Azure doesn't work**: Falls back to hash-based embeddings

**Why this breaks everything:**
- Data uploaded with semantic embeddings (384-dim vectors from all-MiniLM-L6-v2)
- Azure uses hash embeddings (random vectors based on text hash)
- Search for "facebook" with hash embedding ≠ stored semantic embedding
- Result: No matches found, bot says "I don't have that information"

## Root Cause

Azure is failing to install `sentence-transformers` because:
1. Missing dependency: `torch` (PyTorch, required by sentence-transformers)
2. No version specified in requirements.txt
3. Installation timeout (large model downloads)

## Fix Applied

### 1. Updated requirements.txt
```diff
- sentence-transformers
- huggingface_hub
+ torch>=2.0.0
+ sentence-transformers>=2.2.0
+ huggingface-hub>=0.16.0
```

### 2. Increased timeout in startup.txt
```
--timeout 900  (was 600)
```

### 3. Added diagnostic logging
Embeddings now print:
- ✅ Success: "Loaded semantic embeddings model"
- ❌ Failure: "ERROR: Could not load semantic model" + full traceback

### 4. Enhanced debug endpoint
`/api/debug/config` now shows:
```json
{
  "embeddings_type": "semantic" or "hash-based (NOT WORKING)",
  "warning": "If embeddings_type is 'hash-based', searches will NOT work!"
}
```

## What You Need to Do

### Step 1: Push the Fix
```bash
git add .
git commit -m "Fix: Add torch dependency and increase timeout for Azure"
git push origin master
```

### Step 2: Update Azure Startup Command
Azure Portal → Your Web App → Configuration → General settings

**Startup Command:**
```
gunicorn --bind=0.0.0.0 --timeout 900 --workers 1 --worker-class uvicorn.workers.UvicornWorker app:app
```

Save and Restart!

### Step 3: Wait for Deployment (~15 minutes)
Azure needs time to:
1. Pull new code (2 min)
2. Install dependencies (10 min - torch is large!)
3. Start the app (1 min)

**Monitor**: Deployment Center → Logs

### Step 4: Check the Debug Endpoint

Visit: `https://your-app.azurewebsites.net/api/debug/config`

**Look for:**
```json
{
  "embeddings_type": "semantic",  ← MUST say "semantic"!
  "namespaces": {
    "personal": {"vector_count": 19}  ← MUST have vectors!
  }
}
```

**If it says "hash-based":**
- Check Azure Log Stream for the error
- Look for "❌ ERROR: Could not load semantic model"
- The error will tell you what's missing

### Step 5: Check Azure Logs

Azure Portal → Log stream

**Look for during startup:**
```
✅ Loaded semantic embeddings model: all-MiniLM-L6-v2
✅ Model dimension: 384
Bot initialized successfully
```

**If you see:**
```
❌ ERROR: Could not load semantic model
```

Then torch/sentence-transformers didn't install. Possible causes:
- Installation timeout (need to increase further)
- Memory limits on Free tier (upgrade to Basic B1)
- Download failed (retry deployment)

### Step 6: Test

Visit: `https://your-app.azurewebsites.net`

Ask: **"give me your facebook id"**

Expected: ✅ `https://www.facebook.com/samimreza101`

---

## Why Free Tier Might Not Work

**Azure Free F1 tier limitations:**
- 1 GB RAM
- 60 CPU minutes/day
- Very slow
- torch + sentence-transformers = ~500MB

**This might cause:**
- Out of memory during installation
- Timeout during model loading
- Slow startup (> 15 minutes)

**Solution: Upgrade to Basic B1 ($13/month)**
- 1.75 GB RAM
- No time limits
- Much faster
- Recommended for ML models

---

## Alternative: Use OpenAI Embeddings

If torch is too heavy for Azure, switch to OpenAI embeddings:

### Option A: OpenAI API (Recommended)
```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=os.getenv("OPENAI_API_KEY")
)
```

**Pros:**
- No local model (tiny memory footprint)
- Fast, reliable
- Cheap ($0.02 per 1M tokens)

**Cons:**
- Need OpenAI API key
- Small cost per query

### Option B: HuggingFace API
```python
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
```

**Pros:**
- Free
- Uses HuggingFace hosting

**Cons:**
- Requires API key
- Rate limits on free tier

---

## Quick Decision Tree

**Do you have Basic B1 or higher on Azure?**
- Yes → Current fix should work (torch + sentence-transformers)
- No (Free F1) → Switch to OpenAI embeddings or upgrade tier

**Check after deployment:**
```bash
curl https://your-app.azurewebsites.net/api/debug/config
```

If `"embeddings_type": "semantic"` → ✅ Working!
If `"embeddings_type": "hash-based"` → ❌ Not working, need alternative

---

## Files Changed

1. `requirements.txt` - Added torch and version pins
2. `startup.txt` - Increased timeout to 900s
3. `services/embeddings.py` - Better error logging
4. `app.py` - Debug endpoint shows embedding status

**Next:** Commit and push, then monitor Azure deployment!

---

## Expected Timeline

- **Now**: Push to GitHub (1 min)
- **+2 min**: Azure detects push
- **+15 min**: Dependencies install (torch is 800MB!)
- **+16 min**: App starts
- **+17 min**: Test and verify ✅

**Total: ~20 minutes** (vs 10 min without torch)

Be patient! Torch takes time to install.
