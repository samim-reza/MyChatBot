# Azure Deployment Guide

## Prerequisites
1. Azure account (free tier available)
2. GitHub repository with your code
3. Azure CLI installed (optional, can use Azure Portal)

## Step 1: Prepare Your Repository

Your repository is ready! Make sure to commit and push all changes:
```bash
git add .
git commit -m "Prepare for Azure deployment"
git push origin master
```

## Step 2: Create Azure Web App

### Option A: Using Azure Portal (Recommended for beginners)

1. **Go to Azure Portal**
   - Navigate to https://portal.azure.com
   - Sign in with your Microsoft account

2. **Create a Web App**
   - Click "Create a resource" → "Web App"
   - Fill in the details:
     - **Subscription**: Select your subscription
     - **Resource Group**: Create new (e.g., "chatbot-rg")
     - **Name**: Choose a unique name (e.g., "samim-chatbot")
     - **Publish**: Code
     - **Runtime stack**: Python 3.10
     - **Operating System**: Linux
     - **Region**: Choose closest to you (e.g., East US)
     - **Pricing Plan**: Free F1 or Basic B1 (recommended)

3. **Configure Deployment**
   - Click "Review + Create" → "Create"
   - Wait for deployment to complete (2-3 minutes)

4. **Connect to GitHub**
   - Go to your Web App resource
   - In left menu: "Deployment Center"
   - **Source**: GitHub
   - Click "Authorize" and connect your GitHub account
   - **Organization**: Your GitHub username
   - **Repository**: MyChatBot
   - **Branch**: master
   - Click "Save"

5. **Configure Environment Variables**
   - Go to "Configuration" in left menu
   - Click "New application setting" for each:
     ```
     GROQ_API_KEY=your_groq_api_key_here
     PINECONE_API_KEY=your_pinecone_api_key_here
     PINECONE_INDEX_NAME=samim-chatbot
     PINECONE_ENVIRONMENT=us-east-1
     ```
   - Click "Save" at the top

6. **Configure Startup Command**
   - Still in "Configuration" → "General settings"
   - **Startup Command**: 
     ```
     gunicorn --bind=0.0.0.0 --timeout 600 --worker-class uvicorn.workers.UvicornWorker app:app
     ```
   - Click "Save"

7. **Deploy**
   - Go to "Deployment Center"
   - Click "Sync" to trigger deployment
   - Monitor "Logs" tab for deployment progress (5-10 minutes)

8. **Access Your App**
   - Once deployed, go to "Overview"
   - Click the URL (e.g., https://samim-chatbot.azurewebsites.net)
   - Your chatbot should be live! 🎉

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name chatbot-rg --location eastus

# Create App Service plan (Free tier)
az appservice plan create --name chatbot-plan --resource-group chatbot-rg --sku F1 --is-linux

# Create Web App
az webapp create --resource-group chatbot-rg --plan chatbot-plan --name samim-chatbot --runtime "PYTHON:3.10"

# Configure GitHub deployment
az webapp deployment source config --name samim-chatbot --resource-group chatbot-rg --repo-url https://github.com/samim-reza/MyChatBot --branch master --manual-integration

# Set environment variables
az webapp config appsettings set --resource-group chatbot-rg --name samim-chatbot --settings GROQ_API_KEY="your_key" PINECONE_API_KEY="your_key" PINECONE_INDEX_NAME="samim-chatbot"

# Set startup command
az webapp config set --resource-group chatbot-rg --name samim-chatbot --startup-file "gunicorn --bind=0.0.0.0 --timeout 600 --worker-class uvicorn.workers.UvicornWorker app:app"
```

## Step 3: Verify Deployment

1. **Check Application Logs**
   - In Azure Portal → Your Web App → "Log stream"
   - Look for "Bot initialized successfully"

2. **Test the Application**
   - Visit your URL: https://your-app-name.azurewebsites.net
   - Try asking questions to verify it works

## Troubleshooting

### Issue: App won't start
**Solution**: Check logs in "Log stream" or "Deployment Center" → "Logs"

### Issue: Missing dependencies
**Solution**: Ensure all packages are in requirements.txt

### Issue: Environment variables not working
**Solution**: 
- Verify in "Configuration" → "Application settings"
- Restart the app after changing settings

### Issue: Port binding error
**Solution**: Azure automatically sets PORT environment variable, app.py handles this

### Issue: Timeout during deployment
**Solution**: Increase timeout in startup command (already set to 600 seconds)

## Scaling (Optional)

### Vertical Scaling (More powerful instance)
- Go to "Scale up (App Service plan)"
- Choose B1 or higher for better performance

### Enable Always On (Prevents cold starts)
- Go to "Configuration" → "General settings"
- Turn on "Always On" (requires Basic tier or higher)

## Cost Optimization

- **Free F1 Tier**: 
  - Includes: 60 CPU minutes/day, 1 GB RAM, 1 GB storage
  - Good for: Testing and low-traffic personal use
  - Limitation: Sleeps after 20 min of inactivity

- **Basic B1 Tier** (~$13/month):
  - Includes: Always On, custom domains, 1.75 GB RAM
  - Good for: Production use, consistent performance
  - Recommended for this chatbot

## Monitoring

1. **Application Insights** (Optional, but recommended)
   - Go to your Web App → "Application Insights"
   - Click "Turn on Application Insights"
   - Monitor performance, errors, and user activity

2. **Metrics**
   - Go to "Metrics" to see CPU, memory, and HTTP requests

## Continuous Deployment

Every time you push to GitHub master branch:
1. Azure detects the change
2. Automatically rebuilds and redeploys
3. Takes 5-10 minutes
4. Check "Deployment Center" → "Logs" for status

## Security Best Practices

1. **Never commit .env file** (already in .gitignore ✓)
2. **Use Azure Key Vault** (advanced) for API keys
3. **Enable HTTPS only** (already enabled by default)
4. **Set up custom domain** (optional) with SSL certificate

## Support

- Azure Docs: https://docs.microsoft.com/azure/app-service/
- Azure Support: https://portal.azure.com → "Help + support"
- Check logs first: "Log stream" shows real-time errors

---

**Note**: After following these steps, your chatbot will be live at:
`https://your-chosen-name.azurewebsites.net`

Replace `your-chosen-name` with whatever unique name you choose during setup.
