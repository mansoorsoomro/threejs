# MongoDB Atlas Setup Guide

Since Vercel has a read-only filesystem, you need a database like MongoDB Atlas to save pricing changes permanently.

## 1. Create a MongoDB Atlas Cluster
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Project (if you don't have one).
3. Click **Build a Cluster** (the Free Tier is fine).
4. Choose your provider (AWS, Google Cloud, or Azure) and region.
5. Create a **Database User** (keep the username and password handy).
6. Add `0.0.0.0/0` to your **IP Access List** (to allow Vercel to connect).

## 2. Get Your Connection String
1. In the Atlas Dashboard, go to **Database**.
2. Click **Connect** on your cluster.
3. Choose **Connect your application**.
4. Copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`

## 3. Add to Vercel
1. Go to your project in the [Vercel Dashboard](https://vercel.com).
2. Go to **Settings** > **Environment Variables**.
3. Add a new variable:
   - **Key**: `MONGODB_URI`
   - **Value**: Your connection string (replace `<password>` with your actual password).
4. **Redeploy** your project for changes to take effect.

## 4. Local Development (Optional)
If you want to use MongoDB locally, add the same `MONGODB_URI` to your `.env.local` file:
```env
MONGODB_URI=mongodb+srv://...
```
If this variable is missing locally, the app will continue to use the local `data/pricing-config.json` file.
