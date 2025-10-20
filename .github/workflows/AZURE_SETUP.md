# 🔷 Azure Deployment Setup Guide

This guide will help you set up automated deployment of your MyChatBot to Azure App Service using GitHub Actions.

## 📋 Prerequisites

- Azure Account ([Sign up here](https://azure.microsoft.com/free/))
- Azure CLI installed locally (optional, for manual setup)
- GitHub repository with push access

## 🚀 Azure Resources Setup

### 1. Create Azure Container Registry (ACR)

```bash
# Login to Azure
az login

# Create resource group
az group create --name samim-chatbot-rg --location eastus

# To register
az provider register --namespace Microsoft.ContainerRegistry

#To check registration status
az provider show --namespace Microsoft.ContainerRegistry --query "registrationState"

# Create container registry
az acr create \
  --resource-group samim-chatbot-rg \
  --name samimchatbotregistry \
  --sku Basic \
  --admin-enabled true

# Get ACR credentials
az acr credential show --name samimchatbotregistry --resource-group samim-chatbot-rg
```

**Save these credentials:**
- Username: `samimchatbotregistry`
- Password: (from the command output)

### 2. Create Azure App Service

```bash
# Create App Service Plan (Linux, containerized)
az appservice plan create \
  --name samim-chatbot-plan \
  --resource-group samim-chatbot-rg \
  --is-linux \
  --sku B1

# Create Web App
az webapp create \
  --resource-group samim-chatbot-rg \
  --plan samim-chatbot-plan \
  --name samim-chatbot-app \
  --deployment-container-image-name samimchatbotregistry.azurecr.io/samim-chatbot:latest

# Configure Web App for ACR
az webapp config container set \
  --name samim-chatbot-app \
  --resource-group samim-chatbot-rg \
  --docker-custom-image-name samimchatbotregistry.azurecr.io/samim-chatbot:latest \
  --docker-registry-server-url https://samimchatbotregistry.azurecr.io

# Enable continuous deployment
az webapp deployment container config \
  --name samim-chatbot-app \
  --resource-group samim-chatbot-rg \
  --enable-cd true
```

### 3. Create Service Principal for GitHub Actions

```bash
# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Create service principal with contributor role
az ad sp create-for-rbac \
  --name "samim-chatbot-github-actions" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/samim-chatbot-rg \
  --sdk-auth
```

**Save the entire JSON output** - you'll need it for GitHub secrets.

## 🔐 GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `AZURE_CREDENTIALS` | Service principal credentials | Output from step 3 (entire JSON) |
| `ACR_USERNAME` | Azure Container Registry username | From step 1 or `samimchatbotregistry` |
| `ACR_PASSWORD` | Azure Container Registry password | From step 1 credential command |
| `GROQ_API_KEY` | Groq API key for LLM | From [Groq Console](https://console.groq.com/) |

### Example Secret Values

#### AZURE_CREDENTIALS
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "your-client-secret",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

#### ACR_USERNAME
```
samimchatbotregistry
```

#### ACR_PASSWORD
```
your-acr-password-from-step-1
```

#### GROQ_API_KEY
```
gsk_your_groq_api_key_here
```

## 🎯 Workflow Features

The Azure deployment workflow includes:

### ✅ Triggers
- Push to `main` or `master` branch
- Pull requests to `main` or `master`
- Manual workflow dispatch

### ✅ Optimizations
- **Docker BuildKit**: Faster builds with caching
- **Layer Caching**: Registry-based cache for dependencies
- **Multi-tagging**: SHA-based and latest tags
- **Metadata extraction**: Automatic tag management

### ✅ Security
- Environment variables masked in logs
- Secure credential management
- Automatic Azure logout after deployment

### ✅ Health Checks
- 30-second deployment wait time
- Automated health check endpoint verification
- Graceful error handling

## 🔄 Deployment Process

When you push to the repository:

1. **Checkout**: Fetches latest code
2. **Docker Setup**: Configures BuildKit for optimal performance
3. **Azure Login**: Authenticates with Azure
4. **ACR Login**: Authenticates with Container Registry
5. **Build & Push**: Builds Docker image and pushes to ACR with caching
6. **Configure**: Sets environment variables in Azure Web App
7. **Deploy**: Deploys new image to Azure App Service
8. **Health Check**: Verifies application is running
9. **Cleanup**: Logs out from Azure

## 📊 Monitoring

### View Deployment Status
- GitHub: Repository → Actions tab
- Azure Portal: App Service → Deployment Center

### View Application Logs
```bash
# Stream logs
az webapp log tail --name samim-chatbot-app --resource-group samim-chatbot-rg

# Download logs
az webapp log download --name samim-chatbot-app --resource-group samim-chatbot-rg
```

### Access Application
```
https://samim-chatbot-app.azurewebsites.net
```

### Health Check Endpoint
```
https://samim-chatbot-app.azurewebsites.net/api/debug/config
```

## 🛠️ Troubleshooting

### Build Fails
1. Check GitHub Actions logs
2. Verify Dockerfile.fast builds locally
3. Check ACR credentials

### Deployment Fails
1. Verify Azure credentials in GitHub secrets
2. Check App Service logs
3. Ensure resource group and app name match

### Application Not Responding
1. Check environment variables in Azure Portal
2. Verify GROQ_API_KEY is set correctly
3. Check application logs for errors
4. Verify port 8000 is exposed

### Health Check Fails
1. Wait 1-2 minutes for container startup
2. Check App Service → Deployment Center for status
3. Verify `/api/debug/config` endpoint exists

## 🔧 Manual Deployment (Alternative)

If GitHub Actions isn't working, deploy manually:

```bash
# Build locally
docker build -f Dockerfile.fast -t samimchatbotregistry.azurecr.io/samim-chatbot:latest .

# Login to ACR
az acr login --name samimchatbotregistry

# Push image
docker push samimchatbotregistry.azurecr.io/samim-chatbot:latest

# Restart web app
az webapp restart --name samim-chatbot-app --resource-group samim-chatbot-rg
```

## 💰 Cost Estimation

- **App Service (B1)**: ~$13/month
- **Container Registry (Basic)**: ~$5/month
- **Total**: ~$18/month

> Use the Free tier for testing: `--sku F1` for App Service Plan

## 🔄 Update Workflow

To modify the deployment:

1. Edit `.github/workflows/azure-deploy.yml`
2. Commit and push changes
3. Workflow will automatically use new configuration

## 📚 Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Support

For issues:
1. Check GitHub Actions logs
2. Review Azure App Service logs
3. Open an issue in the repository

---

**Last Updated**: October 2025
