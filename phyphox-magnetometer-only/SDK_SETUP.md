# Android SDK Setup Required

## Issue
The Android SDK location is not configured. The build cannot proceed without it.

## Solution

### Option 1: Find Your SDK Location
1. Open Android Studio
2. Go to: **File → Settings → Appearance & Behavior → System Settings → Android SDK**
3. Copy the "Android SDK Location" path
4. Update `local.properties` in the phyphox-android directory

### Option 2: Set Environment Variable
Set `ANDROID_HOME` environment variable to your SDK path:
```powershell
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\path\to\Android\Sdk', 'User')
```

### Option 3: Common SDK Locations
Check these common locations:
- `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
- `C:\Android\Sdk`
- `%LOCALAPPDATA%\Android\Sdk`

## Update local.properties

Once you find your SDK path, update `phyphox-android/local.properties`:
```
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

**Note:** Use double backslashes (`\\`) in the path.

## After SDK Setup

Run:
```powershell
cd "d:\Download\better tone gen\phyphox-android"
.\gradlew.bat assembleDebug
```

The app should then compile successfully!
