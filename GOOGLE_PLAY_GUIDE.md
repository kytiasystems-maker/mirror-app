# Google Play Store Submission Guide

## Pre-Submission Checklist

### App Requirements
- [x] App works without crashes
- [x] Mood tracking functional
- [x] Email collection working
- [x] Persistent data storage (JSON files)
- [ ] APK/AAB built and tested
- [ ] Privacy policy available
- [ ] App icon (192x192, 512x512)
- [ ] Splash screen configured
- [ ] App manifest with metadata

### Account Setup
1. **Create Google Play Developer Account**
   - Visit: https://play.google.com/apps/publish
   - Pay $25 one-time registration fee
   - Provide developer info, payment method, store listing address

2. **Create App Listing**
   - App name: "Mirror"
   - Short description: "A philosophical mood tracker. Reflect daily, understand yourself deeply."
   - Full description: [Create compelling app store description]
   - Category: Health & Fitness
   - Content rating: Complete questionnaire
   - Target audience: 13+

### Store Listing Assets
Required:
- **App Icon** (512x512 PNG): Must be published app icon
- **Feature Graphic** (1024x500 PNG): Banner for store
- **Screenshots** (minimum 2):
  - Mood selection screen
  - Quote display screen
  - Email collection feature
  - Minimum size: 1080x1920 px (Portrait)
- **Video Preview** (optional but recommended)

### Content Configuration
- **Content Rating**: Complete the IARC questionnaire
- **Privacy Policy**: [Must provide URL or upload file]
- **Permissions**: Review required permissions in AndroidManifest.xml
  - INTERNET (required)
  - ACCESS_NETWORK_STATE (optional)

### Build & Upload

1. **Generate Signed APK/AAB**
   ```powershell
   cd "c:\Users\HP\Desktop\Daily calm AI\frontend\android"
   ./gradlew bundleRelease
   ```

2. **Create Keystore** (one-time)
   ```powershell
   keytool -genkey -v -keystore mirror-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mirror
   ```

3. **Upload Bundle**
   - Go to Google Play Console
   - Create new release
   - Upload AAB file (recommended over APK)
   - Review app details and pricing
   - Submit for review

### Pricing & Distribution
- **Pricing**: Free (with optional in-app purchases for premium features)
- **Distribution**: Select countries
- **Geographic restrictions**: None recommended for initial launch
- **Testing**: Use internal testing track first

### Post-Submission
- App review: 24-48 hours typically
- Google will check:
  - Crashes and stability
  - Privacy policy compliance
  - No malware/deceptive content
  - Proper permissions usage
- Address any issues in feedback

### Common Rejection Reasons
- Missing privacy policy
- App crashes on launch
- Misleading description
- Inappropriate permissions
- No clear functionality

## Promoting Your App
1. Create social media presence
2. Request app reviews from beta testers
3. Create screenshots with captions
4. Write compelling description
5. Monitor reviews and ratings
6. Update frequently based on feedback

## Monetization Options (Future)
- Premium "The Veil" subscription
- In-app analytics and insights
- Export mood data
- Integrate with calendar/notes apps

## Support & Updates
- Monitor Google Play Console for crash reports
- Respond to user reviews
- Submit updates with new features
- Maintain minimum API level 30
