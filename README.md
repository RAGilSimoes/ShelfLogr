# 📚 ShelfLogr

This project was idealized as a Mobile App to help me keep track of the books I read and the ones that I want to read. It also features an **AI agent** that gives tailored suggestions based on the already read books.

To add books to your profile, simply scan the book's barcode!

<div align="center">
  <!-- Replace these links with your actual project screenshots or GIFs -->
  <img src="https://via.placeholder.com/250x500.png?text=Login+Screen+GIF" alt="Login Screen" width="220" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://via.placeholder.com/250x500.png?text=Scanner+Screen+GIF" alt="Scanner Screen" width="220" />
</div>

---

## 🚧 Status

Login and Register implemented. Currently working on the scanning book barcode and getting the book's information through the Google's Book API _(Updated: 11/08/2026)_

---

## Roadmap

- [x] Login and Register
- [x] Scan barcode and fetches information
- [ ] Add Book to one of the lists after scanning barcode
- [ ] Display a book suggestion from the ones the user is reading on the home page
- [ ] Display book suggestions by topic on the home page
- [ ] Search for book by the title, author or category
- [ ] Create chatbot for user interaction
- [ ] Create profile page to see user's lists
- [ ] Create settings page

---

## 💻 Tech Stack

The main technologies used in this project are:

![Ionic](https://img.shields.io/badge/Ionic-%233880FF.svg?style=for-the-badge&logo=Ionic&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/Node.js-%236DA55F.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon.tech](https://img.shields.io/badge/neon.tech-%2300E599.svg?style=for-the-badge&logo=neon&logoColor=black)

---

## App Workflow

**1. Authentication & Navigation:**
The user enters the app and the system immediately checks for a valid token. If the token is invalid or more than 1 day has passed since its expiration date, the user is redirected to the login page. If the token is valid and inside the expiration window, the app navigates directly to the home page. If it is expired but still inside the Grace Period, the front-end refreshes the token in the background and grants access.

**2. Book Scanning Process:**
The user accesses the "Add Book" page, opens the scanner, and scans a barcode. The app verifies the `valueType` property; if it isn't a book barcode, an error is displayed. Otherwise, the app fetches the book information through the Google Books API via a dedicated backend endpoint.

---

## Challenges so far

1. **Token Implementation:** Thinking how the Token process should be implemented to keep the app secured without asking for the login every time the user tries to enter the app. This was solved using the **Grace Period** method with a 1-day acceptance window, managed directly by the front-end.

2. **Mobile Storage:** Still on the Token part, getting to know how storage works on the mobile device (which is different from a web app). This was smoothly solved by using the **Capacitor Package**.

3. **Hardware Integration:** Getting to know how to use the camera was something new for me, but it has been pretty straightforward because of the **Capawesome Package**.

---

## Decisions made

1. **Front-End Security Flow:** Use the Grace Period approach for the token verification, done by the front-end because it is the one getting the already existing token, if applicable.

2. **Backend Proxy for API Calls:** Create an endpoint in the API to fetch the book information, passing only the book ISBN from the front-end. This protects the Google API key and allows the backend to clean up irrelevant information returned by Google before sending the payload to the mobile app.

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

- **Backend:** Create a `.env` file in the `api` folder and configure the needed information
  ```env
  DATABASE_URL=
  JWT_SECRET=
  BOOKS_API_KEY=
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

---

## 👨‍💻 Author

I'm [Ricardo André Simões](https://ragilsimoes.github.io/#/), a Software Developer Enthusiast with a Bachelor's Degree in Computer Engineering from Universidade de Coimbra.
