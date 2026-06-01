# System Architect Exam Pro — Claude Certified Architect (Foundations)

A self-paced study app for the **Claude Certified Architect — Foundations** exam.
Built around the real exam shape: 5 weighted domains, 8 scenarios, 60-question
timed mock exams scored to the **720 pass line** on the 100–1000 scale.

**422 real practice questions** are baked in (88 scenario-tagged questions from the
community study guide + 334 from the Claude Code Ultimate Guide quiz bank), each with
the correct answer and an explanation.

## What's inside

- **Deck** — your dashboard: estimated score vs. 720, units done, questions seen, days to exam, and a live domain-mastery heatmap.
- **Curriculum** — the official 4-week pod plan, mirrored day by day (28 units), including the hands-on Labs and Anthropic Academy courses. Each day's study unit launches a targeted quiz; each Sunday ends with a check-in.
- **Scenarios** — the 8 exam scenarios with their decision rules + dedicated drills.
- **Drill** — full timed mock exams, weak-spot drills, and mixed sets. The last-10-days mode.
- **Pod** — a one-tap check-in generator for your pod, plus a leaderboard (when the database is connected).

Progress saves automatically. With no setup it saves in your browser; add Supabase
keys to sync across devices and turn on the pod leaderboard.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173). That's it — it works
immediately with browser storage.

## Your progress is saved locally (free, no database)

By default the app saves everything in your browser's local storage. This **persists
across closing the app and rebooting your machine** — it does not reset when you quit.
It's tied to one browser, so to be safe, use **Pod → Your data → Download backup** to
save a `.json` file you control, and **Restore from file** to bring it back (handy if
you clear your browser or move to a new machine). Supabase is entirely optional and only
powers the shared pod leaderboard.

## Deploy to Netlify (so your pod can use it)

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import from Git** → pick the repo.
3. Netlify reads `netlify.toml` automatically (build `npm run build`, publish `dist`). Deploy.
4. (Optional) add the two Supabase env vars below under **Site settings → Environment variables**, then redeploy.

## Optional: real database (cross-device + leaderboard)

The app runs fine without this. To upgrade:

1. Create a free project at supabase.com.
2. **SQL Editor** → paste `supabase-schema.sql` → Run.
3. **Settings → API** → copy the Project URL and the `anon` public key.
4. Create a `.env` file (copy `.env.example`) and fill in:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
5. Restart `npm run dev` (or set the same vars in Netlify and redeploy).

Note: this uses the public anon key with no login, which is fine for a study tool.
Don't store anything sensitive in it.

## Tech

Vite + React, custom CSS (no UI framework), `@supabase/supabase-js`. Question data
lives in `src/data/questions.json`; the study plan in `src/data/curriculum.js`.
