# Deployment Guide: Synthetic Radio Host

This guide explains how to deploy your **JavaScript/React Frontend** and **Python/FastAPI Backend** for free using [Render.com](https://render.com).

## Prerequisites
1. A GitHub account.
2. A [Render.com](https://render.com) account (Free).
3. Your project pushed to GitHub.

---

## Part 1: Deploying the Backend (Web Service)

1. **Dashboard**: Go to your [Render Dashboard](https://dashboard.render.com/).
2. **New Service**: Click **New +** -> **Web Service**.
3. **Connect Repo**: Select your repository (`synthetic-radio-host` or similar).
4. **Configuration**:
   - **Name**: Choose a name (e.g., `radio-host-api`).
   - **Region**: Choose the one closest to you (e.g., Singapore, Frankfurt).
   - **Branch**: `main` (or your working branch).
   - **Root Directory**: `synthetic_radio_host` (This is important! The `server.py` is inside this folder).
   - **Runtime**: `Python 3`.
   - **Build Command**: `pip install -r requirements.txt`.
   - **Start Command**: `python server.py`.
5. **Instance Type**: Select **Free**.
6. **Environment Variables**:
   Scroll down to the "Environment Variables" section and add:
   - Key: `GROQ_API_KEY`
   - Value: `your_actual_groq_api_key_here`
7. **Deploy**: Click **Create Web Service**.

**Wait for deployment**: It will take a few minutes. Once it says "Live", copy the URL (e.g., `https://radio-host-api.onrender.com`). You will need this for the frontend.

---

## Part 2: Deploying the Frontend (Static Site)

1. **Dashboard**: Go back to [Render Dashboard](https://dashboard.render.com/).
2. **New Service**: Click **New +** -> **Static Site**.
3. **Connect Repo**: Select the **same repository**.
4. **Configuration**:
   - **Name**: Choose a name (e.g., `radio-host-app`).
   - **Branch**: `main`.
   - **Root Directory**: `synthetic_radio_host/frontend` (Crucial! The frontend code is here).
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. **Environment Variables**:
   Add the backend URL so the frontend knows where to send requests.
   - Key: `VITE_API_URL`
   - Value: The Backend URL you copied earlier without the trailing slash (e.g., `https://radio-host-api.onrender.com`).
6. **Deploy**: Click **Create Static Site**.

---

## Part 3: Verify the Deployment

1. Go to your new Frontend URL (e.g., `https://radio-host-app.onrender.com`).
2. Try generating a podcast.
3. If it fails, check the browser console (F12 -> Console) and the Render logs for the Backend service.

### Troubleshooting
- **404 Not Found on Frontend**: 
  - Check your **Root Directory**: It MUST be `synthetic_radio_host/frontend`.
  - Check your **Publish Directory**: It MUST be `dist`.
  - If you set Root Directory to `.` (default), you must change Publish Directory to `synthetic_radio_host/frontend/dist`.
- **CORS Errors**: The backend is configured to accept requests from anywhere (`*`), so this shouldn't be an issue.
- **404 Errors on API**: Ensure your `VITE_API_URL` environment variable does NOT have a trailing slash.

---

## Option 2: Automatic Deployment (Blueprint) - Recommended

I have added a `render.yaml` file to the repository. This allows you to deploy everything automatically without manual configuration errors.

1. Go to Render Dashboard.
2. Click **New +** -> **Blueprint**.
3. Select your repository.
4. Render will detect the `render.yaml` file.
5. It will ask for `GROQ_API_KEY`. Enter it.
6. Click **Apply**.
7. Sit back and wait! It will creating both services and link them automatically.

### Note on Free Tier
Render's free backend spins down after 15 minutes of inactivity. The first request after a while might take 30-50 seconds to respond as the server wakes up. Ideally, mention this on your UI or keep it warm (though automated keeping warm is against free tier policies).
