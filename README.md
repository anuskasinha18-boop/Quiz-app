# 🧠 Elite Trivia Quiz App

A premium, mobile-first **Quiz Web Application** built with pure HTML, CSS, and JavaScript — no frameworks, no libraries. Fetches live questions from the Open Trivia Database API with a stunning dark UI that matches a modern phone app experience.

---

## 📸 Preview

> Launch locally and open `http://localhost:5174/` to see the full experience.

### Screens
| Start Screen | Quiz Screen | Result Screen |
|---|---|---|
| Choose category, difficulty & question count | Timer, hints, option feedback | Score circle, review log |

---

## ✨ Features

- 🌐 **Live API Questions** — Fetches from [Open Trivia Database](https://opentdb.com/) with category, difficulty & count selection
- 📦 **Offline Fallback** — 20 built-in Sports questions used if API is unavailable
- ⏱ **SVG Circular Countdown Timer** — 20-second animated ring that turns red in the final 5 seconds
- 💡 **Hint System** — Eliminates 2 wrong options per question (one-time use)
- ✅ **Visual Answer Feedback** — Green checkmark for correct, orange cross for wrong, with correct answer always revealed
- 🔊 **Web Audio API Sound FX** — Synthesised click, correct chime, incorrect buzz, timer ticks, and fanfare
- 📊 **Animated Score Circle** — SVG arc animates to your score percentage on the result screen
- 📋 **Question Review Log** — Scrollable breakdown of every question answered
- 🎨 **Premium Dark UI** — Purple-to-violet wave header, dark navy cards, orange accent buttons
- 📱 **Fully Responsive** — Phone mockup on desktop, full screen on mobile

---

## 🗂 Project Structure

```
QuizApp/
├── index.html        # App layout (Start, Quiz & Result screens)
├── style.css         # All styles — dark theme, SVG timer, option states
├── app.js            # Core logic — API, timer, audio, hints, score
├── package.json      # Vite dev server config
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v16+
- npm

### Installation & Run

```bash
# Clone the repo
git clone https://github.com/your-username/QuizApp.git
cd QuizApp

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open your browser at **http://localhost:5173/**

---

## 🎮 How to Play

1. **Enter your name** (optional)
2. **Select a category** from the dropdown (General Knowledge, Sports, History, Science, etc.)
3. **Choose difficulty** — Easy, Medium, or Hard
4. **Set the number of questions** — 10, 15, or 20
5. Click **Start Quiz**
6. Answer each question before the **20-second timer** runs out
7. Use the **Hint button** to eliminate 2 wrong options (once per question)
8. After all questions, view your **score, percentage, and question review**

---

## 🔊 Sound Effects

| Action | Sound |
|--------|-------|
| Button click | Soft 700Hz sine tone |
| Correct answer | Ascending C-E-G chime |
| Wrong answer | Dissonant low buzz |
| Timer tick (≤5s) | Sharp 1100Hz tick |
| Time up | Warning sawtooth tone |
| Quiz complete | 4-note ascending fanfare |

> All sounds are synthesised in real-time using the **Web Audio API** — no audio files required.

---

## 📡 API Reference

Questions are fetched from the [Open Trivia Database](https://opentdb.com/api_config.php):

```
GET https://opentdb.com/api.php?amount=10&category=21&difficulty=easy&type=multiple
```

**Response codes:**
- `0` — Success
- `1` — No results for parameters (fallback questions used)
- `5` — Rate limited (wait 5 seconds before retry)

---

## 🛠 Tech Stack

| Technology | Usage |
|------------|-------|
| HTML5 | Semantic structure, SVG timer rings |
| CSS3 | Custom properties, keyframe animations, glassmorphism |
| JavaScript (ES6+) | Module pattern, async/await, Web Audio API |
| Open Trivia DB | Live trivia question source |
| Vite | Local dev server & bundler |

---

## 📱 Responsive Design

| Viewport | Behaviour |
|----------|-----------|
| > 480px (desktop) | Phone frame mockup (390×844px) centred on screen |
| ≤ 480px (mobile) | Full-screen layout, no frame border |

---

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready to deploy to any static host (Netlify, Vercel, GitHub Pages, etc.).

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ using pure HTML, CSS & JavaScript</p>
