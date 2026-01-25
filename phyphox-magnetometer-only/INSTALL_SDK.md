# Install Android SDK

## Option 1: Use Android Studio (Recommended - Already Installed!)

Since Android Studio is already installed, use its SDK Manager:

1. **Open Android Studio**
2. **Go to:** `File → Settings → Appearance & Behavior → System Settings → Android SDK`
   - Or: `Tools → SDK Manager`
3. **In the SDK Platforms tab:**
   - Check at least one Android version (e.g., Android 13.0 "Tiramisu" or latest)
   - Check "Show Package Details" if needed
4. **In the SDK Tools tab:**
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android SDK Command-line Tools
   - ✅ Android Emulator (optional, for testing)
5. **Click "Apply"** to download and install

The SDK will be installed to: `C:\Users\User\AppData\Local\Android\Sdk`

## Option 2: Command Line Tools (Alternative)

If you prefer command-line installation:

1. Download from: https://developer.android.com/studio#command-tools
2. Extract to: `C:\Users\User\AppData\Local\Android\Sdk\cmdline-tools\latest`
3. Run:
   ```powershell
   cd "C:\Users\User\AppData\Local\Android\Sdk\cmdline-tools\latest\bin"
   .\sdkmanager.bat "platform-tools" "platforms;android-33" "build-tools;33.0.0"
   ```

## Verify Installation

After installation, verify:
```powershell
Test-Path "C:\Users\User\AppData\Local\Android\Sdk\platform-tools"
```

If it returns `True`, the SDK is installed!

## Update local.properties

Once SDK is installed, `local.properties` should already have:
```
sdk.dir=C\:\\Users\\User\\AppData\\Local\\Android\\Sdk
```

If not, update it with the correct path.

## Compile the App

After SDK installation:
```powershell
cd "d:\Download\better tone gen\phyphox-android"
.\gradlew.bat assembleDebug
```
