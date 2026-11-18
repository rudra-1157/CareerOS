# CareerOS Complete Production Deployment Guide

This guide covers deploying the **CareerOS** fullstack web application (FastAPI backend + React Vite frontend) to free and reliable cloud hosts with live APIs.

---

## 🚀 Recommended Deployment Architecture (100% Free Tier)

| Service | Recommended Platform | Why |
| :--- | :--- | :--- |
| **Backend API** | [Render.com](https://render.com) or [Railway.app](https://railway.app) | Native Python support, free tier, automatic SSL/HTTPS, zero config |
| **Frontend Web App** | [Vercel.com](https://vercel.com) or [Render Static Site](https://render.com) | Ultra-fast global Edge CDN, automatic Git deployments, instant HTTPS |
| **AI LLM Engine** | [Groq Cloud](https://console.groq.com) | Ultra-fast Llama-3 / GPT-OSS inference with free API tier |

---

## Option 1: Step-by-Step Deployment (Vercel + Render)

### Step 1: Deploy Backend to Render

1. Sign up / Log in to [Render.com](https://render.com) using your GitHub account.
2. Click **New +** -> Select **Web Service**.
3. Connect your repository: `rudra-1157/CareerOS`.
4. Configure the Web Service settings:
   - **Name**: `careeros-backend`
   - **Region**: Closest to you (e.g., Singapore or Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Click **Advanced** -> **Add Environment Variable**:
   - `SECRET_KEY`: Enter a random 32-character string (e.g. `career-os-production-jwt-token-key-2026`)
   - `GROQ_API_KEY`: Paste your Groq API key (starts with `gsk_...`)
   - `GROQ_MODEL`: `openai/gpt-oss-120b`
   - `FRONTEND_URL`: Leave blank for now (or set to `*`), update after frontend is deployed.
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL:
   - Example: `https://careeros-backend.onrender.com`
   - Verify by visiting: `https://careeros-backend.onrender.com/health` (should return `{"status":"healthy"}`)

---

### Step 2: Deploy Frontend to Vercel

1. Log in to [Vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import your repository: `rudra-1157/CareerOS`.
4. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables**:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://<YOUR-RENDER-BACKEND-URL>/api/v1`  
     *(Example: `https://careeros-backend.onrender.com/api/v1` — make sure to include `/api/v1` and no trailing slash)*
6. Click **Deploy**.
7. In ~60 seconds, your site is live at: `https://careeros-xyz.vercel.app`!

---

### Step 3: Link Allowed CORS (Finish Up)

1. Return to your Render backend dashboard -> **Environment**.
2. Set or update:
   - `FRONTEND_URL`: `https://careeros-xyz.vercel.app`
3. Click **Save Changes** (Render will automatically re-deploy in 20 seconds).

Your complete CareerOS application is now live, connected to real-time AI and code sandboxing!

---

## Option 2: 1-Click All-in-One Deployment on Render (Blueprint)

The repository includes a ready-to-use [`render.yaml`](../render.yaml) blueprint:

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Select your `rudra-1157/CareerOS` repository.
4. Render will detect `render.yaml` and automatically configure:
   - Both backend and frontend services.
   - SPA route rewrites.
   - Internal network wiring (`VITE_API_BASE_URL` automatically populated).
5. When prompted for `GROQ_API_KEY`, paste your Groq key.
6. Click **Apply**. Both services will build and link automatically!

---

## Pre-Flight Checklist Before Launching

- [x] CORS configured in `backend/app/config.py` to accept Vercel domains.
- [x] Client-side SPA routing rules defined in `frontend/vercel.json` (prevents 404s on page refresh).
- [x] Health check endpoint active at `/health`.
- [x] Sandbox executor runs both Python and JavaScript in Linux server environments.
- [x] Dynamic `VITE_API_BASE_URL` reads from environment variables.
