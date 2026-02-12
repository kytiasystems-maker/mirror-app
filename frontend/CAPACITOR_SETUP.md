# Capacitor Setup for Android APK

## Prerequisites
- Node.js and npm installed
- Android Studio installed
- Java JDK 11+ installed
- Android SDK (API 30+)

## Quick Setup

### 1. Install Capacitor in Frontend
```powershell
cd "c:\Users\HP\Desktop\Daily calm AI\frontend"
npm install @capacitor/core @capacitor/cli --save
```

### 2. Initialize Capacitor Project
```powershell
npx cap init Mirror com.mirrorapp.app
```

### 3. Build React App
```powershell
npm run build
```

### 4. Add Android Platform
```powershell
npx cap add android
```

### 5. Configure Capacitor (capacitor.config.json)
```json
{
  "appId": "com.mirrorapp.app",
  "appName": "Mirror",
  "webDir": "build",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": true
  }
}
```

### 6. Build APK
```powershell
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### 7. Deploy to Google Play
- Create Google Play Developer account ($25 one-time)
- Create app listing
- Upload APK/AAB
- Add screenshots, description, privacy policy
- Submit for review (24-48 hours)

## Environment Configuration for Mobile
In `frontend/src/api.config.js`, Capacitor apps will use the configured API_BASE_URL:
- Development: Uses relative `/api` paths
- Production: Update API_ENDPOINTS to point to production backend

## Testing on Device
```powershell
npx cap run android
```

## Troubleshooting
- If network fails: Enable "allowMixedContent" in capacitor.config.json
- If plugins missing: Run `npm install @capacitor/[plugin-name]`
- Check device logs: `adb logcat`
