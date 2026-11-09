# 📚 ShelfLogr - Setup & Development Guide

This guide covers everything required to set up, build, and run **ShelfLogr** on web browsers, physical Android devices, and desktop Android emulators.

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

1. **Node.js** (LTS version, v18 or later) & **NPM**.
2. **Ionic CLI** installed globally:
   ```bash
   npm install -g @ionic/cli
   ```
3. **Java JDK 21 (LTS)**:
   > ⚠️ **Important:** Gradle 8.x and Android SDK 36 **require Java 17 or Java 21**. Do **not** use Java 25 or Java 27 (they will cause `Unsupported class file major version` errors).
   > If you use Android Studio, you already have JetBrains Runtime 21 located at:
   > `C:\Users\<username>\.jdks\jbr-21.0.11` or inside your Android Studio installation directory.
4. **Android Studio** with:
   - Android SDK Platform (API 34 or later)
   - Android SDK Command-line Tools & Platform-tools (`adb`).
5. **Windows Environment Variables & Gradle Configuration**:
   - `JAVA_HOME`: Set to your JDK 21 path (e.g., `C:\Users\<username>\.jdks\jbr-21.0.11`).
   - `CAPACITOR_ANDROID_STUDIO_PATH` (if Android Studio is installed in your user directory):
     ```powershell
     [System.Environment]::SetEnvironmentVariable('CAPACITOR_ANDROID_STUDIO_PATH', "$env:LOCALAPPDATA\Programs\Android Studio\bin\studio64.exe", 'User')
     ```
   - 🔒 **Git Portability Rule for Gradle:**
     Never commit absolute user paths (such as `C:/Users/<name>/...`) inside `mobile/android/gradle.properties`. Keep that setting in your machine's personal `~/.gradle/gradle.properties` file so the repository stays 100% portable across different computers and operating systems:
     ```powershell
     Set-Content -Path "$env:USERPROFILE\.gradle\gradle.properties" -Value "org.gradle.java.home=C:/Users/<username>/.jdks/jbr-21.0.11"
     ```

---

### 📱 Creating an Android Emulator (Virtual Device) on your PC

If you don't have a physical Android device or want to test inside Windows:

1. Open **Android Studio**.
2. From the welcome screen, click **More Actions > Virtual Device Manager** (or if a project is open, open the **Device Manager** icon from the right-hand sidebar or menu: **Tools > Device Manager**).
3. Click **Create Device** (the `+` icon).
4. Select a hardware profile (recommended: **Pixel 7** or **Medium Phone**) and click **Next**.
5. Select a system image: Choose **API 34** (UpsideDownCake) or **API 35** (x86_64 with Google Play Store), download it if prompted, and click **Next**.
6. Set an AVD name and click **Finish**.
7. Click the **Play (▶)** button in Device Manager to launch your virtual phone in a window on your desktop.

---

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies for all workspaces (Root, API, Mobile, Shared):

```bash
npm install
```

---

### 2. Environment Variables

Create the `.env` configuration files for both projects:

#### **Backend (`api/.env`):**
```env
DATABASE_URL="your-postgresql-neon-database-url"
JWT_SECRET="your-jwt-secret-key"
BOOKS_API_KEY="your-google-books-api-key"
NYT_API_KEY="your-new-york-times-api-key"
DISCORD_BOT_WEBHOOK="your-discord-webhook-url"
RESEND_API_KEY="your-resend-api-key"
```

#### **Frontend (`mobile/.env`):**
```env
VITE_BACKEND_URL='http://localhost:3000/api'
```

---

## 📱 Running the Application

> 💡 **Initial Build Note for Mobile:**
> Because the `dist` folder is excluded by `.gitignore`, you must build the web assets **once** before running any native Android commands for the very first time:
> ```bash
> cd mobile
> npm run build
> npx cap sync
> ```
> *(After this initial sync, the Live Reload workflows below will handle updating the UI in real time without needing further manual builds).*

Choose one of the development workflows below:

---

### Workflow A: Physical Android Device via USB (Recommended for Hardware Testing) ⭐

Test real camera scanning, gestures, and native performance with instant Live Reload through USB.

#### Device Preparation:
1. Connect your Android phone to your PC with a USB cable.
2. Enable **Developer Options** (tap *Build Number* 7 times in *Settings > About Phone*).
3. Enable **USB Debugging** in *Developer Options*.

#### Terminal 1 — Start the Backend Server:
```bash
cd api
npm run dev
```

#### Terminal 2 — Start the Vite Frontend Server:
```bash
cd mobile
npm run dev -- --host
```

#### Terminal 3 — Bridge Ports via USB & Launch:
```powershell
# 1. Forward ports so your phone can reach Vite and the API through the USB cable:
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:5173 tcp:5173

# 2. Deploy and run on your physical phone with Live Reload:
cd mobile
npx cap run android -l --port 5173 --host localhost
```
*(Select your connected phone model from the list).*

---

### Workflow B: Android Emulator on your PC (Virtual Device) 💻

Test the Android app directly on your computer without connecting a physical phone.

1. **Launch the Emulator:** In Android Studio, open **Device Manager** and click the **Play (▶)** button on your virtual device. Wait for Android to boot to the home screen.
2. **Terminal 1 — Start Backend:**
   ```bash
   cd api
   npm run dev
   ```
3. **Terminal 2 — Start Frontend Server:**
   ```bash
   cd mobile
   npm run dev -- --host
   ```
4. **Terminal 3 — Bridge Ports & Launch:**
   ```powershell
   # 1. Forward ports to the emulator:
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:5173 tcp:5173

   # 2. Deploy and run on the emulator with Live Reload:
   cd mobile
   npx cap run android -l --port 5173 --host localhost
   ```
   *(When prompted with `? Please choose a target device:`, select your emulator, e.g. `Medium_Phone_API_35` or `emulator-5554`).*

---

### Workflow C: Web Browser Development (Fast UI & CSS Testing)

Best for rapid UI design, CSS styling, and general React development without loading Android.

1. **Terminal 1 (Backend):**
   ```bash
   cd api
   npm run dev
   ```
2. **Terminal 2 (Frontend):**
   ```bash
   cd mobile
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.
4. Press `F12` and toggle the **Device Toolbar** (`Ctrl + Shift + M`) to simulate a mobile screen.

---

### Workflow D: Standalone Native Build (Offline / Without Live Reload)

Installs the app directly onto your phone or emulator to run 100% offline like a standard downloaded store app:

```bash
cd mobile
npm run build
npx cap sync
npx cap run android
```

---

## 🛠️ Troubleshooting & Common Fixes

### 1. `Unsupported class file major version (69 or 71)`
* **Cause:** Gradle is picking up an unsupported Java version (Java 25 or 27).
* **Fix:** Tell Gradle to strictly use Java 21 on your machine by adding this to your personal `~/.gradle/gradle.properties`:
  ```properties
  org.gradle.java.home=C:/Users/<username>/.jdks/jbr-21.0.11
  ```
  Then stop old Gradle daemons: `cd mobile/android && ./gradlew --stop`.

### 2. `Unexpected error occurred` when logging in on the phone / emulator
* **Cause 1:** The backend server (`cd api && npm run dev`) is not running.
* **Cause 2:** Port `3000` was not reversed to your PC.
* **Fix:** Run `adb reverse tcp:3000 tcp:3000` in your terminal.

### 3. VS Code showing Java / Gradle errors on startup
* The mobile native build is handled by **Capacitor and Android Studio**.
* In VS Code, disable the extensions **"Gradle for Java"** and **"Language Support for Java"** for this workspace (`Disable (Workspace)`) to keep VS Code fast and clean.
