# ALL ai generated README hahahahah
Developed using Google Antigravity for MVP.

# 🔒 Prompt Sanitizer

A powerful React SPA for detecting and sanitizing sensitive information from prompts. Built with Vite, Tailwind CSS, and Firebase.

## ✨ Features

- **🎭 Guest Mode**: Use the sanitizer without logging in
- **🔐 Secure Authentication**: Email/password auth restricted to `@corp.com` domain
- **🧹 Smart PII Detection**: Automatically detects and masks:
  - Email addresses
  - Phone numbers
  - Credit card numbers
  - API keys (OpenAI, AWS)
  - IPv4 addresses
  - IBAN numbers
- **📜 History Tracking**: Authenticated users can view their sanitization history
- **💬 Community Feedback**: Share feedback and vote on others' suggestions
- **🌙 Dark Mode**: Beautiful dark theme with glassmorphism effects
- **🆓 Free & Open Source**: Completely free forever

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone or extract the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication > Email/Password
   - Create a Firestore database
   - Copy your Firebase config from Project Settings > General > Your apps
   - Update `src/firebase.js` with your credentials:

   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

4. **Set up Firestore Collections**
   
   The app uses two collections:
   - `logs` - Stores sanitization history
   - `feedbacks` - Stores community feedback
   
   These will be created automatically when you first use the features.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

## 📖 Usage

### Guest Mode
- Open the app
- Navigate to the "Sanitizer" tab
- Paste your text and click "SANITIZE"
- Note: History is not saved for guests

### Authenticated Mode
1. Click "Login" in the navbar
2. Register with an `@corp.com` email address
3. Use the sanitizer - your history will be saved
4. View your history in the "History" tab
5. Submit feedback via Resources > Feedback

## 🏗️ Project Structure

```
prompt-sanitizer/
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx          # Login/Register modal
│   │   ├── HistoryList.jsx        # Sanitization history
│   │   ├── InfoModals.jsx         # Pricing/FAQ/Contact/Feedback modals
│   │   ├── Navbar.jsx             # Navigation bar
│   │   └── SanitizerWorkspace.jsx # Main sanitizer UI
│   ├── App.jsx                    # Main app component
│   ├── firebase.js                # Firebase configuration
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Tailwind styles
├── index.html                     # HTML entry point
├── package.json                   # Dependencies
├── tailwind.config.js             # Tailwind configuration
├── postcss.config.js              # PostCSS configuration
└── vite.config.js                 # Vite configuration
```

## ⚠️ Important Security Note

**This is a demonstration application.** The disclaimer warns users not to enter real sensitive data. In a production environment:

- Deploy on internal servers with proper security measures
- Implement proper encryption for stored data
- Add rate limiting and additional security layers
- Conduct security audits
- Implement proper access controls

## 🛠️ Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase** - Authentication & Database
- **React Icons** - Icon library

## 📝 License

This project is free and open-source.

## 👨‍💻 Vayb Kodır

[Menesay](https://github.com/Menesay/)

