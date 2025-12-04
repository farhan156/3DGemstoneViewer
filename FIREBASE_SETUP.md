# Firebase Setup Guide

## Step 1: Create Firebase Project (Free)

1. Go to https://console.firebase.google.com/
2. Click **Add Project**
3. Enter project name (e.g., "gemstone-viewer")
4. Disable Google Analytics (optional)
5. Click **Create Project**

## Step 2: Enable Firestore Database

1. In Firebase Console, click **Firestore Database** in left menu
2. Click **Create Database**
3. Choose **Start in production mode**
4. Select your preferred location
5. Click **Enable**

## Step 3: Get Configuration

1. Click on the **gear icon** (⚙️) → **Project Settings**
2. Scroll down to **Your apps**
3. Click the **</>** (Web) icon
4. Register your app with a nickname
5. Copy the Firebase config values

## Step 4: Update Environment Variables

Update your `.env.local` file with the Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 5: Configure Firestore Rules

In Firebase Console → Firestore Database → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gemstones/{gemstoneId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Click **Publish** to save the rules.

## Step 6: Deploy to Vercel

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add all `NEXT_PUBLIC_FIREBASE_*` variables
3. Redeploy

## Free Tier Limits

Firebase Free (Spark Plan) includes:
- 1 GB stored data
- 50,000 reads per day
- 20,000 writes per day
- 20,000 deletes per day
- Perfect for your gemstone viewer!
