# 📚 ShelfLogr - Setup & Development Guide

This guide covers everything required to set up, build, and run **ShelfLogr** on both web browsers and physical Android devices.

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
5. **Windows Environment Variables** (Recommended):
   - `JAVA_HOME`: Set to your JDK 21 path (e.g., `C:\Users\<username>\.jdks\jbr-21.0.11`).
   - `CAPACITOR_ANDROID_STUDIO_PATH` (if Android Studio is installed in your user directory):
     ```powershell
     [System.Environment]::SetEnvironmentVariable('CAPACITOR_ANDROID_STUDIO_PATH', "$env:LOCALAPPDATA\Programs\Android Studio\bin\studio64.exe", 'User')
     ```

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

Choose one of the development workflows below:

---

### Workflow A: Physical Android Device via USB (Recommended for Mobile Testing) ⭐

This is the most reliable way to test real hardware features (camera, barcode scanner, gestures) with instant **Live Reload** through your USB cable, completely independent of local Wi-Fi networks.

#### Device Preparation:
1. Connect your Android phone to your PC with a USB cable.
2. Enable **Developer Options** (tap *Build Number* 7 times in *Settings > About Phone*).
3. Enable **USB Debugging** in *Developer Options*.

#### Terminal 1 — Start the Backend Server:
```bash
cd api
npm run dev
```
*(Runs the Express API on port `3000`)*

#### Terminal 2 — Start the Vite Frontend Server:
```bash
cd mobile
npm run dev -- --host
```
*(Runs the React/Vite development server on port `5173`)*

#### Terminal 3 — Bridge Ports via USB & Launch with Live Reload:
```powershell
# 1. Forward ports so your phone can reach both Vite and the Backend through the USB cable:
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:5173 tcp:5173

# 2. Deploy and run on your physical phone with Live Reload:
cd mobile
npx cap run android -l --port 5173 --host localhost
```

> **Why this works:** Every change you make in React/CSS will instantly refresh on your phone's screen. Any API calls to `localhost:3000` will travel directly through the USB cable to your laptop!

---

### Workflow B: Web Browser Development (Fast UI & Form Testing)

Best for developing UI components, navigation, CSS, and API queries without connecting a phone.

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

### Workflow C: Standalone Native Build (Without Live Reload)

Installs the app directly onto your phone to run 100% offline like a standard downloaded app:

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

### 2. `Unexpected error occurred` when logging in on the physical phone
* **Cause 1:** The backend server (`cd api && npm run dev`) is not running.
* **Cause 2:** The USB port `3000` was not reversed to your PC.
* **Fix:** Run `adb reverse tcp:3000 tcp:3000` in your terminal.

### 3. VS Code showing Java / Gradle errors on startup
* The mobile native build is handled by **Capacitor and Android Studio**.
* In VS Code, disable the extensions **"Gradle for Java"** and **"Language Support for Java"** for this workspace (`Disable (Workspace)`) to keep VS Code fast and clean.
