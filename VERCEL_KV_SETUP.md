# Vercel KV Setup Guide

## Step 1: Create Vercel KV Database (Free)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on **Storage** in the left sidebar
3. Click **Create Database**
4. Select **KV (Redis)**
5. Choose a name (e.g., "gemstone-storage")
6. Click **Create**

## Step 2: Get Environment Variables

After creating the database, Vercel will show you three environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Step 3: Add to Local Environment

Copy these values and paste them into your `.env.local` file (already created for you).

## Step 4: Connect to Your Project

1. In the Vercel dashboard, go to your **gemstone-360-platform** project
2. Click on **Settings** → **Environment Variables**
3. The KV variables should be automatically added when you link the database
4. Or manually add them if needed

## Step 5: Deploy

Once the environment variables are set in Vercel, your next deployment will have database access.

The backend is now ready! When you upload a gemstone, it will be stored in the cloud database instead of localStorage.

## Free Tier Limits

Vercel KV Free tier includes:
- 30,000 commands per month
- 256 MB storage
- Perfect for your gemstone viewer!
