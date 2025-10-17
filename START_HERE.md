# 🎯 START HERE - Docker Hub Deployment (Updated)

## ⚠️ Important Update

**Azure Container Registry (ACR) is not available** in your Azure for Students subscription.

**Solution:** Using **Docker Hub** instead (free, public registry) ✅

---

## 📋 What You Need (4 things)

1. **Docker Hub account** (free) - https://hub.docker.com/signup
2. **Docker Hub access token** - Generated in Docker Hub settings
3. **Azure service principal** - For GitHub Actions to deploy
4. **Your Groq API key** - From Groq dashboard

---

## 🚀 Quick Deploy (15 Minutes)

### 1. Create Docker Hub Token (3 min)

```
1. Login to hub.docker.com
2. Account Settings → Security → New Access Token
3. Name: "GitHub Actions"
4. Permissions: Read, Write, Delete
5. Generate and COPY the token
```

### 2. Create Azure Service Principal (2 min)

```bash
az ad sp create-for-rbac \
  --name "github-actions-samim-chatbot" \
  --role contributor \
  --scopes /subscriptions/28efd115-eeaf-4484-a8dd-f6250f5d5113/resourceGroups/mychatbot \
  --sdk-auth
```

**Copy the entire JSON output!**

### 3. Add GitHub Secrets (3 min)

Go to: https://github.com/samim-reza/MyChatBot/settings/secrets/actions

Add these 4 secrets:

| Secret | Value |
|--------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Token from step 1 |
| `AZURE_CREDENTIALS` | JSON from step 2 |
| `GROQ_API_KEY` | Your Groq key |

### 4. Configure Azure (2 min)

**Replace YOUR_DOCKERHUB_USERNAME** with your actual username:

```bash
az webapp config container set \
  --name samim \
  --resource-group mychatbot \
  --docker-custom-image-name YOUR_DOCKERHUB_USERNAME/samim-chatbot:latest \
  --docker-registry-server-url https://index.docker.io

az webapp config appsettings set \
  --name samim \
  --resource-group mychatbot \
  --settings GROQ_API_KEY="YOUR_GROQ_KEY" WEBSITES_PORT=8000

az webapp deployment container config \
  --name samim \
  --resource-group mychatbot \
  --enable-cd true
```

### 5. Deploy! (1 min + 10 min wait)

```bash
git push origin master
```

Then:
- Go to https://github.com/samim-reza/MyChatBot/actions
- Watch the workflow (takes ~10-15 min)
- Wait for green checkmarks ✅

### 6. Test (1 min)

```bash
curl https://samim.azurewebsites.net/health
# Should return: {"status":"healthy","bot_initialized":true}

open https://samim.azurewebsites.net
# Ask: "give me your facebook id"
# Should return: https://www.facebook.com/samimreza101
```

---

## 📚 Detailed Guides

- **Quick Guide**: `DOCKER_HUB_DEPLOYMENT.md`
- **Full Guide**: `DOCKER_DEPLOYMENT_GUIDE.md`
- **Action Plan**: `ACTION_PLAN.md`

---

## ✅ Benefits

- ✅ **Free** - Docker Hub public registry is free
- ✅ **No ACR needed** - Works with student subscription
- ✅ **Auto-deploy** - Every push deploys automatically
- ✅ **Fast** - Builds in GitHub Actions (unlimited memory)

---

## 🔑 Key Differences from Original Plan

| Original | Updated |
|----------|---------|
| Azure Container Registry (ACR) | Docker Hub |
| 5 GitHub secrets | 4 GitHub secrets |
| ACR credentials | Docker Hub token |
| Private registry | Public registry* |

*Your code is already public on GitHub, so this is fine!

---

## 🆘 Having Issues?

See `DOCKER_HUB_DEPLOYMENT.md` → Troubleshooting section

Common issues:
- Wrong Docker Hub username (case-sensitive!)
- Used password instead of access token
- Forgot to set `WEBSITES_PORT=8000`
- Missing `GROQ_API_KEY`

---

## 🎯 Current Setup

- **Azure Web App**: `samim` (already exists)
- **Resource Group**: `mychatbot` (already exists)
- **Location**: Southeast Asia
- **Docker Registry**: Docker Hub (public)
- **CI/CD**: GitHub Actions

---

**Ready? Follow the 6 steps above!** 🚀

Time: ~15 minutes total (3 min setup + 10 min deploy + 2 min test)
