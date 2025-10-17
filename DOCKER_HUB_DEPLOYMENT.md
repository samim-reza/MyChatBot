# Docker Hub Deployment Guide (Azure for Students)

Since Azure Container Registry is not available in your Azure for Students subscription, we'll use **Docker Hub** (free) instead.

## 🎯 Quick Setup - 10 Minutes

### Step 1: Create Docker Hub Account (2 min)

1. Go to https://hub.docker.com/signup
2. Create free account (if you don't have one)
3. Verify your email

### Step 2: Create Docker Hub Access Token (2 min)

1. Login to Docker Hub
2. Click your username → **Account Settings**
3. Click **Security** → **New Access Token**
4. Token description: "GitHub Actions"
5. Access permissions: **Read, Write, Delete**
6. Click **Generate**
7. **Copy the token** (you won't see it again!)

### Step 3: Create Azure Service Principal (3 min)

```bash
# Get your subscription ID
az account show --query id -o tsv

# Create service principal (replace SUBSCRIPTION_ID)
az ad sp create-for-rbac \
  --name "github-actions-samim-chatbot" \
  --role contributor \
  --scopes /subscriptions/28efd115-eeaf-4484-a8dd-f6250f5d5113/resourceGroups/mychatbot \
  --sdk-auth
```

**Copy the entire JSON output!** It looks like:
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  "..."
}
```

### Step 4: Add GitHub Secrets (3 min)

Go to: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Add these **4 secrets**:

| Secret Name | Value | Where to Get |
|------------|-------|--------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | From Step 1 |
| `DOCKERHUB_TOKEN` | Access token | From Step 2 (copied) |
| `AZURE_CREDENTIALS` | Entire JSON output | From Step 3 (copied) |
| `GROQ_API_KEY` | Your Groq API key | Your Groq dashboard |

### Step 5: Configure Azure Web App for Docker Hub (2 min)

```bash
# Update to use Docker Hub (replace YOUR_DOCKERHUB_USERNAME)
az webapp config container set \
  --name samim \
  --resource-group mychatbot \
  --docker-custom-image-name YOUR_DOCKERHUB_USERNAME/samim-chatbot:latest \
  --docker-registry-server-url https://index.docker.io

# Set environment variables
az webapp config appsettings set \
  --name samim \
  --resource-group mychatbot \
  --settings GROQ_API_KEY="YOUR_GROQ_KEY" WEBSITES_PORT=8000

# Enable continuous deployment webhook
az webapp deployment container config \
  --name samim \
  --resource-group mychatbot \
  --enable-cd true
```

### Step 6: Push and Deploy! (1 min)

```bash
cd /home/samim01/Code/MyChatBot
git add .
git commit -m "Update to Docker Hub deployment"
git push origin master
```

### Step 7: Monitor (10 min)

1. Go to **GitHub → Actions** tab
2. Watch the workflow run
3. All steps should turn green ✅
4. Total time: ~10-15 minutes

### Step 8: Verify

```bash
# Check health
curl https://samim.azurewebsites.net/health

# Should return:
# {"status":"healthy","bot_initialized":true}

# Open in browser
open https://samim.azurewebsite s.net
```

---

## 🎯 What Changed

### From Original Plan:
- ❌ Azure Container Registry (ACR) - Not available in student subscription
- ✅ Docker Hub - Free, public registry

### Benefits of Docker Hub:
- ✅ **Free** - Unlimited public repositories
- ✅ **Widely used** - Industry standard
- ✅ **Fast** - Good CDN for image pulls
- ✅ **GitHub integration** - Works seamlessly with Actions

---

## 🔍 Troubleshooting

### GitHub Actions failing with "unauthorized"?

**Check Docker Hub credentials:**
- Verify `DOCKERHUB_USERNAME` is correct (case-sensitive!)
- Verify `DOCKERHUB_TOKEN` is the access token (not your password!)
- Try regenerating the token if needed

### Azure can't pull image?

**Check Azure configuration:**
```bash
# Verify Docker Hub is configured
az webapp config container show \
  --name samim \
  --resource-group mychatbot

# Should show:
# "dockerRegistryServerUrl": "https://index.docker.io"
```

**Update if needed:**
```bash
az webapp config container set \
  --name samim \
  --resource-group mychatbot \
  --docker-custom-image-name YOUR_DOCKERHUB_USERNAME/samim-chatbot:latest \
  --docker-registry-server-url https://index.docker.io
```

### Container won't start?

**Check logs:**
```bash
az webapp log tail --name samim --resource-group mychatbot
```

**Common issues:**
- `WEBSITES_PORT=8000` not set
- `GROQ_API_KEY` missing
- Image name incorrect

**Fix:**
```bash
az webapp config appsettings set \
  --name samim \
  --resource-group mychatbot \
  --settings GROQ_API_KEY="your-key" WEBSITES_PORT=8000

az webapp restart --name samim --resource-group mychatbot
```

---

## 💰 Cost

**Docker Hub (Free tier):**
- ✅ Unlimited public repositories
- ✅ 1 private repository
- ✅ No cost!

**Azure Web App:**
- Your existing plan (Free or Basic tier)
- No additional cost

**Total additional cost: $0** 🎉

---

## 🔒 Security Note

Since we're using Docker Hub **public** repository, your Docker image will be publicly visible. This is fine because:

- ✅ Your code is already public on GitHub
- ✅ No secrets in the image (they're environment variables)
- ✅ `personal.json` is not included (in .dockerignore)

If you need **private** Docker images:
- Docker Hub: $5/month (unlimited private repos)
- GitHub Container Registry: Free (alternative to Docker Hub)

---

## 📊 Workflow Overview

```
1. Push to GitHub
2. GitHub Actions triggers
3. Build Docker image
4. Push to Docker Hub (public)
5. Azure pulls from Docker Hub
6. Deploy and restart
```

---

## 🚀 Next Steps After Successful Deployment

1. ✅ Test: `https://samim.azurewebsites.net`
2. ✅ Ask "give me your facebook id"
3. ✅ Verify no "Session is closed" errors
4. ✅ Configure custom domain (optional)
5. ✅ Set up monitoring alerts (optional)

---

## 📚 Additional Resources

- **Docker Hub Docs**: https://docs.docker.com/docker-hub/
- **Azure Web Apps for Containers**: https://learn.microsoft.com/azure/app-service/quickstart-custom-container
- **GitHub Actions**: https://docs.github.com/actions

---

## ✅ Checklist

Before pushing:
- [ ] Docker Hub account created
- [ ] Docker Hub access token generated
- [ ] Azure service principal created
- [ ] All 4 GitHub secrets added
- [ ] Azure Web App configured for Docker Hub
- [ ] Environment variables set (GROQ_API_KEY, WEBSITES_PORT)

After pushing:
- [ ] GitHub Actions workflow completes successfully
- [ ] Health endpoint works
- [ ] Chat interface loads
- [ ] Bot responds correctly

---

**Ready to deploy? Follow the steps above!** 🚀
