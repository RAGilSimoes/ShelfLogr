## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed the latest version of [Node.js](https://nodejs.org/) and NPM.
- You have installed the Ionic CLI globally by running: `npm install -g @ionic/cli`.

---

## 🚀 Getting Started

Follow these steps to get your development environment set up:

### 1. Installation

Clone the repository and install the dependencies for both the Frontend and Backend.

**Source Folder:**

```bash
npm install
```

### 2. Environment Variables

You will need to set up the environment variables to connect the app to the database and the API.

- **Backend:** Create a `.env` file in the `api` folder and configure the needed information
  ```env
  DATABASE_URL=
  JWT_SECRET=
  BOOKS_API_KEY=
  NYT_API_KEY=
  DISCORD_BOT_WEBHOOK=
  ```
- **Frontend:** Create a `.env` file in the `mobile` folder and configure the API URL
  ```env
  VITE_BACKEND_URL=`Your backend URL`
  ```

### 3. Running the Application

You need to start both servers concurrently.

**Start the Backend Server:**

```bash
cd api
npm run dev
```

**Start the Frontend (Ionic App):**
In a new terminal window, run:

```bash
cd mobile
ionic serve
```

### 📱 4. Running on Android (Native)

Since the `android` folder is already included in this repository, you don't need to add the platform from scratch. You just need to compile the latest web code and sync it to the native project.

**Prerequisites:**

- [Android Studio](https://developer.android.com/studio) installed.

**Steps:**

1. Build the frontend web assets:
   ```bash
   cd mobile
   npm run build
   npx cap sync
   npx cap open android
   ```
