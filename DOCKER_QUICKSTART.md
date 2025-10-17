# Quick Docker Deployment Steps

## 🚀 Fast Track - Get Running in 15 Minutes

### Prerequisites
- Azure account
- GitHub account  
- Docker installed locally

### Step 1: Azure Container Registry (3 min)

```bash
# Login to Azure
az login

# Create ACR (replace 'samimchatbotregistry' with your unique name)
az acr create --name samimchatbotregistry --resource-group my-chatbot-rg --sku Basic --admin-enabled true

# Get credentials (save these!)
az acr credential show --name samimchatbotregistry
```

**Save:**
- Login Server: `samimchatbotregistry.azurecr.io`
- Username & Password from output

### Step 2: Azure Web App (2 min)

```bash
# Create Web App for Containers
az webapp create \
  --name samim \
  --resource-group my-chatbot-rg \
  --plan chatbot-plan \
  --deployment-container-image-name samimchatbotregistry.azurecr.io/samim-chatbot:latest

# Configure registry
az webapp config container set \
  --name samim \
  --resource-group my-chatbot-rg \
  --docker-registry-server-url https://samimchatbotregistry.azurecr.io \
  --docker-registry-server-user <YOUR_ACR_USERNAME> \
  --docker-registry-server-password <YOUR_ACR_PASSWORD>

# Set environment variables
az webapp config appsettings set \
  --name samim \
  --resource-group my-chatbot-rg \
  --settings GROQ_API_KEY="your-groq-key" WEBSITES_PORT=8000

# Enable continuous deployment
az webapp deployment container config --name samim --resource-group my-chatbot-rg --enable-cd true
```

### Step 3: GitHub Secrets (5 min)

Go to GitHub repo → **Settings** → **Secrets** → Add these:

| Secret Name | Value | Where to Get |
|------------|-------|--------------|
| `AZURE_REGISTRY_LOGIN_SERVER` | `samimchatbotregistry.azurecr.io` | From Step 1 |
| `AZURE_REGISTRY_USERNAME` | `<username>` | From `az acr credential show` |
| `AZURE_REGISTRY_PASSWORD` | `<password>` | From `az acr credential show` |
| `GROQ_API_KEY` | `<your-groq-key>` | Your Groq dashboard |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | `<xml-content>` | See below ⬇️ |

**Get Publish Profile:**
```bash
az webapp deployment list-publishing-profiles --name samim --resource-group my-chatbot-rg --xml
```
Copy the entire XML output.

### Step 4: Update Workflow (1 min)

Edit `.github/workflows/docker-azure-deploy.yml`:
- Change `AZURE_WEBAPP_NAME: samim` to your app name (if different)

### Step 5: Deploy! (1 min)

```bash
git add .
git commit -m "Deploy with Docker"
git push origin master
```

✅ Done! Check GitHub Actions tab to monitor deployment.

### Step 6: Verify (3 min)

```bash
# Check health
curl https://samim.azurewebsites.net/health

# Should return:
# {"status":"healthy","bot_initialized":true}

# Test chatbot
open https://samim.azurewebsites.net
```

---

## 🎯 What This Does

1. ✅ **Builds Docker image** in GitHub Actions (unlimited memory)
2. ✅ **Tests the image** (health check)
3. ✅ **Pushes to Azure Container Registry**
4. ✅ **Deploys to Azure Web App**
5. ✅ **Every push to master** auto-deploys

---

## 🐛 Troubleshooting

### GitHub Actions Failing?

**Check secrets:** Settings → Secrets → Make sure all 5 secrets are set

**Check logs:** Actions tab → Click failed run → View logs

### Azure Not Starting?

```bash
# Check logs
az webapp log tail --name samim --resource-group my-chatbot-rg

# Restart
az webapp restart --name samim --resource-group my-chatbot-rg
```

### Still Issues?

1. Test Docker locally:
   ```bash
   docker build -t test .
   docker run -p 8000:8000 -e GROQ_API_KEY="key" test
   curl http://localhost:8000/health
   ```

2. Check Azure Portal:
   - Web App → **Deployment Center** → Logs
   - Web App → **Log stream**

---

## 💡 Tips

- **First deployment takes longer** (~5-10 min) due to Docker image build
- **Subsequent deployments are faster** (~2-3 min) thanks to layer caching
- **Monitor costs** - B1 tier costs ~$13/month
- **Scale if needed** - Upgrade to S1 for auto-scaling

---

## 📚 Full Guide

For detailed explanations, advanced options, and troubleshooting:
→ See `DOCKER_DEPLOYMENT_GUIDE.md`
