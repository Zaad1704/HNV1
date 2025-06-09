# HNV SaaS Platform – Production Deployment Guide

This guide explains how to deploy the HNV SaaS stack (multi-tenant backend, frontend, MongoDB) on **Render.com** using production best practices.

---

## Prerequisites

- A [Render.com](https://render.com/) account
- A GitHub repository for your code (backend and frontend)
- SMTP credentials for transactional email
- 2Checkout (Verifone) API keys for billing
- (Optional) Your own custom domain(s)

---

## 1. Provision MongoDB

### Option 1: Render Managed MongoDB
1. Go to [Render Databases](https://dashboard.render.com/new/database)
2. Click “New Database” → Choose **MongoDB**
3. Enter a name (e.g., `hnv-saas-prod`) and region
4. After provisioning, **copy the connection string** (e.g., `mongodb+srv://<user>:<pass>@host/hnv-saas`)

### Option 2: MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free or paid cluster
3. Whitelist Render’s IP ranges (see Atlas docs)
4. Copy the connection string

---

## 2. Deploy the Backend (API)

1. Push your backend code to GitHub (e.g., in `/backend`)
2. On Render, click “New +” → “Web Service”
3. Connect your GitHub repo, choose `/backend` as root
4. Set environment variables matching your backend `.env` (see below)
5. Set **PORT** to `5001`
6. If using Docker: leave build/start commands blank (Render uses your Dockerfile)
7. If not using Docker:  
   - **Build Command:** `npm install && npm run build`  
   - **Start Command:** `node dist/server.js`
8. Deploy

**Backend Environment Variables:**  
Fill these in the Render dashboard for your backend service:

| Key                | Value (example)                         |
|--------------------|-----------------------------------------|
| PORT               | 5001                                    |
| MONGO_URI          | (your MongoDB connection string)        |
| JWT_SECRET         | (strong random string)                  |
| JWT_REFRESH_SECRET | (another strong random string)          |
| CORS_ORIGIN        | https://your-frontend.onrender.com      |
| EMAIL_PROVIDER     | smtp                                    |
| EMAIL_HOST         | smtp.yourprovider.com                   |
| EMAIL_PORT         | 465                                     |
| EMAIL_USER         | your_prod_email@domain.com              |
| EMAIL_PASS         | your_prod_email_password                |
| TCO_SELLER_ID      | your_2checkout_seller_id                |
| TCO_PUBLIC_KEY     | your_2checkout_public_key               |
| TCO_PRIVATE_KEY    | your_2checkout_private_key              |

---

## 3. Deploy the Frontend

1. Push your frontend code to GitHub (e.g., in `/frontend`)
2. On Render, click “New +” → “Static Site”
3. Connect your GitHub repo, choose `/frontend` as root
4. **Build Command:** `npm run build`
5. **Publish Directory:** `dist`
6. **Environment Variable:**  
   - `VITE_API_URL=https://your-backend-service.onrender.com/api`
7. Deploy

---

## 4. Sync CORS and API URLs

- Backend `CORS_ORIGIN` **must match** your frontend Render URL (e.g., `https://hnv-saas-frontend.onrender.com`)
- Frontend `VITE_API_URL` **must match** your backend Render URL (`https://hnv-saas-backend.onrender.com/api`)

---

## 5. Custom Domains & HTTPS

- Add your domains in Render dashboard (Frontend and Backend)
- Follow Render docs to set CNAME records and verify your domain
- Render provides free HTTPS

---

## 6. Email & Payments

- Your **backend environment** must have working SMTP credentials (SendGrid, Mailgun, Gmail App Password, etc.)
- Your **backend environment** must have real 2Checkout (Verifone) live API keys

---

## 7. View Logs & Redeploy

- Use the "Logs" tab in each Render service for troubleshooting
- Pushing to GitHub will trigger auto-deploys
- You can trigger manual deploys in the Render UI

---

## 8. (Optional) Use `render.yaml` for Infrastructure-as-Code

You can automate all services using a `render.yaml` in your repo root:

```yaml
services:
  - type: web
    name: hnv-saas-backend
    env: docker
    plan: standard
    repo: https://github.com/your-org/hnv-saas
    branch: main
    rootDir: backend
    envVars:
      - key: PORT
        value: 5001
      - key: MONGO_URI
        value: (your-mongo-connection-string)
      # ... other env vars ...
  - type: static
    name: hnv-saas-frontend
    repo: https://github.com/your-org/hnv-saas
    branch: main
    rootDir: frontend
    buildCommand: npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        value: https://hnv-saas-backend.onrender.com/api
```

---

## 9. Security & Maintenance

- Never commit `.env` files with secrets to GitHub
- Always use strong, unique secrets for JWT and passwords
- Regularly rotate API keys/secrets
- Use HTTPS for all user-facing endpoints

---

## 10. Summary: Launch Checklist

- [ ] MongoDB is provisioned and accessible
- [ ] Backend deployed as a Render Web Service with all env vars set
- [ ] Frontend deployed as a Render Static Site, `VITE_API_URL` set
- [ ] Domains and HTTPS configured
- [ ] Email and 2Checkout live keys configured
- [ ] CORS and API URLs are correct and matching

---

### For advanced scaling, monitoring, backups, or CI/CD, refer to Render.com documentation.

---