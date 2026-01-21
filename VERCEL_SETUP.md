# Vercel MongoDB Setup Guide

Since Vercel has a read-only filesystem, you need a database like **MongoDB Atlas** to save pricing changes permanently.

## 1. Use the Vercel MongoDB Integration
1. Go to your project in the [Vercel Dashboard](https://vercel.com).
2. Click on the **Storage** tab.
3. Select **MongoDB Atlas**.
4. Click **Connect Project**.
5. Select your project and click **Connect**.
6. Vercel will automatically add the environment variables (e.g., `MONGODB_URI` or `STORAGE_MONGODB_URI`).

## 2. Redeploy
1. For the changes to take effect, you need to **Redeploy** your project.
2. Go to the **Deployments** tab, click on the "..." menu of your latest deployment, and select **Redeploy**.

## 3. Local Development
I have already added your `MONGODB_URI` to your local `.env` file. You can now test pricing saves locally as well.

If you ever change your database, just update the `MONGODB_URI` in your Vercel Environment Variables.
