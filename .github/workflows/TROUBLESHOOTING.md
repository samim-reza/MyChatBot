# 🔧 Azure Deployment - Troubleshooting Guide

Common issues and solutions for Azure deployment with GitHub Actions.

## 🔴 Build and Push Errors

### Error: "Cache export is not supported for the docker driver"

**Full Error:**
```
ERROR: failed to build: Cache export is not supported for the docker driver.
Switch to a different driver, or turn on the containerd image store, and try again.
```

**Cause:** The Docker driver in GitHub Actions doesn't support advanced cache export features.

**Solution:** ✅ **Already Fixed** in the workflow! We've simplified the caching strategy to:
- Use `cache-from` with the `latest` tag
- Removed `cache-to` which causes the issue
- Use inline cache with `BUILDKIT_INLINE_CACHE=1`

**Verification:**
Check your `azure-deploy.yml` has:
```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile.fast
    push: true
    tags: |
      ${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
      ${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:latest
    cache-from: type=registry,ref=${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:latest
    build-args: |
      BUILDKIT_INLINE_CACHE=1
```

---

## 🔐 Authentication Errors

### Error: "unauthorized: authentication required"

**Cause:** ACR credentials not set or incorrect.

**Solution:**
1. Verify GitHub secrets are set correctly:
   - `ACR_USERNAME`
   - `ACR_PASSWORD`
2. Get fresh credentials:
   ```bash
   az acr credential show --name samimchatbotregistry --resource-group samim-chatbot-rg
   ```
3. Update GitHub secrets if needed

### Error: "AZURE_CREDENTIALS secret not found"

**Cause:** Service principal not configured.

**Solution:**
1. Create service principal:
   ```bash
   SUBSCRIPTION_ID=$(az account show --query id -o tsv)
   az ad sp create-for-rbac \
     --name "samim-chatbot-github-actions" \
     --role contributor \
     --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/samim-chatbot-rg \
     --sdk-auth
   ```
2. Copy entire JSON output
3. Add to GitHub Secrets as `AZURE_CREDENTIALS`

---

## 🐳 Docker Build Errors

### Error: "Error response from daemon: No such image"

**Cause:** First build, no cache available yet.

**Solution:** This is normal! First build will take longer (~5-10 minutes). Subsequent builds will be faster with caching.

### Error: "failed to solve: failed to compute cache key"

**Cause:** Dockerfile syntax error or missing files.

**Solution:**
1. Test build locally:
   ```bash
   docker build -f Dockerfile.fast -t test .
   ```
2. Check Dockerfile.fast syntax
3. Ensure all COPY paths exist

### Error: "COPY failed: file not found"

**Cause:** File in Dockerfile doesn't exist or is in .dockerignore

**Solution:**
1. Check `.dockerignore` doesn't exclude needed files
2. Verify file exists in repository
3. Check file paths are relative to repo root

---

## 🚀 Deployment Errors

### Error: "Web app not found"

**Cause:** App name mismatch or not created.

**Solution:**
1. Verify app exists:
   ```bash
   az webapp show --name samim-chatbot-app --resource-group samim-chatbot-rg
   ```
2. Create if missing:
   ```bash
   az webapp create \
     --resource-group samim-chatbot-rg \
     --plan samim-chatbot-plan \
     --name samim-chatbot-app \
     --deployment-container-image-name samimchatbotregistry.azurecr.io/samim-chatbot:latest
   ```

### Error: "Health check failed"

**Cause:** Application not starting or endpoint doesn't exist.

**Solution:**
1. Wait 2-3 minutes for container startup
2. Check app logs:
   ```bash
   az webapp log tail --name samim-chatbot-app --resource-group samim-chatbot-rg
   ```
3. Verify endpoint exists in code: `/api/debug/config`
4. Check environment variables are set (GROQ_API_KEY)

### Error: "Container didn't respond to HTTP pings"

**Cause:** Wrong port or app not binding to 0.0.0.0

**Solution:**
1. Verify Dockerfile exposes port 8000:
   ```dockerfile
   EXPOSE 8000
   ```
2. Check CMD binds to 0.0.0.0:
   ```dockerfile
   CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
   ```
3. Add WEBSITES_PORT to Azure:
   ```bash
   az webapp config appsettings set \
     --name samim-chatbot-app \
     --resource-group samim-chatbot-rg \
     --settings WEBSITES_PORT=8000
   ```

---

## ⚙️ Environment Variable Errors

### Error: "Did not find openai_api_key"

**Cause:** GROQ_API_KEY not set in Azure Web App.

**Solution:**
1. Check if secret exists in GitHub:
   - Repository → Settings → Secrets → `GROQ_API_KEY`
2. If missing, add it
3. Re-run deployment workflow
4. Manually set in Azure Portal if needed:
   ```bash
   az webapp config appsettings set \
     --name samim-chatbot-app \
     --resource-group samim-chatbot-rg \
     --settings GROQ_API_KEY="your-key-here"
   ```

---

## 🔄 Workflow Errors

### Error: "Process completed with exit code 1"

**Cause:** Generic error, need to check specific step.

**Solution:**
1. Open workflow run in GitHub Actions
2. Expand failing step
3. Read error message
4. Find specific error in this guide

### Error: "Resource group not found"

**Cause:** Resource group doesn't exist or wrong name.

**Solution:**
1. Check resource group exists:
   ```bash
   az group list --query "[?name=='samim-chatbot-rg']"
   ```
2. Create if missing:
   ```bash
   az group create --name samim-chatbot-rg --location eastus
   ```

---

## 🐛 Application Runtime Errors

### Error: "ChromaDB connection failed"

**Cause:** ChromaDB directory not created or permissions issue.

**Solution:**
1. Ensure Dockerfile creates directory:
   ```dockerfile
   RUN mkdir -p chroma_db
   ```
2. Check application logs for details
3. May need to populate ChromaDB first

### Error: "Module not found"

**Cause:** Missing dependency in requirements.txt

**Solution:**
1. Add missing package to `requirements.txt`
2. Test locally:
   ```bash
   pip install -r requirements.txt
   python app.py
   ```
3. Push changes to trigger rebuild

### Error: "Permission denied"

**Cause:** File permissions issue in container.

**Solution:**
1. Check Dockerfile doesn't change ownership unnecessarily
2. Ensure app runs as non-root user if needed
3. Verify file paths are accessible

---

## 📊 Performance Issues

### Issue: "Build takes too long (>10 minutes)"

**Cause:** No caching or downloading dependencies every time.

**Solution:**
1. Ensure inline cache is enabled (already in workflow)
2. First build is always slow (~5-10 min)
3. Subsequent builds should be 1-3 minutes
4. Check layer caching is working:
   - Look for "CACHED" in build logs

### Issue: "App responds slowly"

**Cause:** Free/low tier, cold start, or inefficient code.

**Solution:**
1. Upgrade to B1 tier (from F1):
   ```bash
   az appservice plan update \
     --name samim-chatbot-plan \
     --resource-group samim-chatbot-rg \
     --sku B1
   ```
2. Check application logs for slow operations
3. Optimize vector search if needed

---

## 🔍 Debugging Tips

### View Complete Logs
```bash
# Stream live logs
az webapp log tail --name samim-chatbot-app --resource-group samim-chatbot-rg

# Download all logs
az webapp log download --name samim-chatbot-app --resource-group samim-chatbot-rg

# View specific log stream
az webapp log tail --name samim-chatbot-app --resource-group samim-chatbot-rg --logs http
```

### Check Container Status
```bash
# View app status
az webapp show --name samim-chatbot-app --resource-group samim-chatbot-rg --query state

# View container settings
az webapp config container show --name samim-chatbot-app --resource-group samim-chatbot-rg

# View environment variables
az webapp config appsettings list --name samim-chatbot-app --resource-group samim-chatbot-rg
```

### Test Deployment Manually
```bash
# Build locally
docker build -f Dockerfile.fast -t samimchatbotregistry.azurecr.io/samim-chatbot:test .

# Test locally first
docker run -p 8000:8000 --env-file .env samimchatbotregistry.azurecr.io/samim-chatbot:test

# If works, push to ACR
az acr login --name samimchatbotregistry
docker push samimchatbotregistry.azurecr.io/samim-chatbot:test
```

---

## 🆘 Still Having Issues?

### Checklist
- [ ] All GitHub secrets are set correctly
- [ ] Azure resources exist (resource group, ACR, app service)
- [ ] Service principal has correct permissions
- [ ] Dockerfile builds successfully locally
- [ ] Environment variables are set in Azure
- [ ] Waited 2-3 minutes after deployment

### Get Help
1. **Check GitHub Actions logs** - Most detailed error information
2. **Check Azure Portal logs** - Runtime errors
3. **Test locally with Docker** - Isolate build issues
4. **Review this troubleshooting guide** - Common solutions
5. **Open GitHub Issue** - With full error logs

### Useful Information to Include
When asking for help, provide:
- [ ] GitHub Actions workflow log (full output)
- [ ] Azure app service logs (last 100 lines)
- [ ] Error message (exact text)
- [ ] What you've already tried
- [ ] Output of: `docker build -f Dockerfile.fast -t test .`

---

## 📚 Additional Resources

- [Azure App Service Logs](https://docs.microsoft.com/azure/app-service/troubleshoot-diagnostic-logs)
- [Docker Build Troubleshooting](https://docs.docker.com/engine/reference/commandline/build/#troubleshooting)
- [GitHub Actions Debugging](https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging)

---

**Last Updated**: October 2025  
**Status**: ✅ Updated with cache error fix
