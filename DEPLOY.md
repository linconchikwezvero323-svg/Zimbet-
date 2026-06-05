# ZimBet Deployment Guide

This guide explains how to deploy the ZimBet platform.

## Backend Deployment (Railway.app)

The backend is a Node.js Express application using SQLite.

### Steps:
1.  **Create a Railway Project**: Go to [Railway.app](https://railway.app/) and create a new project.
2.  **Connect GitHub**: Connect your GitHub repository and select the `Zimbet-` repository.
3.  **Configure Service**:
    *   Railway should automatically detect the monorepo.
    *   Set the **Root Directory** to `backend`.
4.  **Environment Variables**: Add the following variables in the Railway dashboard:
    *   `PORT`: 3001 (or leave as default, Railway provides this).
    *   `JWT_SECRET`: A long random string for securing tokens.
    *   `NODE_ENV`: `production`.
5.  **Database**:
    *   Since this MVP uses SQLite, the database file `src/db/zimbet.sqlite3` will be created inside the container.
    *   **Note**: Railway's filesystem is ephemeral by default. For production, you should attach a **Volume** to persist the SQLite database or migrate to a managed PostgreSQL database.
    *   To use a Volume on Railway:
        1.  Create a Volume.
        2.  Mount it to `/app/src/db`.
6.  **Deploy**: Railway will use the `railway.json` config to run migrations and start the server.

## Frontend Deployment (Vercel/Netlify)

The frontend is a Vite + React application.

### Steps:
1.  **Connect GitHub**: Connect your repository to Vercel or Netlify.
2.  **Configure Build Settings**:
    *   **Root Directory**: `frontend`.
    *   **Build Command**: `npm run build`.
    *   **Output Directory**: `dist`.
3.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed backend (e.g., `https://zimbet-backend.up.railway.app/api/v1`).
4.  **Deploy**: The site will be built and deployed as a PWA.

## Database Migration to PostgreSQL (Recommended for Scale)

If you decide to move away from SQLite:
1.  Provision a PostgreSQL database on Railway.
2.  Update `backend/knexfile.js` to include a production configuration for PostgreSQL.
3.  Update the `DATABASE_URL` environment variable.
