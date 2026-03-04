# Firebase Setup Guide for Restiqa

This guide will help you complete the Firebase setup for your project.

---

## Option 1: Using Firebase Console (GUI)

### Step 1: Enable Authentication Providers

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **restiqa4u**
3. In the left sidebar, click **Authentication**
4. Click **Get Started**
5. Enable the following sign-in methods:

### Email/Password
- Click on **Email/Password**
- Toggle **Enable** to ON
- Click **Save**

### Google
- Click on **Google**
- Toggle **Enable** to ON
- Select your email in "Project support email"
- Click **Save**

### Facebook
- Click on **Facebook**
- Toggle **Enable** to ON
- Enter your Facebook App ID and App Secret
- Click **Save**

### Phone (for SMS Verification)
- Click on **Phone**
- Toggle **Enable** to ON
- Add a phone number for testing (your phone number)
- Click **Save**

---

## Option 2: Using Firebase CLI

You can also configure Firebase using the command line:

### Login to Firebase
```bash
firebase login
```

### List your projects
```bash
firebase projects:list
```

### Use a specific project
```bash
firebase use restiqa4u
```

### Open Firebase Console
```bash
firebase open console
```

### Deploy to Firebase Hosting (if needed)
```bash
firebase deploy
```

---

## Step 2: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** (under Build)
2. Click **Create Database**
3. Choose location: **asia-southeast1** (or closest to you)
4. Select **Start in test mode**
5. Click **Enable**

Your Firestore URL will be:
```
https://firestore.googleapis.com/google.firestore.v1.Firestore
```

---

## Step 3: Create Realtime Database (Optional)

If you want to use Realtime Database for chat:

1. In Firebase Console, go to **Realtime Database** (under Build)
2. Click **Create Database**
3. Choose location: **asia-southeast1**
4. Select **Start in test mode**
5. Click **Enable**

Your Realtime Database URL will be:
```
https://restiqa4u-default-rtdb.firebaseio.com
```

---

## Step 4: Update Environment Variables

Add these to your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAS-dP3J2ndmxXrJtINwK63nbR2cvPn9EM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=restiqa4u.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=restiqa4u
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=restiqa4u.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=845580160262
NEXT_PUBLIC_FIREBASE_APP_ID=1:845580160262:web:0fd487b38edbef932d6287
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-7PJEXZ6FWJ

# Firestore URL (automatic with project)
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://restiqa4u-default-rtdb.firebaseio.com

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 5: Configure Security Rules

### Firestore Rules
In Firestore → Rules tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - owners can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Properties - anyone can read, only hosts can create
    match /properties/{propertyId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // Bookings - guests can read their own bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    
    // Wishlists
    match /wishlists/{wishlistId} {
      allow read: if request.auth != null;
      allow create, delete: if request.auth != null;
    }
  }
}
```

### Realtime Database Rules
In Realtime Database → Rules tab:

```javascript
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    
    "chats": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    
    "notifications": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    
    "presence": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

---

## Step 6: Test Your Setup

1. Restart your development server:
```bash
npm run dev
```

2. Open http://localhost:3000

3. Try:
   - Sign up with email/password
   - Sign in with Google
   - Go to Authentication tab in Firebase Console to see users

---

## Available Firebase CLI Commands

| Command | Description |
|---------|-------------|
| `firebase login` | Login to Firebase |
| `firebase logout` | Logout from Firebase |
| `firebase projects:list` | List all projects |
| `firebase use <project>` | Switch to a project |
| `firebase open console` | Open Firebase Console |
| `firebase open auth` | Open Authentication page |
| `firebase open firestore` | Open Firestore page |
| `firebase emulators:start` | Start local emulators |
| `firebase deploy` | Deploy to Firebase |
| `firebase hosting:channel:deploy` | Deploy to preview channel |

---

## Need Help?

- **Firebase Docs**: https://firebase.google.com/docs
- **Firestore Guide**: https://firebase.google.com/docs/firestore
- **Auth Guide**: https://firebase.google.com/docs/auth

---

## Firebase Storage & Analytics (Bonus)

### Enable Firebase Storage

1. In Firebase Console, go to **Storage** (under Build)
2. Click **Get Started**
3. Select **Start in test mode**
4. Click **Done**

### Enable Firebase Analytics

1. In Firebase Console, go to **Analytics** (under Engage)
2. Click **Get Started**
3. Accept the terms
4. Analytics is now enabled!

### Enable Push Notifications (FCM)

1. In Firebase Console, go to **Project Settings**
2. Click on **Cloud Messaging** tab
3. Copy the **Server key** (for sending notifications)
4. The VAPID key will be generated automatically
5. Add VAPID key to your `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BEl62iUYgUivxIkv69yViEuiBIav-Iy9PH2pMu0xnpMHUx9...
```

### Using Storage & Analytics in Code

```typescript
import { getStorageService, logPropertyView, logBookingComplete } from '@/lib/firebase'

// Upload images
const storage = getStorageService()
const result = await storage.uploadPropertyImages(propertyId, files)

// Track events
logPropertyView(propertyId, 'apartment', 100)
logBookingComplete(bookingId, 250)
```
