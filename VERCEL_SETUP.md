# Vercel KV Setup Guide

To enable saving pricing configuration on Vercel, you must connect a Vercel KV (Key-Value) database.

## 1. Create KV Database on Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your project.
3. Click on the **Storage** tab.
4. Click **Create Database** and select **KV**.
5. Follow the prompts to create the database (e.g., choosing a region).

## 2. Connect to Your Project
Once created:
1. Go to the **Connect** tab in your KV database settings.
2. Select your project to link it.
3. Vercel will automatically add the required environment variables:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

## 3. Sync Environment Variables Locally
To test the KV connection locally, run:
```bash
vercel env pull .env.local
```
*(Requires Vercel CLI installed: `npm i -g vercel`)*

## 4. Redeploy
Redeploy your application to Vercel. The Admin panel will now detect the KV connection and allow saving.

---
**Note:** If these variables are missing, the application will fallback to local filesystem storage (which is read-only on Vercel, resulting in the error you saw).
