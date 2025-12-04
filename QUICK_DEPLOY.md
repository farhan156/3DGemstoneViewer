# Quick Deploy to Vercel

## 🚀 Fastest Way (3 Steps)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Go to Vercel
- Visit: https://vercel.com
- Login with GitHub
- Click "Add New" → "Project"
- Select `3DGemstoneViewer` repository
- Click "Deploy"

### 3. Done! ✅
Your app will be live in 2-3 minutes at:
`https://3d-gemstone-viewer.vercel.app`

---

## 📱 Test Your Live App

1. Visit your Vercel URL
2. Go to `/dashboard`
3. Upload gemstone images
4. Test 360° rotation
5. Share link with anyone!

---

## ⚠️ Important Note

**Your app uses localStorage (browser storage)**
- Data saves only on the user's device
- Perfect for demo and testing
- For production with multiple users, add a database

---

## 🔄 Auto-Deploy

Every time you push to GitHub, Vercel automatically:
- Builds your app
- Runs tests
- Deploys updates
- Creates preview URLs

**Command:**
```bash
git push origin main  # Auto-deploys!
```

---

For detailed instructions, see `DEPLOYMENT_GUIDE.md`
