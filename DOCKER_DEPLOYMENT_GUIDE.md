# Docker Deployment to Azure - Complete Guide

This guide walks you through deploying your chatbot to Azure using Docker containers.

## 🎯 Why Docker?

- ✅ **No build memory issues** - Build locally or in GitHub Actions (unlimited resources)
- ✅ **Consistent environment** - Same image runs everywhere (local, staging, production)
- ✅ **Faster deployments** - Azure just pulls and runs the image
- ✅ **Better control** - Full control over dependencies and build process
- ✅ **Portable** - Can deploy to any cloud provider (Azure, AWS, GCP, DigitalOcean)

## 📋 Prerequisites

1. Azure subscription
2. GitHub account (for CI/CD)
3. Docker installed locally (for testing)
4. Azure CLI installed (optional, for CLI deployment)

## 🚀 Deployment Options

### Option 1: GitHub Actions (Recommended - Automated)

This is the **easiest and most automated** approach. Every push to `master` automatically builds and deploys.

#### Step 1: Create Azure Container Registry (ACR)

```bash
# Login to Azure
az login

# Create resource group (if you don't have one)
az group create --name my-chatbot-rg --location eastus

# Create Azure Container Registry
az acr create \
  --resource-group my-chatbot-rg \
  --name samimchatbotregistry \
  --sku Basic

# Enable admin access
az acr update --name samimchatbotregistry --admin-enabled true

# Get credentials
az acr credential show --name samimchatbotregistry
```

**Save these values:**
- Login Server: `samimchatbotregistry.azurecr.io`
- Username: (from output)
- Password: (from output)

#### Step 2: Create/Update Azure Web App for Containers

```bash
# Create App Service Plan (Linux)
az appservice plan create \
  --name chatbot-plan \
  --resource-group my-chatbot-rg \
  --sku B1 \
  --is-linux

# Create Web App for Containers
az webapp create \
  --resource-group my-chatbot-rg \
  --plan chatbot-plan \
  --name samim \
  --deployment-container-image-name samimchatbotregistry.azurecr.io/samim-chatbot:latest

# Configure registry credentials
az webapp config container set \
  --name samim \
  --resource-group my-chatbot-rg \
  --docker-custom-image-name samimchatbotregistry.azurecr.io/samim-chatbot:latest \
  --docker-registry-server-url https://samimchatbotregistry.azurecr.io \
  --docker-registry-server-user <username-from-step1> \
  --docker-registry-server-password <password-from-step1>

# Enable continuous deployment (webhook)
az webapp deployment container config \
  --name samim \
  --resource-group my-chatbot-rg \
  --enable-cd true

# Configure environment variables
az webapp config appsettings set \
  --resource-group my-chatbot-rg \
  --name samim \
  --settings GROQ_API_KEY="your-groq-api-key-here"

# Configure port (Docker exposes 8000)
az webapp config appsettings set \
  --resource-group my-chatbot-rg \
  --name samim \
  --settings WEBSITES_PORT=8000
```

#### Step 3: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

1. **AZURE_REGISTRY_LOGIN_SERVER**
   - Value: `samimchatbotregistry.azurecr.io`

2. **AZURE_REGISTRY_USERNAME**
   - Value: (username from Step 1)

3. **AZURE_REGISTRY_PASSWORD**
   - Value: (password from Step 1)

4. **GROQ_API_KEY**
   - Value: Your Groq API key

5. **AZURE_WEBAPP_PUBLISH_PROFILE**
   - Get from Azure Portal:
     - Go to your Web App → **Deployment Center** → **Manage publish profile**
     - Click **Download publish profile**
     - Copy the entire XML content
   - Or via CLI:
     ```bash
     az webapp deployment list-publishing-profiles \
       --name samim \
       --resource-group my-chatbot-rg \
       --xml
     ```

6. **DOCKERHUB_USERNAME** (Optional - for caching)
   - Your Docker Hub username

7. **DOCKERHUB_TOKEN** (Optional - for caching)
   - Your Docker Hub access token

#### Step 4: Update Workflow File

Edit `.github/workflows/docker-azure-deploy.yml` and replace:
- `AZURE_WEBAPP_NAME: samim` with your actual Azure Web App name

#### Step 5: Push to GitHub

```bash
git add .
git commit -m "Add Docker deployment with GitHub Actions"
git push origin master
```

GitHub Actions will automatically:
1. ✅ Build Docker image
2. ✅ Test the image (health check)
3. ✅ Push to Azure Container Registry
4. ✅ Deploy to Azure Web App

Monitor progress: **GitHub** → **Actions** tab

#### Step 6: Verify Deployment

```bash
# Check if app is running
curl https://samim.azurewebsites.net/health

# Expected response:
# {"status":"healthy","bot_initialized":true}

# Test the chatbot
curl https://samim.azurewebsites.net/
```

---

### Option 2: Manual Docker Build and Push

If you prefer manual control or want to test locally first:

#### Step 1: Build Locally

```bash
# Build Docker image
docker build -t samim-chatbot:latest .

# Test locally
docker run -d -p 8000:8000 \
  -e GROQ_API_KEY="your-groq-api-key" \
  --name chatbot-test \
  samim-chatbot:latest

# Check health
curl http://localhost:8000/health

# Test chatbot
open http://localhost:8000

# Stop test container
docker stop chatbot-test
docker rm chatbot-test
```

#### Step 2: Push to Azure Container Registry

```bash
# Login to ACR
az acr login --name samimchatbotregistry

# Tag image
docker tag samim-chatbot:latest \
  samimchatbotregistry.azurecr.io/samim-chatbot:latest

# Push to ACR
docker push samimchatbotregistry.azurecr.io/samim-chatbot:latest
```

#### Step 3: Deploy to Azure

```bash
# Update Web App to use new image
az webapp config container set \
  --name samim \
  --resource-group my-chatbot-rg \
  --docker-custom-image-name samimchatbotregistry.azurecr.io/samim-chatbot:latest

# Restart Web App
az webapp restart --name samim --resource-group my-chatbot-rg
```

---

## 🔍 Troubleshooting

### Check Azure Logs

```bash
# Stream logs
az webapp log tail --name samim --resource-group my-chatbot-rg

# Or in Azure Portal:
# Web App → Monitoring → Log stream
```

### Common Issues

#### 1. Container won't start

**Check:**
- Port configuration: `WEBSITES_PORT=8000` is set
- Environment variables: `GROQ_API_KEY` is set
- Container logs: `az webapp log tail`

**Fix:**
```bash
az webapp config appsettings set \
  --resource-group my-chatbot-rg \
  --name samim \
  --settings WEBSITES_PORT=8000
```

#### 2. Health check failing

**Check health endpoint:**
```bash
docker run -p 8000:8000 -e GROQ_API_KEY="key" samim-chatbot:latest
curl http://localhost:8000/health
```

#### 3. Image pull authentication failed

**Fix registry credentials:**
```bash
az webapp config container set \
  --name samim \
  --resource-group my-chatbot-rg \
  --docker-registry-server-url https://samimchatbotregistry.azurecr.io \
  --docker-registry-server-user <username> \
  --docker-registry-server-password <password>
```

#### 4. ChromaDB database not included

**Check `.dockerignore`** - Make sure `chroma_db/` is **NOT** ignored.

Current `.dockerignore` already handles this correctly.

---

## 📊 Monitoring

### Azure Portal

1. **Metrics**: Web App → Monitoring → Metrics
   - CPU usage
   - Memory usage
   - HTTP requests
   - Response times

2. **Application Insights** (Optional):
   ```bash
   az monitor app-insights component create \
     --app chatbot-insights \
     --location eastus \
     --resource-group my-chatbot-rg
   ```

### Logs

```bash
# Enable application logging
az webapp log config \
  --name samim \
  --resource-group my-chatbot-rg \
  --application-logging filesystem \
  --level information

# Download logs
az webapp log download \
  --name samim \
  --resource-group my-chatbot-rg \
  --log-file logs.zip
```

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Test chatbot: `https://samim.azurewebsites.net`
2. ✅ Test health: `https://samim.azurewebsites.net/health`
3. ✅ Ask "give me your facebook id" - should return correct URL
4. ✅ Configure custom domain (optional)
5. ✅ Set up HTTPS/SSL (Azure provides free SSL)
6. ✅ Configure scaling rules (if needed)

---

## 🔒 Security Best Practices

1. **Never commit secrets** - Use GitHub Secrets and Azure Key Vault
2. **Use managed identities** - Instead of ACR passwords (advanced)
3. **Enable HTTPS only** - Azure Portal → TLS/SSL settings
4. **Restrict CORS** - Update `app.py` to allow only your domain
5. **Regular updates** - Keep dependencies updated

---

## 💰 Cost Optimization

**Current setup (Basic/B1 tier):**
- ~$13-15/month
- 1.75 GB RAM, 1 vCPU
- Suitable for low-medium traffic

**Free tier alternative:**
- Azure Container Instances (pay-per-second)
- Azure App Service Free tier (limited, no custom domains)

**Scale up/down:**
```bash
# Scale to Free tier (limited features)
az appservice plan update \
  --name chatbot-plan \
  --resource-group my-chatbot-rg \
  --sku FREE

# Scale to Standard (auto-scaling, staging slots)
az appservice plan update \
  --name chatbot-plan \
  --resource-group my-chatbot-rg \
  --sku S1
```

---

## 📚 Additional Resources

- [Azure Container Registry Docs](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Azure Web App for Containers](https://docs.microsoft.com/en-us/azure/app-service/quickstart-custom-container)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)

---

## 🆘 Need Help?

**GitHub Actions failing?**
- Check **Actions** tab → Click failed workflow → View logs
- Common issue: Missing secrets (check Step 3)

**Azure deployment failing?**
- Check logs: `az webapp log tail`
- Verify environment variables
- Check health endpoint

**Still stuck?**
- Check Azure Portal → Web App → Diagnose and solve problems
- Review container logs
- Verify Docker image works locally first
