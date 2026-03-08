# 🚀 Hackathon Mentor AI — HD Chatbot

An AI-powered hackathon assistant chatbot built with **Node.js**, **Express**, and **Hugging Face AI**.

Ask it anything about hackathons — from beginner questions to advanced tips!

---

## ✨ Features

- 💬 AI chat powered by Meta Llama 3 (via Hugging Face)
- 🌱 Fresher-friendly quick question cards
- 🔐 Login / Register system
- 🌙 Dark & Light theme toggle
- 💾 Chat history per user
- 📱 Fully responsive design

---

## 📁 Project Structure

```
Hackathon-Proj/
├── public/
│   ├── index.html     ← Frontend UI
│   ├── styles.css     ← All styling
│   ├── script.js      ← Frontend logic
│   ├── logo.png       ← Splash logo
│   └── logo1.png      ← Header logo
├── server.js          ← Node.js backend
├── package.json       ← Dependencies
├── .env.example       ← Environment variable template
├── .gitignore         ← Ignored files
└── README.md          ← This file
```

---

## ⚙️ Setup & Run

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/hackathon-proj.git
cd hackathon-proj
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
# Copy the example file
cp .env.example .env

# Open .env and add your Hugging Face token
# Get your free token from: https://huggingface.co/settings/tokens
```

### 4. Start the server
```bash
npm start
```

### 5. Open in browser
```
http://localhost:3000
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `HF_ACCESS_TOKEN` | Your Hugging Face API token |

> ⚠️ **Never share your `.env` file or commit it to GitHub!**

---

## 🛠️ Tech Stack

- **Frontend** — HTML, CSS, JavaScript
- **Backend** — Node.js, Express
- **AI Model** — Meta Llama 3 8B (Hugging Face Inference API)
- **Styling** — Custom CSS + Google Fonts + Font Awesome

---

## 👨‍💻 Built for Hackathon

This project was built during a hackathon to help participants — especially freshers — get instant AI-powered guidance.

---

*Good luck hacking! 🎯*
