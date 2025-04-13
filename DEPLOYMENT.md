# Deployment Guide for Farmetryx

This guide will help you deploy the Farmetryx application to Render.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at https://render.com)

## Deployment Steps

### 1. Push to GitHub

First, initialize a Git repository and push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Render

1. Log in to your Render account
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: farmetryx
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
   - Select the branch to deploy (usually `main`)

5. Click "Create Web Service"

### 3. Environment Variables

Add the following environment variables in Render's dashboard:
- `NODE_ENV=production`
- `PORT=10000` (or any port Render assigns)

### 4. Wait for Deployment

Render will automatically deploy your application. The process typically takes 2-3 minutes.

### 5. Access Your Application

Once deployed, Render will provide you with a URL where your application is accessible (e.g., `https://farmetryx.onrender.com`).

## Post-Deployment

1. Test all features to ensure they work correctly
2. Monitor the application logs in Render's dashboard
3. Set up automatic deployments from your GitHub repository

## Troubleshooting

If you encounter any issues:

1. Check the logs in Render's dashboard
2. Verify all environment variables are set correctly
3. Ensure all dependencies are listed in `package.json`
4. Check if the port is correctly configured

## Maintenance

- Regularly update dependencies
- Monitor application performance
- Keep an eye on the Render dashboard for any issues
- Set up proper logging for production environment 