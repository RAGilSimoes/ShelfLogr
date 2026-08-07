# 📚 ShelfLogr

This project was idealized as a Mobile App to help me keep track of the books I read and the ones that I want to read. It also features an **AI agent** that gives tailored suggestions based on the already read books.

To add books to your profile, simply scan the book's barcode!

---

## 🚧 Status

Created necessary folders and I'm currently working on the Login part of the app. _(Updated: 07/08/2026)_

---

## 💻 Tech Stack

The main technologies used in this project are:

- **Frontend:** Ionic with React
- **Backend:** NodeJS with Express
- **Database:** PostgreSQL (hosted on Neon)

---

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed the latest version of [Node.js](https://nodejs.org/) and NPM.
- You have installed the Ionic CLI globally by running: `npm install -g @ionic/cli`.

---

## 🚀 Getting Started

Follow these steps to get your development environment set up:

### 1. Installation

Clone the repository and install the dependencies for both the Frontend and Backend.

**For the Backend:**

```bash
cd api
npm install
```

**For the Mobile App (Frontend):**

```bash
cd mobile
npm install
```

### 2. Environment Variables

You will need to set up the environment variables to connect the app to the database and the API.

- **Backend:** Create a `.env` file in the `api` folder with your database credentials (e.g., `DATABASE_URL`, `PORT`).
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

---

## 👨‍💻 Author

I'm [Ricardo André Simões](https://ragilsimoes.github.io/#/), a Software Developer Enthusiast with a Bachelor's Degree in Computer Engineering from Universidade de Coimbra.
