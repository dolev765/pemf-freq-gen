# Quick SDK Installation Guide

## ✅ Your Setup
- ✅ Android Studio: **Installed**
- ✅ SDK Directory: **Created** (`C:\Users\User\AppData\Local\Android\Sdk`)
- ✅ local.properties: **Configured**
- ❌ SDK Components: **Need to install**

## 🚀 Install SDK (5 minutes)

### Step 1: Open Android Studio
- Launch Android Studio from Start Menu

### Step 2: Open SDK Manager
**Method A:** From Welcome Screen
- Click "More Actions" → "SDK Manager"

**Method B:** From Settings
- `File → Settings` (or `Ctrl+Alt+S`)
- `Appearance & Behavior → System Settings → Android SDK`

### Step 3: Install Required Components

**SDK Platforms Tab:**
- ✅ Check at least **one Android version** (e.g., Android 13.0 "Tiramisu" or latest)
- Recommended: Android 13.0 (API 33) or Android 14.0 (API 34)

**SDK Tools Tab:**
- ✅ **Android SDK Build-Tools** (latest)
- ✅ **Android SDK Platform-Tools**
- ✅ **Android SDK Command-line Tools (latest)**
- ✅ **Android Emulator** (optional, for testing)

### Step 4: Install
- Click **"Apply"** button
- Wait for download and installation (may take a few minutes)
- Click **"OK"** when done

## ✅ Verify Installation

After installation, run:
```powershell
cd "d:\Download\better tone gen\phyphox-android"
.\gradlew.bat assembleDebug
```

If it compiles successfully, you're done! 🎉

## 📝 Notes

- SDK will be installed to: `C:\Users\User\AppData\Local\Android\Sdk`
- The `local.properties` file is already configured correctly
- You only need to do this once
