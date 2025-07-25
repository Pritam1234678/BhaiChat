# Deployment Guide

## Environment Variables Setup

### For Local Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual API keys in the `.env` file:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id

   # Gemini AI API Key
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### For Production Deployment

#### Vercel
1. In your Vercel dashboard, go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable from your `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY`

#### Netlify
1. In your Netlify dashboard, go to Site settings
2. Navigate to "Environment variables"
3. Add each variable from your `.env` file

#### Other Platforms
For other deployment platforms, consult their documentation on setting environment variables.

## Important Security Notes

1. **Never commit your `.env` file** - it's already added to `.gitignore`
2. **Use different API keys for production** than development if possible
3. **Regenerate API keys** if they're accidentally exposed
4. **Set up Firebase security rules** to protect your database

## Firebase Security Rules

Make sure your Firestore security rules are deployed:

```bash
firebase deploy --only firestore:rules
```

The current rules ensure users can only access their own data:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Getting API Keys

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Scroll down to "Your apps" and find your web app
5. Copy the configuration values

### Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your environment variables

## Deployment Checklist

- [ ] Environment variables set in deployment platform
- [ ] Firebase security rules deployed
- [ ] API keys are valid and have proper permissions
- [ ] Test the deployed application
- [ ] Monitor error logs for any missing environment variables
