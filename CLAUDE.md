# CLAUDE.md — System Architect Exam Pro

Project context for Claude Code. (This file also *is* Domain-3 study material:
notice the hierarchy, the scope, and the modular sections — that's exactly what the
exam asks about.)

## What this is
A Vite + React study app for the Claude Certified Architect (Foundations) exam.
No backend of its own — optional Supabase for persistence + leaderboard.

## Architecture
- `src/data/questions.json` — 422 questions. Each: `{ id, source, domains[], scenario, category, difficulty, question, options{a,b,c,d}, correct, explanation }`. **Read-only data — don't hand-edit; regenerate if changing.**
- `src/data/curriculum.js` — domains, scenarios, the 4-week unit list (mirrors the official pod plan), exam constants.
- `src/lib/engine.js` — question selection (`pickQuestions`, `buildExam`), scoring (`toScaled`), weakness detection.
- `src/lib/storage.js` — load/save state; Supabase when env vars set, else localStorage.
- `src/components/` — `Dashboard`, `Curriculum`, `Scenarios`, `Drill` (inline in App), `PodView`, `Quiz`, `Results`.
- `src/App.jsx` — state + navigation + session orchestration.

## Conventions
- Plain CSS via `src/index.css` and CSS variables. **No Tailwind, no UI library.** Match the existing token system (`--accent`, `--d1..--d5`, `--serif/--sans/--mono`).
- Keep components small and presentational; state lives in `App.jsx`.
- The app must keep working with **zero config** (localStorage fallback). Never make Supabase required.

## Common tasks
- **Add questions:** extend `questions.json` following the existing shape; ensure `domains` is populated so domain filters pick it up.
- **Adjust the plan:** edit `UNITS` in `curriculum.js`. A unit is `{ id, week, day, topic, activity, time, domain, quiz:{domain|scenario|mixed|weak, count} }`, or `{ isExam:true }`, or `{ isLab:true, lab, link }`.
- **Build:** `npm run build`. **Dev:** `npm run dev`.

## Do not
- Don't add browser-storage-breaking patterns or external API calls in the question flow.
- Don't commit a real `.env`. Keep secrets out of git.
