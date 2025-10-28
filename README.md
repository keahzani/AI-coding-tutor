# 🎓 AI Coding Tutor

An intelligent coding tutor web application that uses the Socratic method to help students learn programming through guided discovery. Instead of providing direct answers, the AI asks probing questions to help students think through problems and arrive at solutions themselves.

![AI Coding Tutor](https://img.shields.io/badge/AI-Coding%20Tutor-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![Gemini API](https://img.shields.io/badge/Google-Gemini%20API-green)

## ✨ Features

- 🤖 **Socratic Teaching Method** - Guides students through questions rather than giving direct answers
- 💾 **Persistent Conversations** - All chat history saved to Firebase Firestore
- 👤 **User Profiles** - Personalized learning experience based on proficiency level
- 🔄 **Real-time Sync** - Conversations update in real-time across sessions
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations
- 💬 **Code Highlighting** - Supports markdown code blocks with syntax highlighting

## 🚀 Live Demo

- **Firebase Hosting:** [https://ai-coding-tutor-69744.web.app](https://ai-coding-tutor-69744.web.app)
- **Vercel Deployment:** (https://ai-coding-tutor-one.vercel.app/)

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend Services:**
  - Firebase Authentication (Anonymous Auth)
  - Firebase Firestore (Database)
- **AI Model:** Google Gemini API (gemini-flash-latest)
- **Hosting:** Firebase Hosting, Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js and npm installed
- A Google Cloud / Firebase account
- A Google AI Studio account (for Gemini API)
- Git installed on your machine

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/keahzani/AI-coding-tutor.git
cd AI-coding-tutor
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Sign-in method → **Anonymous**
4. Enable **Firestore Database** → Start in test mode
5. Get your Firebase configuration:
   - Project Settings → General → Your apps → Web app
   - Copy the configuration object

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Select your Firebase/Google Cloud project
4. Copy the generated API key

### 4. Configure Environment Variables

Create a `config.js` file in the root directory:

```javascript
const __firebase_config = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebasedatabase.app",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

const __app_id = "coding_tutor_app";
const __gemini_api_key = "YOUR_GEMINI_API_KEY";
```

**⚠️ Important:** Add `config.js` to `.gitignore` to keep your API keys secure!

### 5. Update Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/{document=**} {
      // Users can only access their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Deployment

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Output Directory:** `public`
5. Add environment variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your Gemini API key
6. Deploy!

## 📁 Project Structure

```
AI-coding-tutor/
├── public/
│   ├── index.html          # Main HTML file with UI
│   ├── app.js              # Application logic
│   └── config.js           # Configuration (not in repo)
├── .firebaserc             # Firebase project config
├── firebase.json           # Firebase hosting config
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🎯 How It Works

### Architecture

The application follows a three-layer architecture:

1. **Frontend (UI Layer)**
   - Responsive chat interface
   - Message input and display
   - Real-time updates

2. **Application Logic Layer**
   - Firebase authentication
   - Firestore data management
   - Gemini API integration
   - Prompt engineering

3. **Persistence Layer**
   - User profiles in Firestore
   - Conversation history
   - Real-time synchronization

### Data Structure

```
Firestore:
/artifacts
  /{app_id}
    /users
      /{user_id}
        /user_profile
          /settings (proficiency, goals, language)
        /conversations
          /{message_id} (role, text, timestamp)
```

### Teaching Methodology

The AI tutor follows these principles:

1. **Never give direct answers** - Always guide through questions
2. **Socratic questioning** - Ask probing questions that lead to discovery
3. **Step-by-step guidance** - Break complex problems into manageable parts
4. **Positive reinforcement** - Encourage and celebrate progress
5. **Adaptive difficulty** - Adjust language based on proficiency level

## 🔐 Security Best Practices

- ✅ API keys stored in environment variables
- ✅ Firestore rules restrict access to user's own data
- ✅ Anonymous authentication enabled
- ✅ Sensitive files added to `.gitignore`
- ✅ No API keys committed to repository

## 🐛 Troubleshooting

### App shows "Failed to initialize"
- Check that `config.js` exists in the `public/` folder
- Verify all API keys are correct
- Check browser console for specific errors

### Gemini API returns 404 error
- Verify your API key is valid
- Check that the Generative Language API is enabled in Google Cloud
- Ensure you're using a valid model name (e.g., `gemini-flash-latest`)

### Messages not saving to Firestore
- Check Firestore security rules
- Verify Firebase configuration is correct
- Ensure Anonymous authentication is enabled

### CORS errors
- Firebase and Gemini APIs should handle CORS automatically
- If issues persist, check API restrictions in Google Cloud Console

## 📝 Usage Example

1. **Start a Conversation:**
   ```
   User: "I want to learn Python loops"
   ```

2. **AI Response (Socratic Method):**
   ```
   AI: "That's a great topic! Before we dive in, can you tell me 
   what you think a loop might be useful for in programming?"
   ```

3. **User Explores:**
   ```
   User: "To repeat things?"
   ```

4. **AI Guides:**
   ```
   AI: "Exactly! Now, can you think of a real-world example where 
   you might need to repeat an action multiple times?"
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Keah Zani**
- GitHub: [@keahzani](https://github.com/keahzani)
- Project Link: [https://github.com/keahzani/AI-coding-tutor](https://github.com/keahzani/AI-coding-tutor)

## 🙏 Acknowledgments

- Google Gemini AI for the powerful language model
- Firebase for backend infrastructure
- Inspired by the Socratic teaching method
- Built as part of the PLP (Power Learn Project) curriculum

## 📞 Support

For support, please open an issue in the GitHub repository or contact the author.

---

**⭐ If you find this project helpful, please consider giving it a star!**
