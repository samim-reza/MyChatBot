# Fix Summary: Azure Deployment Issue

## Problem
Chatbot works locally but returns "I don't have that information" for Facebook/email queries on Azure deployment.

## Root Cause
**Index name mismatch**: Code was using different index names:
- `recreate_pinecone_index.py`: Created "samim-chatbot"
- Other files: Used "my-chat-bot"

This meant local and Azure were potentially reading from different indexes.

## Changes Made

### 1. Standardized Index Name
**Files Changed:**
- `services/llm_service.py`: Changed default from "my-chat-bot" → "samim-chatbot"
- `update_pinecone.py`: Changed from "my-chat-bot" → "samim-chatbot"
- `test_pinecone.py`: Changed from "my-chat-bot" → "samim-chatbot"

### 2. Added Environment Variable Support
**File:** `services/llm_service.py`
- Added `PINECONE_INDEX_NAME` env variable
- Falls back to "samim-chatbot" if not set
- Allows configuring index name in Azure without code changes

### 3. Increased Context Retrieval
**File:** `bot.py`
- Changed personal namespace `k=2` → `k=5`
- Retrieves more documents to catch contact info (email, Facebook, LinkedIn, etc.)
- Helps ensure relevant context is found

### 4. Added Debug Endpoint
**File:** `app.py`
- New endpoint: `GET /api/debug/config`
- Shows:
  - If API keys are configured
  - Which index name is being used
  - If index exists
  - Namespace statistics (vector counts)
  - Bot initialization status

### 5. Documentation
**New Files:**
- `AZURE_DEBUGGING.md`: Complete debugging guide
- Step-by-step troubleshooting
- How to check configuration
- Common issues and solutions

## What To Do Now

### Step 1: Verify Data is in Correct Index
```bash
# Recreate index (ensures correct name and dimensions)
python3 recreate_pinecone_index.py

# Upload your data
python3 update_pinecone.py

# Verify it worked
python3 test_pinecone.py
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Fix: Standardize Pinecone index name and add debug endpoint"
git push origin master
```

### Step 3: Configure Azure
In Azure Portal → Configuration → Application settings:
```
GROQ_API_KEY = your_key
PINECONE_API_KEY = your_key
PINECONE_INDEX_NAME = samim-chatbot
```
Save and Restart!

### Step 4: Verify Deployment
After Azure redeploys (5-10 min):
1. Visit: `https://your-app.azurewebsites.net/api/debug/config`
2. Check that namespaces show vector counts
3. Test: "give me your facebook id"

## Expected Behavior

**Before Fix:**
- Local: ✅ Returns Facebook URL
- Azure: ❌ "I don't have that information"

**After Fix:**
- Local: ✅ Returns Facebook URL  
- Azure: ✅ Returns Facebook URL

## Technical Details

### Why It Worked Locally
- May have had old data in "my-chat-bot" index
- Or was creating index on the fly with correct data

### Why It Failed on Azure
- Different index name
- Empty index or missing data
- Environment variables not set

### The Fix
- All code now uses same index: "samim-chatbot"
- Environment variable allows override if needed
- Debug endpoint helps diagnose issues
- Better documentation for troubleshooting

## Monitoring

Use the new debug endpoint to monitor:
```bash
curl https://your-app.azurewebsites.net/api/debug/config
```

Check Azure Log Stream for:
```
[DEBUG] QUESTION: give me your facebook id
[DEBUG] RETRIEVED CONTEXT:
basic_identity.facebook: https://www.facebook.com/samimreza101
```

If context doesn't show the Facebook URL, check:
1. Is data uploaded? (run update_pinecone.py)
2. Is correct index being used? (check debug endpoint)
3. Are embeddings working? (check logs for "Loaded semantic embeddings model")

---

**Next Step**: Follow the "What To Do Now" section above to deploy the fix!
