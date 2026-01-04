# Cross-Platform Deployment Plan for Backyard Bash
## iOS (Xcode) and Android Deployment Guide

---

## Executive Summary

**Current State:** React web app built with Vite + TypeScript
**Target:** Native iOS and Android applications
**Recommended Approach:** Capacitor (keeps existing codebase)
**Alternative Approach:** React Native (requires rewrite)

---

## OPTION 1: CAPACITOR (RECOMMENDED) ⭐

### Why Capacitor?
- Keep 95% of existing React codebase unchanged
- Web-to-native wrapper approach
- Official Ionic framework support
- Access to native APIs via plugins
- Faster time to deployment

### Phase 1: Prerequisites & Environment Setup

#### 1.1 Install Required Tools

**For iOS Development:**
- macOS computer (required for iOS)
- Xcode 14+ (from Mac App Store)
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`

**For Android Development:**
- Android Studio (any OS)
- Android SDK (API 33+)
- Java JDK 17+
- Configure ANDROID_HOME environment variable

**For Both Platforms:**
- Node.js 18+ (already have)
- npm or yarn
- Capacitor CLI

#### 1.2 Verify Development Environment

```bash
# Check versions
node --version
npm --version
xcode-select -p
java -version
```

---

### Phase 2: Project Configuration

#### 2.1 Install Capacitor

```bash
# Install Capacitor core packages
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init "Backyard Bash" "com.backyardbash.cricket" --web-dir=dist

# Add iOS and Android platforms
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

#### 2.2 Update Configuration Files

**capacitor.config.ts** (create in root):
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.backyardbash.cricket',
  appName: 'Backyard Bash',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f0fdf4",
      showSpinner: false
    }
  }
};

export default config;
```

**Update package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "cap:sync": "cap sync",
    "cap:ios": "cap open ios",
    "cap:android": "cap open android",
    "build:mobile": "npm run build && cap sync"
  }
}
```

#### 2.3 Update index.html for Mobile

Add viewport meta tag and mobile optimizations:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

#### 2.4 Handle Environment Variables

Create **capacitor.config.json** plugin for env vars:
```bash
npm install @capacitor/preferences
```

Move GEMINI_API_KEY handling to use Capacitor Preferences or build-time injection.

---

### Phase 3: iOS Deployment

#### 3.1 Build for iOS

```bash
# Build web assets
npm run build

# Sync with iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

#### 3.2 Configure in Xcode

1. **Set Bundle Identifier:**
   - Open project in Xcode
   - Select target "App"
   - General tab → Bundle Identifier: `com.backyardbash.cricket`

2. **Configure Team & Signing:**
   - Signing & Capabilities tab
   - Select your Apple Developer Team
   - Enable "Automatically manage signing"

3. **Set Deployment Target:**
   - General tab → Deployment Info
   - Minimum iOS version: 13.0 or higher

4. **Add App Icons:**
   - Generate icons using https://icon.kitchen
   - Drag into Assets.xcassets/AppIcon

5. **Configure Info.plist:**
   - Add camera/location permissions if needed
   - Set display name and version

#### 3.3 Test on iOS Simulator

```bash
# List available simulators
xcrun simctl list devices

# Build and run
# In Xcode: Product → Run (⌘R)
```

#### 3.4 Deploy to Physical Device

1. Connect iPhone via USB
2. Trust computer on device
3. Select device in Xcode
4. Click Run

#### 3.5 App Store Distribution

1. **Create App in App Store Connect:**
   - Login to https://appstoreconnect.apple.com
   - Create new app with Bundle ID
   - Fill in metadata, screenshots, descriptions

2. **Archive the App:**
   - Xcode: Product → Archive
   - Validate archive
   - Distribute to App Store

3. **Submit for Review:**
   - Upload via Xcode Organizer
   - Complete App Store listing
   - Submit for review

**Estimated Timeline:** 24-72 hours for review

---

### Phase 4: Android Deployment

#### 4.1 Build for Android

```bash
# Build web assets
npm run build

# Sync with Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

#### 4.2 Configure in Android Studio

1. **Update Application ID:**
   - Open `android/app/build.gradle`
   - Set `applicationId "com.backyardbash.cricket"`

2. **Configure App Name:**
   - Edit `android/app/src/main/res/values/strings.xml`
   ```xml
   <string name="app_name">Backyard Bash</string>
   ```

3. **Set Version:**
   - In `build.gradle`:
   ```gradle
   versionCode 1
   versionName "1.0.0"
   ```

4. **Add App Icons:**
   - Generate adaptive icons
   - Place in `res/mipmap-*` folders
   - Update `android/app/src/main/AndroidManifest.xml`

#### 4.3 Test on Android Emulator

```bash
# Create AVD (Android Virtual Device)
# Tools → AVD Manager in Android Studio
# Create device with API 33+

# Run app (in Android Studio)
# Click Run button or Shift+F10
```

#### 4.4 Test on Physical Device

1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Connect via USB
4. Select device in Android Studio
5. Click Run

#### 4.5 Generate Signed APK/AAB

1. **Create Keystore:**
```bash
keytool -genkey -v -keystore backyard-bash-release.keystore \
  -alias backyard-bash -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Signing in Android Studio:**
   - Build → Generate Signed Bundle/APK
   - Select Android App Bundle (AAB)
   - Create or select keystore
   - Build release variant

3. **Outputs:**
   - **APK:** Direct install file
   - **AAB:** Google Play upload format (recommended)

#### 4.6 Google Play Distribution

1. **Create Developer Account:**
   - Pay $25 one-time fee at https://play.google.com/console

2. **Create App in Play Console:**
   - Create new app
   - Fill in app details
   - Upload AAB file
   - Add screenshots, descriptions
   - Set content rating
   - Set pricing (free/paid)

3. **Submit for Review:**
   - Complete all sections
   - Submit for review

**Estimated Timeline:** 1-7 days for review

---

### Phase 5: Mobile-Specific Enhancements

#### 5.1 Add Native Features

```bash
# Install useful plugins
npm install @capacitor/splash-screen
npm install @capacitor/status-bar
npm install @capacitor/haptics
npm install @capacitor/share
```

**Update App.tsx:**
```typescript
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

useEffect(() => {
  // Hide splash screen after app loads
  SplashScreen.hide();

  // Configure status bar
  StatusBar.setStyle({ style: Style.Light });
}, []);
```

#### 5.2 Add Haptic Feedback

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// On button press
const handleButtonPress = async () => {
  await Haptics.impact({ style: ImpactStyle.Light });
  // ... rest of logic
};
```

#### 5.3 Add Share Functionality

```typescript
import { Share } from '@capacitor/share';

const handleShareScore = async () => {
  await Share.share({
    title: 'My Cricket Score',
    text: 'Check out my score in Backyard Bash!',
    url: 'https://backyardbash.com',
  });
};
```

#### 5.4 Optimize for Mobile

**Update CSS for safe areas:**
```css
.app {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

**Update vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});
```

---

## OPTION 2: REACT NATIVE (ALTERNATIVE)

### Why React Native?
- True native performance
- Better access to device features
- Larger ecosystem of native libraries
- Better for complex animations

### Drawbacks:
- Requires complete rewrite
- Different component library (no DOM)
- Longer development time
- Learning curve for React Native

### High-Level Steps:

1. **Setup:**
   ```bash
   npx react-native init BackyardBash --template react-native-template-typescript
   ```

2. **Rewrite Components:**
   - Replace `<div>` with `<View>`
   - Replace `<button>` with `<TouchableOpacity>` or `<Button>`
   - Use React Native StyleSheet instead of Tailwind
   - Migrate state management (same logic)

3. **Replace Libraries:**
   - Use React Native compatible libraries
   - Font Awesome → react-native-vector-icons
   - Tailwind → StyleSheet or styled-components

4. **Build & Deploy:**
   - iOS: `cd ios && pod install && cd .. && npx react-native run-ios`
   - Android: `npx react-native run-android`

**Estimated Rewrite Time:** 2-4 weeks

---

## COMPARISON MATRIX

| Feature | Capacitor | React Native |
|---------|-----------|--------------|
| **Development Time** | 1-2 weeks | 4-6 weeks |
| **Code Reuse** | 95% | 60-70% |
| **Performance** | Good (web view) | Excellent (native) |
| **Native Features** | Via plugins | Direct access |
| **Bundle Size** | Larger | Smaller |
| **Maintenance** | Single codebase | Single codebase |
| **Learning Curve** | Low | Medium |
| **Best For** | Quick deployment | Complex apps |

---

## RECOMMENDED TIMELINE (CAPACITOR)

### Week 1: Setup & Configuration
- Day 1-2: Install tools, setup Capacitor
- Day 3-4: Configure iOS and Android projects
- Day 5: Test on simulators/emulators

### Week 2: Mobile Optimization
- Day 1-2: Add mobile-specific features
- Day 3: Generate app icons and splash screens
- Day 4-5: Test on physical devices

### Week 3: Deployment
- Day 1-2: Create store listings
- Day 3: Generate signed builds
- Day 4: Submit to App Store
- Day 5: Submit to Play Store

### Week 4: Review & Launch
- Wait for store approvals
- Fix any issues flagged by reviewers
- Launch apps

---

## COST ESTIMATES

### One-Time Costs:
- Apple Developer Program: $99/year
- Google Play Developer: $25 one-time
- App Icons/Graphics: $0-50 (if using tools)

### Optional:
- Mac for iOS development: $500-2000 (if needed)
- Physical test devices: $200-800

---

## TESTING CHECKLIST

### Before Submission:

**Functional Testing:**
- [ ] Match setup works
- [ ] Coin toss works
- [ ] Game scoring accurate
- [ ] Match summary displays
- [ ] Gemini API integration works
- [ ] All buttons responsive
- [ ] Navigation flows correctly

**Platform-Specific:**
- [ ] Works on iPhone (13.0+)
- [ ] Works on iPad
- [ ] Works on Android phones (API 24+)
- [ ] Works on Android tablets
- [ ] Handles notch/safe areas
- [ ] Handles orientation changes
- [ ] No memory leaks
- [ ] Fast load times
- [ ] Offline functionality (if applicable)

**Store Requirements:**
- [ ] App icons all sizes
- [ ] Screenshots (5.5", 6.5" for iOS)
- [ ] Privacy policy URL
- [ ] Support URL/email
- [ ] Age rating completed
- [ ] App description written
- [ ] Keywords optimized

---

## CRITICAL CONSIDERATIONS

### API Keys & Security:
⚠️ **NEVER commit API keys to source control**

Options for handling GEMINI_API_KEY:
1. Use environment variables at build time
2. Backend proxy API (recommended for production)
3. Capacitor Preferences plugin

### Backend API (Recommended):
Create a simple proxy server to protect your API key:

```typescript
// backend/server.ts
app.post('/api/commentary', async (req, res) => {
  const response = await genAI.generateCommentary(req.body);
  res.json(response);
});
```

Update geminiService.ts to call your backend instead of direct API.

---

## NEXT STEPS

1. **Choose your approach:** Capacitor (recommended) or React Native
2. **Set up development environment:** Install Xcode and Android Studio
3. **Follow Phase-by-Phase implementation**
4. **Test thoroughly on both platforms**
5. **Submit to stores**

---

## RESOURCES

**Capacitor:**
- Official Docs: https://capacitorjs.com
- iOS Guide: https://capacitorjs.com/docs/ios
- Android Guide: https://capacitorjs.com/docs/android

**App Store:**
- App Store Connect: https://appstoreconnect.apple.com
- Human Interface Guidelines: https://developer.apple.com/design/

**Google Play:**
- Play Console: https://play.google.com/console
- Material Design: https://material.io/design

**Icon Generators:**
- https://icon.kitchen
- https://www.appicon.co
- https://makeappicon.com

---

## SUPPORT

For questions during implementation:
- Capacitor Discord: https://discord.gg/UPYYRhtyzp
- Stack Overflow: Tag `capacitor`, `ios`, `android`
- GitHub Issues: Framework-specific repos

---

**Document Version:** 1.0
**Last Updated:** 2026-01-04
**Status:** Ready for Implementation
