/* ══════════════════════════════════════════════════════════════════════
   Bible Quiz — Raja Faith Ministries
   Static single-page app. All state lives in localStorage.
   ══════════════════════════════════════════════════════════════════════ */

'use strict';

// ─── Motivating messages ────────────────────────────────────────────────
const CORRECT_MSGS = [
  "Praise God! 🎉",
  "Well done, that's exactly right!",
  "You know the Word! ✨",
  "Excellent! Keep going!",
  "Amen! You got it!",
  "That's the Word! 🙌",
  "Beautiful! Right on target.",
  "Hallelujah! Perfect answer.",
  "You're on fire! 🔥",
  "Wonderful — the Scripture is with you!",
];

const WRONG_MSGS = [
  "No worries — the Bible is a lifelong journey.",
  "Not this one — but every question you meet, you learn from!",
  "Almost! Time to open the Word and dig a little deeper. 📖",
  "Close, but the Bible has more to reveal — read on!",
  "Don't be discouraged — even the disciples asked many questions!",
  "That one slipped by — bookmark it and revisit soon!",
  "It's okay — keep seeking, and you'll find. (Matthew 7:7)",
  "Not quite — but 'the Word of God is living and active.' Keep reading!",
  "Missed this one — but every attempt is a step closer to knowing Him.",
  "Don't worry! Now you know it for next time. 🌱",
];

const VERSES_OF_MOMENT = [
  '"Your word is a lamp to my feet and a light to my path." — Psalm 119:105',
  '"Be diligent to present yourself approved to God, a worker who does not need to be ashamed, rightly dividing the word of truth." — 2 Timothy 2:15',
  '"Man shall not live by bread alone, but by every word that proceeds from the mouth of God." — Matthew 4:4',
  '"The grass withers, the flower fades, but the word of our God stands forever." — Isaiah 40:8',
  '"So then faith comes by hearing, and hearing by the word of God." — Romans 10:17',
  '"Study to shew thyself approved unto God." — 2 Timothy 2:15',
  '"Blessed is the one who reads aloud the words of this prophecy." — Revelation 1:3',
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ─── Storage helpers ────────────────────────────────────────────────────
const STORE_KEY = 'rfm-bible-quiz-v1';

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || null;
  } catch (e) { return null; }
}
function saveState(s) {
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
}
function newState(name, passphrase) {
  return {
    version: 1,
    name: name.trim(),
    passphrase: (passphrase || '').trim(),
    createdAt: new Date().toISOString(),
    // history: array of { seq, correct: boolean|null, chosen: 'A'|..., ts }
    history: [],
    // seqIndex: pointer for sequential mode (next seq to serve)
    seqIndex: 1,
    // seenSeqs: Set-like object of seqs already answered
    seenSeqs: {},
    mode: 'sequential', // 'sequential' | 'shuffle'
    streak: 0,
    lastCorrectStreak: 0,
  };
}

// ─── App state (in-memory) ──────────────────────────────────────────────
let QUIZ = [];      // full array of question objects
let BY_SEQ = {};    // {seq: question}
let state = null;   // current user state
let currentQ = null; // question currently on screen
let currentChosen = null; // 'A'|... selected but not yet submitted

// ─── DOM helpers ────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function show(viewId) {
  $$('.view').forEach(v => v.hidden = (v.id !== 'view-' + viewId));
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Boot ────────────────────────────────────────────────────────────────
async function boot() {
  try {
    const res = await fetch('assets/quiz.json');
    QUIZ = await res.json();
    QUIZ.forEach(q => BY_SEQ[q.seq] = q);
  } catch (e) {
    document.body.innerHTML = '<div style="padding:40px;text-align:center;">Could not load quiz data. Please refresh the page.</div>';
    return;
  }

  state = loadState();
  if (state) {
    enterApp();
  } else {
    show('welcome');
  }
  wireEvents();
}

// ─── Auth-lite ──────────────────────────────────────────────────────────
function enterApp() {
  $('nav').hidden = false;
  $('greeting-name').textContent = state.name || 'friend';
  $('settings-name').textContent = state.name + (state.passphrase ? ' 🔒' : '');
  // Reflect mode radio
  $$('input[name="mode"]').forEach(r => r.checked = (r.value === state.mode));
  // Verse of the moment
  $('verse-moment').textContent = pick(VERSES_OF_MOMENT);
  renderHome();
  show('home');
}

function handleStart() {
  const name = $('input-name').value.trim();
  const pass = $('input-passphrase').value.trim();
  if (!name) {
    $('input-name').focus();
    $('input-name').style.borderColor = 'var(--warn)';
    return;
  }
  // If existing state's name+pass matches, reuse; otherwise start fresh
  const existing = loadState();
  if (existing && existing.name.toLowerCase() === name.toLowerCase() &&
      (existing.passphrase || '') === pass) {
    state = existing;
  } else {
    state = newState(name, pass);
    saveState(state);
  }
  enterApp();
}

// ─── Home / stats ───────────────────────────────────────────────────────
function renderHome() {
  const total = QUIZ.length;
  const answered = state.history.length;
  const correct = state.history.filter(h => h.correct === true).length;
  const wrong = state.history.filter(h => h.correct === false).length;
  const accuracy = answered ? Math.round((correct / (correct + wrong || 1)) * 100) : null;

  $('stat-total').textContent = total.toLocaleString();
  $('stat-answered').textContent = answered.toLocaleString();
  $('stat-correct').textContent = correct.toLocaleString();
  $('stat-wrong').textContent = wrong.toLocaleString();
  $('stat-accuracy').textContent = accuracy === null ? '–' : accuracy + '%';
  $('stat-streak').textContent = state.lastCorrectStreak || 0;

  const pct = Math.round((answered / total) * 100);
  $('progress-fill').style.width = pct + '%';
  $('progress-lbl').textContent = pct + '%';

  // Home lead line
  if (answered === 0) {
    $('home-lead').textContent = 'Ready to grow in the Word today? Start with your first question.';
  } else if (answered >= total) {
    $('home-lead').textContent = "You've answered every question! Try shuffle mode to review, or start over to test yourself again. 🏆";
  } else {
    const left = total - answered;
    $('home-lead').textContent = `You're doing wonderfully — ${left.toLocaleString()} questions still ahead of you. Continue whenever you're ready!`;
  }
}

// ─── Pick next question ─────────────────────────────────────────────────
function nextQuestion(force) {
  // force = 'sequential' | 'shuffle' | undefined (use state.mode)
  const mode = force || state.mode;
  if (mode === 'shuffle') {
    const unseen = QUIZ.filter(q => !state.seenSeqs[q.seq]);
    if (unseen.length === 0) {
      return QUIZ[Math.floor(Math.random() * QUIZ.length)];
    }
    return unseen[Math.floor(Math.random() * unseen.length)];
  }
  // sequential: walk from state.seqIndex until we find an unseen one
  let idx = state.seqIndex;
  const total = QUIZ.length;
  for (let i = 0; i < total; i++) {
    const q = BY_SEQ[idx];
    if (q && !state.seenSeqs[q.seq]) return q;
    idx = (idx % total) + 1;
  }
  return QUIZ[0]; // all answered — replay from start
}

// ─── Render a question ──────────────────────────────────────────────────
function renderQuestion(q) {
  currentQ = q;
  currentChosen = null;

  const answered = state.history.length;
  const total = QUIZ.length;
  $('quiz-position').textContent = `Question ${answered + 1} of ${total} (Q#${q.id})`;
  $('quiz-mode-badge').textContent = state.mode === 'shuffle' ? 'Shuffle' : 'Sequential';

  $('quiz-question').textContent = q.question;

  const opts = $('quiz-options');
  opts.innerHTML = '';

  $('feedback').hidden = true;
  $('feedback').className = 'feedback';
  $('btn-submit').disabled = true;

  if (q.type === 'open') {
    // Open (reveal-answer) question — no options
    $('btn-submit').hidden = true;
    $('btn-reveal').hidden = false;
    $('btn-skip').hidden = false;
    opts.innerHTML = '<p class="hint" style="text-align:center;padding:20px;">This is an open-ended question. Take a moment to think, then reveal the answer.</p>';
    return;
  }

  $('btn-submit').hidden = false;
  $('btn-reveal').hidden = true;
  $('btn-skip').hidden = false;

  q.options.forEach(o => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.dataset.label = o.label;
    btn.innerHTML = `<span class="lbl">${o.label}</span><span>${escapeHtml(o.text)}</span>`;
    btn.addEventListener('click', () => selectOption(o.label));
    opts.appendChild(btn);
  });
}

function selectOption(label) {
  currentChosen = label;
  $$('#quiz-options .option').forEach(o => {
    o.classList.toggle('selected', o.dataset.label === label);
  });
  $('btn-submit').disabled = false;
}

function submitAnswer() {
  if (!currentChosen || !currentQ) return;
  const q = currentQ;
  const isCorrect = currentChosen === q.correct;

  // Highlight
  $$('#quiz-options .option').forEach(o => {
    o.disabled = true;
    if (o.dataset.label === q.correct) o.classList.add('correct');
    if (o.dataset.label === currentChosen && !isCorrect) o.classList.add('wrong');
    o.classList.remove('selected');
  });

  // Record
  recordAnswer(q, currentChosen, isCorrect);
  renderFeedback(q, isCorrect);
}

function revealOpenAnswer() {
  const q = currentQ;
  recordAnswer(q, null, null); // null = open, no correct/wrong
  const fb = $('feedback');
  fb.hidden = false;
  fb.className = 'feedback';
  fb.style.background = 'var(--accent-soft)';
  fb.style.borderColor = 'var(--gold)';
  $('feedback-headline').textContent = 'Answer';
  $('feedback-headline').style.color = 'var(--accent-dark)';
  $('feedback-detail').innerHTML = `<strong>${escapeHtml(q.answer_text)}</strong>`;
  $('feedback-verse').textContent = q.explanation || '';
  $('feedback-verse').hidden = !q.explanation;
  $('btn-reveal').hidden = true;
  $('btn-skip').hidden = true;
}

function renderFeedback(q, isCorrect) {
  const fb = $('feedback');
  fb.hidden = false;
  fb.classList.add(isCorrect ? 'correct' : 'wrong');
  fb.style.background = '';
  fb.style.borderColor = '';

  $('feedback-headline').textContent = isCorrect ? pick(CORRECT_MSGS) : pick(WRONG_MSGS);
  $('feedback-headline').style.color = '';

  const correctText = (q.options.find(o => o.label === q.correct) || {}).text || q.answer_text || '';
  if (isCorrect) {
    $('feedback-detail').innerHTML = `You answered <strong>${q.correct}) ${escapeHtml(correctText)}</strong>. Right on!`;
  } else {
    $('feedback-detail').innerHTML = `The correct answer is <strong>${q.correct}) ${escapeHtml(correctText)}</strong>.`;
  }
  $('feedback-verse').textContent = q.explanation || '';
  $('feedback-verse').hidden = !q.explanation;
}

// ─── Record + advance ───────────────────────────────────────────────────
function recordAnswer(q, chosen, isCorrect) {
  const already = state.seenSeqs[q.seq];
  if (!already) {
    state.history.push({
      seq: q.seq,
      id: q.id,
      chosen: chosen,
      correct: isCorrect,
      ts: Date.now(),
    });
    state.seenSeqs[q.seq] = true;
  }
  if (isCorrect === true) {
    state.lastCorrectStreak = (state.lastCorrectStreak || 0) + 1;
  } else if (isCorrect === false) {
    state.lastCorrectStreak = 0;
  }
  // advance sequential pointer
  if (q.seq >= state.seqIndex) state.seqIndex = q.seq + 1;
  if (state.seqIndex > QUIZ.length) state.seqIndex = 1;
  saveState(state);
}

function goNext() {
  const q = nextQuestion();
  renderQuestion(q);
}

// ─── History view ───────────────────────────────────────────────────────
let historyFilter = 'all';

function renderHistory() {
  const list = $('history-list');
  const search = $('history-search').value.trim().toLowerCase();
  list.innerHTML = '';

  let items = state.history.slice().reverse(); // newest first
  if (historyFilter === 'correct') items = items.filter(h => h.correct === true);
  else if (historyFilter === 'wrong') items = items.filter(h => h.correct === false);

  if (search) {
    items = items.filter(h => {
      const q = BY_SEQ[h.seq];
      if (!q) return false;
      const hay = (q.question + ' ' + (q.explanation || '')).toLowerCase();
      return hay.includes(search);
    });
  }

  $('history-empty').hidden = items.length > 0 || state.history.length > 0;
  if (state.history.length === 0) {
    $('history-empty').hidden = false;
    return;
  }
  if (items.length === 0) {
    list.innerHTML = '<p class="hint">No questions match this filter.</p>';
    return;
  }

  items.forEach(h => {
    const q = BY_SEQ[h.seq];
    if (!q) return;
    const el = document.createElement('details');
    el.className = 'history-item ' + (h.correct === true ? 'correct' : h.correct === false ? 'wrong' : '');
    const icon = h.correct === true ? '✔' : h.correct === false ? '✘' : '📖';
    const chosenText = h.chosen
      ? (q.options.find(o => o.label === h.chosen) || {}).text || h.chosen
      : '(open — revealed)';
    const correctText = q.correct
      ? (q.options.find(o => o.label === q.correct) || {}).text || q.answer_text
      : q.answer_text;
    el.innerHTML = `
      <summary>
        <span class="icon">${icon}</span>
        <span>Q${q.id}: ${escapeHtml(q.question)}</span>
      </summary>
      <div class="h-body">
        ${h.chosen ? `<div class="row"><strong>Your answer:</strong> ${escapeHtml(h.chosen)}) ${escapeHtml(chosenText)}</div>` : ''}
        <div class="row"><strong>Correct answer:</strong> ${q.correct ? escapeHtml(q.correct) + ') ' : ''}${escapeHtml(correctText || '')}</div>
        ${q.explanation ? `<blockquote class="verse">${escapeHtml(q.explanation)}</blockquote>` : ''}
      </div>
    `;
    list.appendChild(el);
  });
}

// ─── Backup / restore / reset ───────────────────────────────────────────
function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `bible-quiz-${(state.name || 'me').replace(/\W+/g,'_')}-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(file, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      if (!obj.history || !obj.name) throw new Error('Invalid file');
      state = obj;
      // ensure required fields exist
      if (!state.seenSeqs) state.seenSeqs = {};
      state.history.forEach(h => state.seenSeqs[h.seq] = true);
      if (!state.seqIndex) state.seqIndex = 1;
      if (!state.mode) state.mode = 'sequential';
      saveState(state);
      cb && cb(true);
    } catch (e) {
      alert('That file doesn\'t look like a valid backup. Please choose a different file.');
      cb && cb(false);
    }
  };
  reader.readAsText(file);
}

function resetProgress() {
  if (!confirm('Are you sure? This will erase every answer you\'ve given. This cannot be undone (unless you exported a backup).')) return;
  const name = state.name, pass = state.passphrase;
  state = newState(name, pass);
  saveState(state);
  renderHome();
  show('home');
  alert('Your progress has been reset. A fresh journey through the Word begins!');
}

function signOut() {
  if (!confirm('Sign out? Your progress stays saved on this device — you can sign in again with the same name and passphrase.')) return;
  // Keep data in localStorage but return to welcome screen
  $('nav').hidden = true;
  show('welcome');
  $('input-name').value = state.name || '';
  $('input-passphrase').value = state.passphrase || '';
}

// ─── Utilities ──────────────────────────────────────────────────────────
function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ─── Wire events ────────────────────────────────────────────────────────
function wireEvents() {
  // Welcome
  $('btn-start').addEventListener('click', handleStart);
  $('input-name').addEventListener('keydown', e => { if (e.key === 'Enter') handleStart(); });
  $('input-passphrase').addEventListener('keydown', e => { if (e.key === 'Enter') handleStart(); });
  $('btn-import').addEventListener('click', () => {
    const f = $('import-file').files[0];
    if (!f) { alert('Please choose a backup file first.'); return; }
    importProgress(f, ok => { if (ok) enterApp(); });
  });

  // Nav
  $$('.nav-btn').forEach(b => {
    b.addEventListener('click', () => {
      const v = b.dataset.view;
      if (v === 'quiz') { goNext(); show('quiz'); }
      else if (v === 'history') { renderHistory(); show('history'); }
      else if (v === 'home') { renderHome(); show('home'); }
      else show(v);
    });
  });

  // Home CTAs
  $('btn-continue').addEventListener('click', () => {
    state.mode = 'sequential'; saveState(state);
    goNext(); show('quiz');
  });
  $('btn-shuffle').addEventListener('click', () => {
    state.mode = 'shuffle'; saveState(state);
    goNext(); show('quiz');
  });

  // Quiz
  $('btn-submit').addEventListener('click', submitAnswer);
  $('btn-reveal').addEventListener('click', revealOpenAnswer);
  $('btn-next').addEventListener('click', goNext);
  $('btn-skip').addEventListener('click', () => {
    // Skip without recording; just move seq pointer forward in sequential mode
    if (currentQ && state.mode === 'sequential') {
      state.seqIndex = currentQ.seq + 1;
      if (state.seqIndex > QUIZ.length) state.seqIndex = 1;
      saveState(state);
    }
    goNext();
  });

  // History
  $$('.filter-btn').forEach(b => {
    b.addEventListener('click', () => {
      $$('.filter-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      historyFilter = b.dataset.filter;
      renderHistory();
    });
  });
  $('history-search').addEventListener('input', renderHistory);

  // Settings
  $$('input[name="mode"]').forEach(r => {
    r.addEventListener('change', () => {
      state.mode = r.value; saveState(state);
    });
  });
  $('btn-export').addEventListener('click', exportProgress);
  $('import-file-2').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) importProgress(f, ok => { if (ok) { renderHome(); show('home'); alert('Progress restored! ✨'); } });
  });
  $('btn-reset').addEventListener('click', resetProgress);
  $('btn-signout').addEventListener('click', signOut);
}

// Go!
boot();
