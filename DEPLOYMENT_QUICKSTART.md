# 🚀 Azure Deployment - Quick Start

## What's Been Prepared

✅ **Requirements**: Cleaned up and organized with all dependencies
✅ **Startup Command**: Configured for Azure in `startup.txt`
✅ **Python Version**: Set to 3.10 in `.python_version`
✅ **Documentation**: Complete deployment guide in `AZURE_DEPLOYMENT.md`
✅ **Deployment Script**: `deploy.sh` for quick GitHub push
✅ **GitHub Actions**: Optional automated deployment workflow
✅ **Security**: `.env` already in `.gitignore`

## Quick Deployment Steps

### 1. Push to GitHub (5 minutes)
```bash
# Option A: Use the deploy script
./deploy.sh

# Option B: Manual
git add .
git commit -m "Prepare for Azure deployment"
git push origin master
```

### 2. Deploy on Azure Portal (10 minutes)

**Create Web App:**
1. Go to https://portal.azure.com
2. Create a resource → Web App
3. Configure:
   - Name: `samim-chatbot` (or your choice)
   - Runtime: Python 3.10
   - OS: Linux
   - Plan: Free F1 or Basic B1

**Connect GitHub:**
1. Deployment Center → Source: GitHub
2. Authorize and select your repo
3. Branch: master
4. Save

**Set Environment Variables:**
1. Configuration → Application settings
2. Add:
   - `GROQ_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX_NAME` = `samim-chatbot`
3. Save

**Configure Startup:**
1. Configuration → General settings
2. Startup Command:
   ```
   gunicorn --bind=0.0.0.0 --timeout 600 --worker-class uvicorn.workers.UvicornWorker app:app
   ```
3. Save

**Deploy:**
1. Deployment Center → Sync
2. Wait 5-10 minutes
3. Visit your URL! 🎉

## Your App Will Be Live At:
```
https://your-app-name.azurewebsites.net
```

## Cost

- **Free Tier (F1)**: $0/month
  - 60 CPU min/day
  - Sleeps after 20 min idle
  - Good for testing

- **Basic Tier (B1)**: ~$13/month
  - Always On
  - Better performance
  - Recommended for production

## Need Help?

📚 **Full Guide**: See `AZURE_DEPLOYMENT.md` for detailed instructions
🐛 **Troubleshooting**: Check "Log stream" in Azure Portal
💬 **Support**: Azure Portal → Help + support

## What Happens Next?

Every time you push to GitHub:
1. Azure detects changes
2. Automatically rebuilds
3. Redeploys in 5-10 minutes
4. No manual steps needed!

---

**Ready to deploy? Run**: `./deploy.sh`
