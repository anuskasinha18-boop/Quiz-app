/* -------------------------------------------------------------
 * PREMIUM MOBILE-FIRST QUIZ APP - CORE LOGIC
 * ------------------------------------------------------------- */

// State
const state = {
  questions: [], currentIndex: 0, score: 0, totalQuestions: 10,
  difficulty: 'easy', category: '21', username: 'Guest Player',
  hintsRemaining: 1, timerInterval: null, timeLeft: 20,
  answered: false, reviewLog: [],
};

const TIMER_CIRCUMFERENCE = 2 * Math.PI * 28;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone({ frequency = 440, type = 'sine', duration = 0.15, gain = 0.08, delay = 0 } = {}) {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + duration);
  } catch (_) {}
}

function sfxClick()    { playTone({ frequency: 700, type: 'sine', duration: 0.06, gain: 0.06 }); }
function sfxCorrect()  { [523, 659, 784].forEach((f, i) => playTone({ frequency: f, type: 'sine', duration: 0.22, gain: 0.07, delay: i * 0.10 })); }
function sfxIncorrect(){ playTone({ frequency: 160, type: 'sawtooth', duration: 0.3, gain: 0.07 }); playTone({ frequency: 120, type: 'square', duration: 0.3, gain: 0.04, delay: 0.05 }); }
function sfxTick()     { playTone({ frequency: 1100, type: 'sine', duration: 0.04, gain: 0.03 }); }
function sfxFanfare()  { [523, 659, 784, 1047].forEach((f, i) => playTone({ frequency: f, type: 'sine', duration: 0.25, gain: 0.08, delay: i * 0.12 })); }
function sfxTimeout()  { playTone({ frequency: 200, type: 'sawtooth', duration: 0.5, gain: 0.07 }); }

// DOM
const startScreen         = document.getElementById('start-screen');
const quizScreen          = document.getElementById('quiz-screen');
const resultScreen        = document.getElementById('result-screen');
const startBtn            = document.getElementById('start-btn');
const nextBtn             = document.getElementById('next-btn');
const restartBtn          = document.getElementById('restart-btn');
const usernameInput       = document.getElementById('username');
const categorySelect      = document.getElementById('category-select');
const optionsContainer    = document.getElementById('options-container');
const questionText        = document.getElementById('question-text');
const questionCategory    = document.getElementById('question-category');
const currentQuestionNum  = document.getElementById('current-question-num');
const questionProgressTxt = document.getElementById('question-progress-text');
const scoreText           = document.getElementById('score-text');
const timerCountdown      = document.getElementById('timer-countdown');
const timerCircleFill     = document.getElementById('timer-circle-fill');
const progressBarFill     = document.getElementById('progress-bar-fill');
const hintBtn             = document.getElementById('hint-btn');
const resultGreeting      = document.getElementById('result-greeting');
const resultUsername      = document.getElementById('result-username');
const scoreRatio          = document.getElementById('score-ratio');
const scoreSummaryText    = document.getElementById('score-summary-text');
const reviewContainer     = document.getElementById('review-container');
const scoreCircleFill     = document.getElementById('score-circle-fill');

// Tabs
function initTabs(selector, stateKey) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(selector).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state[stateKey] = btn.dataset[stateKey === 'difficulty' ? 'diff' : 'amt'];
      sfxClick();
    });
  });
}
initTabs('.diff-tab', 'difficulty');
initTabs('.amt-tab',  'totalQuestions');

function showScreen(screen) {
  [startScreen, quizScreen, resultScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const FALLBACK_QUESTIONS = [
  { question: "What is the most popular sport throughout the world?", correct_answer: "Soccer", incorrect_answers: ["Basketball", "Cricket", "Badminton"], category: "Sports Quiz" },
  { question: "How many players are there in a cricket team?", correct_answer: "11", incorrect_answers: ["9", "10", "12"], category: "Sports Quiz" },
  { question: "In which sport is the term 'Grand Slam' used?", correct_answer: "Tennis", incorrect_answers: ["Golf", "Baseball", "Cricket"], category: "Sports Quiz" },
  { question: "Which country has won the most FIFA World Cup titles?", correct_answer: "Brazil", incorrect_answers: ["Germany", "Italy", "Argentina"], category: "Sports Quiz" },
  { question: "How many minutes are in a standard soccer match?", correct_answer: "90", incorrect_answers: ["80", "100", "120"], category: "Sports Quiz" },
  { question: "In basketball, how many points is a free throw worth?", correct_answer: "1", incorrect_answers: ["2", "3", "4"], category: "Sports Quiz" },
  { question: "Which sport uses a shuttlecock?", correct_answer: "Badminton", incorrect_answers: ["Tennis", "Squash", "Volleyball"], category: "Sports Quiz" },
  { question: "What is the maximum number of points in a single bowling game?", correct_answer: "300", incorrect_answers: ["200", "250", "400"], category: "Sports Quiz" },
  { question: "How many holes are in a standard round of golf?", correct_answer: "18", incorrect_answers: ["9", "16", "24"], category: "Sports Quiz" },
  { question: "Which sport is known as 'the sweet science'?", correct_answer: "Boxing", incorrect_answers: ["Wrestling", "Judo", "Karate"], category: "Sports Quiz" },
  { question: "What is the diameter of a basketball hoop in inches?", correct_answer: "18", incorrect_answers: ["16", "20", "22"], category: "Sports Quiz" },
  { question: "How long is an Olympic swimming pool?", correct_answer: "50 meters", incorrect_answers: ["25 meters", "100 meters", "75 meters"], category: "Sports Quiz" },
  { question: "In which city were the first modern Olympics held?", correct_answer: "Athens", incorrect_answers: ["Paris", "London", "Rome"], category: "Sports Quiz" },
  { question: "What is the highest possible break in snooker?", correct_answer: "147", incorrect_answers: ["155", "136", "120"], category: "Sports Quiz" },
  { question: "How many Grand Slam tournaments are there in tennis?", correct_answer: "4", incorrect_answers: ["3", "5", "6"], category: "Sports Quiz" },
  { question: "What country invented the sport of basketball?", correct_answer: "USA", incorrect_answers: ["Canada", "UK", "France"], category: "Sports Quiz" },
  { question: "What is the term for three consecutive strikes in bowling?", correct_answer: "Turkey", incorrect_answers: ["Hat trick", "Eagle", "Birdie"], category: "Sports Quiz" },
  { question: "How many rings are on the Olympic flag?", correct_answer: "5", incorrect_answers: ["4", "6", "7"], category: "Sports Quiz" },
  { question: "Which sport is played at Wimbledon?", correct_answer: "Tennis", incorrect_answers: ["Badminton", "Squash", "Golf"], category: "Sports Quiz" },
  { question: "How many players are in a volleyball team on the court?", correct_answer: "6", incorrect_answers: ["5", "7", "8"], category: "Sports Quiz" },
];

async function fetchQuestions() {
  const url = `https://opentdb.com/api.php?amount=${state.totalQuestions}&category=${state.category}&difficulty=${state.difficulty}&type=multiple`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.response_code === 0 && data.results.length > 0) {
      return data.results.map(q => ({
        question:          decodeHTML(q.question),
        correct_answer:    decodeHTML(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(decodeHTML),
        category:          decodeHTML(q.category),
      }));
    }
    throw new Error('No results');
  } catch (err) {
    console.warn('API unavailable, using fallback.', err);
    return shuffle([...FALLBACK_QUESTIONS]).slice(0, Number(state.totalQuestions));
  }
}

function startTimer() {
  clearInterval(state.timerInterval);
  state.timeLeft = 20;
  updateTimerUI(20);
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimerUI(state.timeLeft);
    if (state.timeLeft <= 5) sfxTick();
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      sfxTimeout();
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() { clearInterval(state.timerInterval); }

function updateTimerUI(t) {
  timerCountdown.textContent = t;
  const offset = TIMER_CIRCUMFERENCE * (1 - t / 20);
  timerCircleFill.style.strokeDashoffset = offset;
  if (t <= 5) timerCircleFill.classList.add('warning');
  else timerCircleFill.classList.remove('warning');
}

function handleTimeout() {
  if (state.answered) return;
  state.answered = true;
  const q = state.questions[state.currentIndex];
  document.querySelectorAll('.option').forEach(opt => {
    opt.classList.add('disabled');
    if (opt.dataset.value === q.correct_answer) opt.classList.add('correct');
  });
  state.reviewLog.push({ question: q.question, correct: false, userAnswer: '(No answer)', correctAnswer: q.correct_answer });
  enableNextButton();
}

function renderQuestion() {
  const q = state.questions[state.currentIndex];
  if (!q) return;
  state.answered = false;
  state.hintsRemaining = 1;
  const num = state.currentIndex + 1;
  currentQuestionNum.textContent = String(num).padStart(2, '0');
  questionProgressTxt.textContent = `${num} of ${state.totalQuestions}`;
  scoreText.textContent = `${state.score} of ${state.totalQuestions}`;
  progressBarFill.style.width = `${(num / state.totalQuestions) * 100}%`;
  questionCategory.textContent = q.category;
  questionText.textContent = '"' + q.question + '"';
  hintBtn.classList.remove('disabled');
  hintBtn.querySelector('span').textContent = 'Hint';
  nextBtn.disabled = true;
  nextBtn.classList.add('disabled');
  const answers = shuffle([q.correct_answer, ...q.incorrect_answers]);
  optionsContainer.innerHTML = '';
  answers.forEach(answer => {
    const opt = document.createElement('div');
    opt.className = 'option';
    opt.dataset.value = answer;
    const checkSVG = `<svg class="option-indicator-svg check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    const crossSVG = `<svg class="option-indicator-svg cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    opt.innerHTML = `<span class="option-text">${answer}</span><div class="option-indicator">${checkSVG}${crossSVG}</div>`;
    opt.addEventListener('click', () => handleOptionClick(opt, answer));
    optionsContainer.appendChild(opt);
  });
  startTimer();
}

function handleOptionClick(opt, answer) {
  if (state.answered) return;
  state.answered = true;
  stopTimer();
  sfxClick();
  const q = state.questions[state.currentIndex];
  const isCorrect = answer === q.correct_answer;
  document.querySelectorAll('.option').forEach(o => o.classList.add('disabled'));
  if (isCorrect) {
    opt.classList.add('correct');
    state.score++;
    setTimeout(sfxCorrect, 50);
  } else {
    opt.classList.add('incorrect');
    setTimeout(sfxIncorrect, 50);
    document.querySelectorAll('.option').forEach(o => {
      if (o.dataset.value === q.correct_answer) o.classList.add('correct');
    });
  }
  scoreText.textContent = `${state.score} of ${state.totalQuestions}`;
  state.reviewLog.push({ question: q.question, correct: isCorrect, userAnswer: answer, correctAnswer: q.correct_answer });
  enableNextButton();
}

hintBtn.addEventListener('click', () => {
  if (state.answered || state.hintsRemaining <= 0) return;
  sfxClick();
  const q = state.questions[state.currentIndex];
  const wrongOptions = [...document.querySelectorAll('.option')].filter(
    o => o.dataset.value !== q.correct_answer && !o.classList.contains('fade-out')
  );
  shuffle(wrongOptions).slice(0, 2).forEach(o => o.classList.add('fade-out', 'disabled'));
  state.hintsRemaining--;
  hintBtn.classList.add('disabled');
  hintBtn.querySelector('span').textContent = 'Used';
});

function enableNextButton() {
  nextBtn.disabled = false;
  nextBtn.classList.remove('disabled');
}

nextBtn.addEventListener('click', () => {
  if (nextBtn.disabled) return;
  sfxClick();
  state.currentIndex++;
  if (state.currentIndex >= state.questions.length) showResults();
  else renderQuestion();
});

startBtn.addEventListener('click', async () => {
  sfxClick();
  state.username = usernameInput.value.trim() || 'Guest Player';
  state.category = categorySelect.value;
  startBtn.textContent = 'Loading Questions...';
  startBtn.disabled = true;
  state.currentIndex = 0;
  state.score = 0;
  state.reviewLog = [];
  state.answered = false;
  state.questions = await fetchQuestions();
  startBtn.textContent = 'Start Quiz';
  startBtn.disabled = false;
  showScreen(quizScreen);
  renderQuestion();
});

function showResults() {
  stopTimer();
  setTimeout(sfxFanfare, 200);
  const total = state.questions.length;
  const pct   = Math.round((state.score / total) * 100);
  let greeting = 'Great Job!';
  if (pct >= 90)      greeting = 'Excellent!';
  else if (pct >= 70) greeting = 'Great Job!';
  else if (pct >= 50) greeting = 'Keep Practicing!';
  else                greeting = "Don't Give Up!";
  resultGreeting.textContent   = greeting;
  resultUsername.textContent   = state.username;
  scoreRatio.textContent       = `${state.score}/${total}`;
  scoreSummaryText.textContent = `You answered ${pct}% of questions correctly!`;
  const SCORE_CIRCUMFERENCE = 2 * Math.PI * 50;
  scoreCircleFill.style.strokeDashoffset = SCORE_CIRCUMFERENCE;
  scoreCircleFill.style.stroke = pct >= 70 ? '#2ecc71' : (pct >= 40 ? '#ff7a00' : '#e74c3c');
  reviewContainer.innerHTML = '';
  state.reviewLog.forEach(log => {
    const row = document.createElement('div');
    row.className = `review-row ${log.correct ? 'correct-row' : 'incorrect-row'}`;
    const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    const crossIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    const status = log.correct ? 'Correct' : `Your: ${log.userAnswer} &middot; Correct: ${log.correctAnswer}`;
    row.innerHTML = `<div class="review-row-details"><div class="review-question">${log.question}</div><div class="review-answer-status">${status}</div></div><div class="review-indicator">${log.correct ? checkIcon : crossIcon}</div>`;
    reviewContainer.appendChild(row);
  });
  showScreen(resultScreen);
  requestAnimationFrame(() => setTimeout(() => {
    scoreCircleFill.style.strokeDashoffset = SCORE_CIRCUMFERENCE * (1 - state.score / total);
  }, 300));
}

restartBtn.addEventListener('click', () => {
  sfxClick();
  stopTimer();
  showScreen(startScreen);
});
