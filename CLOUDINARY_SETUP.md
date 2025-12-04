# Cloudinary Setup Guide (Free - 25GB Storage + 25GB Bandwidth/month)

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register_free
2. Sign up for a **free account**
3. Verify your email

## Step 2: Get Your Cloud Name

1. After logging in, you'll see your **Dashboard**
2. Find your **Cloud Name** (e.g., "dge7abc123")
3. Copy this value

## Step 3: Create Upload Preset

1. Go to **Settings** (gear icon) → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Set:
   - **Preset name**: `gemstone_uploads`
   - **Signing Mode**: **Unsigned**
   - **Folder**: Leave empty (we'll set dynamically)
5. Click **Save**

## Step 4: Update Environment Variables

Update your `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=gemstone_uploads
```

## Step 5: Deploy to Vercel

1. Vercel → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
3. Redeploy

## Free Tier Benefits

- ✅ 25GB storage
- ✅ 25GB bandwidth per month
- ✅ Image transformations
- ✅ No credit card required
- ✅ Perfect for gemstone images!

Now your images are stored in Cloudinary cloud (not Firebase)!
