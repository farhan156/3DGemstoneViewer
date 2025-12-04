# 🚀 Vercel Deployment Guide - Gemstone 360° Viewer

## Prerequisites
- GitHub account
- Vercel account (free tier works perfectly)
- Your code pushed to GitHub repository

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Make sure all changes are committed:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Verify `.gitignore` is correct** (already done ✅):
   - `.next/` is ignored
   - `node_modules/` is ignored
   - Build files won't be pushed

---

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel](https://vercel.com)**
   - Sign up/Login with your GitHub account

2. **Click "Add New..." → "Project"**

3. **Import Your GitHub Repository:**
   - Select `3DGemstoneViewer` repository
   - Click "Import"

4. **Configure Project:**
   ```
   Framework Preset: Next.js (auto-detected)
   Root Directory: ./
   Build Command: npm run build (auto-detected)
   Output Directory: .next (auto-detected)
   Install Command: npm install (auto-detected)
   ```

5. **Environment Variables (Optional):**
   - No environment variables needed for current setup
   - If you add API keys later, add them here

6. **Click "Deploy"**
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like: `https://3d-gemstone-viewer.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd /Users/sathushnanayakkara/Documents/Projects/3DGemstoneViewer
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? **[Your account]**
   - Link to existing project? **N**
   - Project name? **3d-gemstone-viewer** (or keep default)
   - In which directory is your code? **./
   - Override settings? **N**

5. **Production deployment:**
   ```bash
   vercel --prod
   ```

---

### Step 3: Configure Custom Domain (Optional)

1. **Go to your project in Vercel Dashboard**
2. **Settings → Domains**
3. **Add your custom domain:**
   - Example: `gemstones.yourdomain.com`
4. **Follow Vercel's DNS configuration instructions**

---

## ⚙️ Vercel Configuration

Your `vercel.json` file (already created) includes:

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["sin1"],  // Singapore region (closest to you)
  "functions": {
    "app/**": {
      "memory": 1024,    // 1GB memory per function
      "maxDuration": 10  // 10 seconds timeout
    }
  }
}
```

---

## 🎯 Post-Deployment Checklist

### ✅ Test Your Deployment

1. **Visit your Vercel URL**
2. **Test these features:**
   - [ ] Upload page loads (`/dashboard`)
   - [ ] Upload gemstone with images
   - [ ] View gallery
   - [ ] Click "View 360°" button
   - [ ] Test 360° rotation (drag to rotate)
   - [ ] Copy shareable link
   - [ ] Open shareable link in incognito/private window
   - [ ] Test certificate upload and preview
   - [ ] Test delete functionality
   - [ ] Test search and filters

### 🔍 Check Performance

Vercel automatically provides:
- **Analytics:** View traffic and performance
- **Speed Insights:** Core Web Vitals monitoring
- **Logs:** View deployment and runtime logs

---

## 🚨 Important Notes

### Current Limitations (LocalStorage)

⚠️ **Your app currently uses browser localStorage for data persistence**

**What this means:**
- ✅ Works perfectly on the same device/browser
- ❌ Data is NOT shared between users
- ❌ Data is lost if user clears browser cache
- ❌ Cannot access data from different devices

**For Production Use, You'll Need:**
1. **Database:** Vercel Postgres, MongoDB Atlas, or Supabase
2. **Cloud Storage:** AWS S3, Cloudinary, or Vercel Blob
3. **API Routes:** Create Next.js API routes for data operations

---

## 📦 Storage Solutions (For Future)

### Option 1: Vercel Blob + Vercel Postgres (Easiest)
```bash
# Install Vercel Storage packages
npm install @vercel/blob @vercel/postgres
```
- Images: Vercel Blob Storage
- Data: Vercel Postgres
- Cost: Free tier available

### Option 2: Cloudinary + MongoDB Atlas
```bash
npm install cloudinary mongodb
```
- Images: Cloudinary (free 25GB)
- Data: MongoDB Atlas (free 512MB)

### Option 3: AWS S3 + Supabase
```bash
npm install @aws-sdk/client-s3 @supabase/supabase-js
```
- Images: AWS S3
- Data: Supabase (PostgreSQL)

---

## 🔄 Automatic Deployments

**Vercel automatically deploys when you push to GitHub:**

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
```

- **Main branch** → Production deployment
- **Other branches** → Preview deployments
- Each PR gets a unique preview URL

---

## 📊 Monitor Your Deployment

### Vercel Dashboard Features:
1. **Deployments:** View all deployments and their status
2. **Analytics:** Traffic, visitors, page views
3. **Speed Insights:** Performance metrics
4. **Logs:** Real-time logs for debugging
5. **Functions:** Serverless function metrics

---

## 🛠️ Troubleshooting

### Build Fails?

**Check build logs in Vercel dashboard:**

```bash
# Common issues:
1. TypeScript errors → Run `npm run type-check` locally
2. Missing dependencies → Check package.json
3. Build command incorrect → Should be `npm run build`
```

### App Works Locally But Not on Vercel?

1. **Check environment:** Development vs Production
2. **Hard-coded URLs:** Use relative paths
3. **File paths:** Use forward slashes `/` not `\`
4. **Check logs:** Vercel Dashboard → Your Project → Logs

### Images Not Loading?

Currently using base64 (works everywhere) ✅
- No additional configuration needed
- Images embedded in localStorage

---

## 🎉 Success!

Your gemstone viewer is now live at:
**`https://your-project.vercel.app`**

Share the link with anyone worldwide! 🌍

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Community:** https://github.com/vercel/vercel/discussions

---

## 🚀 Next Steps (Optional Upgrades)

1. **Add Database:** Persistent storage across devices
2. **Add Authentication:** User accounts with login
3. **Add Cloud Storage:** S3/Cloudinary for images
4. **Add Email Notifications:** Send links to customers
5. **Add Analytics:** Track gemstone views
6. **Add Payment:** Charge for premium features
7. **Add API:** Mobile app integration
8. **Add Admin Panel:** Manage users and content

---

**Your deployment is ready! Just push to GitHub and Vercel handles the rest.** 🎊
