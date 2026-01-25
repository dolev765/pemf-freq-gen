# Online Solutions for Android SDK Platform Installation Issues

Based on search results from Stack Overflow and Android Developer documentation, here are proven solutions:

## 🔧 Solution 1: Reinstall via Android Studio (RECOMMENDED)

**Steps:**
1. Open Android Studio
2. Go to: `File → Settings → Appearance & Behavior → System Settings → Android SDK`
3. Click **"SDK Platforms"** tab
4. **UNCHECK** "Android 15.0 (VanillaIceCream) API 35"
5. Click **"Apply"** - wait for removal to complete
6. **CHECK** "Android 14.0 (UpsideDownCake) API 34" (more stable)
7. Click **"Apply"** - wait for complete installation
8. Verify installation shows "Installed" status

**Why this works:** Removes corrupted/incomplete installation and reinstalls cleanly.

## 🔧 Solution 2: Use Command-Line sdkmanager

If Android Studio UI doesn't work:

```powershell
cd "C:\Users\User\AppData\Local\Android\Sdk\cmdline-tools\latest\bin"
.\sdkmanager.bat --uninstall "platforms;android-35"
.\sdkmanager.bat "platforms;android-34"
```

Then accept licenses:
```powershell
echo y | .\sdkmanager.bat --licenses
```

## 🔧 Solution 3: Manual Cleanup + Reinstall

1. **Delete incomplete platform folder:**
   ```powershell
   Remove-Item "C:\Users\User\AppData\Local\Android\Sdk\platforms\android-35" -Recurse -Force
   ```

2. **Reinstall via Android Studio SDK Manager** (as in Solution 1)

## 🔧 Solution 4: Use Stable API Level (Workaround)

Since Platform 35 may have compatibility issues:

1. Install **Platform 34** instead (more stable)
2. Update `build.gradle`:
   ```gradle
   compileSdk 34
   targetSdkVersion 34
   ```
3. This is a safe workaround that works with all Android Studio versions

## 🔧 Solution 5: Update Android Studio

Platform 35 (Android 15) requires:
- **Android Studio Koala 2024.1.1** or later
- Latest SDK Command-line Tools

Check your version: `Help → About`

## ✅ Verification

After installation, verify:
```powershell
Test-Path "C:\Users\User\AppData\Local\Android\Sdk\platforms\android-34\android.jar"
```

Should return `True`.

## 📝 Notes

- **Platform 35** (Android 15) was recently released and may have compatibility issues
- **Platform 34** (Android 14) is more stable and recommended for now
- Always wait for installation to complete fully before closing SDK Manager
- If installation fails, check internet connection and try again

## 🚀 After Fix

Once a complete platform is installed, compile:
```powershell
cd "d:\Download\better tone gen\phyphox-android"
.\gradlew.bat assembleDebug
```
