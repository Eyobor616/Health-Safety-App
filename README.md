
# SAFETY MANAGER Behavioral Observation (SBO) App

Mobile-optimized application for tracking and managing health and safety observations within GZI canline operations.

## Features

- **Auth**: Firebase Google Authentication.
- **Reporting**: Comprehensive form with Act/Condition toggle, Excel-mapped Categories/Subcategories, Assessment scale, and Image evidence.
- **Workflow**: Automated status tracking (Open/Pending/Closed) with HSE oversight and Manager reassignment.
- **Offline Support**: Local caching for mission-critical reporting in poor connectivity areas.
- **Dashboard**: Real-time progress tracking against monthly and yearly safety goals.

## Architecture

- **Frontend**: React 19 (Web-native structure).
- **Icons**: Lucide-React.
- **Styling**: Tailwind CSS (Utility-first, design-system oriented).
- **Backend**: Firebase Firestore (Data), Firebase Storage (Images), Firebase Auth (Identity).
- **Workflow**: Firebase Cloud Functions for real-time manager alerts.

## Deployment Instructions

### Mobile (React Native / Expo)
1. Install dependencies: `npm install @react-navigation/native firebase lucide-react-native expo-image-picker`.
2. Wrap App component in `NavigationContainer`.
3. Configure `app.json` for camera and storage permissions.
4. Build using EAS: `eas build --platform ios/android`.

### Web / PWA
1. Ensure the `index.html` import map is correctly pointed to stable CDN providers (e.g., esm.sh).
2. Configure manifest.json for "Stand-alone" display mode.
3. Deploy to Firebase Hosting: `firebase deploy`.

## Technical Maintenance

- **Categories**: Managed in `constants.ts`. Update this file to sync with organizational Excel shifts.
- **Access Control**: Role logic is derived in `App.tsx` via email domain checks or Firestore profiles.
- **Testing**: Run unit tests via `jest` for category validation logic.
