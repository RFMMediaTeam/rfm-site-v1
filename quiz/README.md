# Bible Quiz — Raja Faith Ministries

A self-paced Bible quiz site with **1,171 questions** from Genesis to Revelation, ready to host on GitHub Pages. Zero backend, zero dependencies — plain HTML/CSS/JS.

## What's inside

| File | Purpose |
|---|---|
| `index.html` | Single-page app: welcome, home, quiz, history, settings |
| `assets/quiz.json` | All 1,171 questions with options, correct answer, verse, explanation |
| `assets/style.css` | Warm scriptural palette, mobile-first |
| `assets/app.js` | All logic (rendering, scoring, storage, backup/restore) |

## Features

- **1,171 questions** parsed from your `Bible_Quiz_TNCC_v4.docx` (1,166 multiple choice + 5 "reveal answer" open-ended). Duplicates removed. Every answer verified against the source options.
- **Sign in with just a name** (plus optional passphrase). No email, no server.
- **Resume where you left off** — the app remembers exactly which question you last saw. Close the tab; come back in a week; pick up at the very next question.
- **Instant feedback:**
  - ✅ Correct → green card with a rotating motivating message ("Praise God! 🎉", "You know the Word! ✨", …) + the verse.
  - ❌ Wrong → soft coral card with an encouraging line ("No worries — the Bible is a lifelong journey.", "Keep seeking, and you'll find. — Matthew 7:7") + the correct answer + the verse. Never harsh.
- **Full history** — every question you've attempted, filterable by All / Correct / Missed, plus a full-text search. Expand any question to re-read the verse.
- **Dashboard stats:** questions answered, accuracy %, current streak, progress bar out of 1,171.
- **Two modes:** Sequential (Genesis → Revelation) or Shuffle (random unseen).
- **Backup & restore:** download your progress as a `.json` file, then import it on another device or after clearing your browser.
- **Reset:** wipe your history and start over if you want.

## Deploy to GitHub Pages (5 minutes)

You have two options.

### Option A — Add it as a folder inside your existing site

Since you already have `rfmmediateam.github.io/rfm-site/`, you can just drop this in as a subfolder:

```bash
cd path/to/rfm-site
cp -r /path/to/this/site ./quiz
git add quiz
git commit -m "Add Bible Quiz"
git push
```

Live URL: `https://rfmmediateam.github.io/rfm-site/quiz/`

### Option B — Standalone repo

1. Create a new repo, e.g. `bible-quiz`, in your GitHub account.
2. Copy every file from this folder into the repo root:
   ```bash
   cd bible-quiz
   cp -r /path/to/this/site/* .
   git init
   git add .
   git commit -m "Initial Bible Quiz site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bible-quiz.git
   git push -u origin main
   ```
3. On GitHub → **Settings → Pages** → Source: **Deploy from a branch**, Branch: `main`, Folder: `/ (root)` → **Save**.
4. Wait ~1 minute. Your site lives at `https://YOUR_USERNAME.github.io/bible-quiz/`.

### Test locally before pushing

```bash
cd site
python3 -m http.server 8000
# Open http://localhost:8000
```

## How the "resume across sessions" works

Everything is stored in your browser's `localStorage` under the key `rfm-bible-quiz-v1`. That means:

- **Same browser, any time:** just come back. Your name, history, position — all preserved automatically.
- **Different device / cleared browser:** the data isn't there. Use **Settings → Download my progress** to save a JSON file, then **Restore from file** on the new device.

## Known limitations & upgrade paths

**No true multi-device sync.** Because GitHub Pages is a plain static host, there's no server to store per-user data. Users must use the Export/Import buttons to move between devices. If you'd later like real multi-device sync (attempt on phone, seamlessly continue on laptop), you can bolt on any of these free backends without rewriting the frontend:

- **Firebase** (Google) — free tier is generous, ~30 lines of extra JS.
- **Supabase** — Postgres-backed, similar effort.
- **Cloudflare Workers + KV** — simplest to reason about.

Ask me and I'll wire one of these in.

**8 questions from the source doc could not be salvaged** because the source itself had empty question text (e.g. `**Q1056.**` followed by only prose commentary). Reconstructing them would have required inventing content, which I refused to do. 2 exact duplicates were also removed (same question wording as an earlier one). Net: **1,171 out of 1,181** (99.15%) preserved with full fidelity.

## Editing the questions

`assets/quiz.json` is a plain JSON array. Each entry looks like:

```json
{
  "id": 16,
  "seq": 16,
  "type": "mcq",
  "question": "What did the Lord rain on Sodom and Gomorrah?",
  "options": [
    { "label": "A", "text": "Water" },
    { "label": "B", "text": "Fire and brimstone" },
    { "label": "C", "text": "Hailstones" },
    { "label": "D", "text": "Sand" }
  ],
  "correct": "B",
  "answer_text": "Fire and brimstone",
  "explanation": "Genesis 19:24 — 'Then the Lord rained down burning sulfur on Sodom and Gomorrah.'"
}
```

- `id` — original Q# from the source doc (for reference).
- `seq` — order in the sequential quiz (1 to 1171).
- `type` — `"mcq"` or `"open"`.
- `correct` — `"A"` / `"B"` / `"C"` / `"D"` (null for open questions).
- Edit any field and refresh — no build step.

## Credits

- Question content: **Raja Faith Ministries**, Hyderabad, Telangana.
- Verses: KJV / NKJV as they appear in the source document.

_"So then faith cometh by hearing, and hearing by the word of God." — Romans 10:17_
