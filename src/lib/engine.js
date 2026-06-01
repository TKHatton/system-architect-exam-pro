// Question selection + scoring helpers.
import ALL from "../data/questions.json";
import { DOMAINS, EXAM } from "../data/curriculum.js";

export const allQuestions = ALL;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick questions by spec, lightly preferring unseen / previously-missed ones.
export function pickQuestions(spec, state, count) {
  const n = count || spec.count || 8;
  let pool = ALL;
  if (spec.domain) pool = ALL.filter((q) => (q.domains || []).includes(spec.domain));
  else if (spec.scenario) pool = ALL.filter((q) => q.scenario === spec.scenario);
  else if (spec.weak) {
    const weakest = weakestDomain(state);
    pool = ALL.filter((q) => (q.domains || []).includes(weakest));
  }
  // mixed / exam => whole pool
  const h = state?.qHistory || {};
  const score = (q) => {
    const rec = h[q.id];
    if (!rec) return 0;                  // unseen first
    if (rec.lastCorrect === false) return 1; // then previously missed
    return 2 + rec.attempts;             // mastered later
  };
  const ranked = shuffle(pool).sort((a, b) => score(a) - score(b));
  return ranked.slice(0, Math.min(n, ranked.length));
}

// Weighted exam: sample 60 across domains by exam weight.
export function buildExam(state) {
  const target = {};
  let remaining = EXAM.questions;
  const weights = Object.entries(DOMAINS);
  weights.forEach(([d, info], i) => {
    const c = i === weights.length - 1 ? remaining : Math.round((info.weight / 100) * EXAM.questions);
    target[d] = c; remaining -= c;
  });
  const out = [];
  const used = new Set();
  for (const [d, c] of Object.entries(target)) {
    const pool = shuffle(ALL.filter((q) => (q.domains || []).includes(Number(d)) && !used.has(q.id)));
    pool.slice(0, c).forEach((q) => { out.push(q); used.add(q.id); });
  }
  // backfill if short
  if (out.length < EXAM.questions) {
    shuffle(ALL.filter((q) => !used.has(q.id))).slice(0, EXAM.questions - out.length)
      .forEach((q) => { out.push(q); used.add(q.id); });
  }
  return shuffle(out);
}

// Convert raw % to the exam's 100–1000 scale (720 ≈ ~70%). Linear, clamped.
export function toScaled(correct, total) {
  if (!total) return 0;
  const pct = correct / total;
  const scaled = Math.round(100 + pct * 900);
  return Math.max(100, Math.min(1000, scaled));
}

export function weakestDomain(state) {
  const s = state?.domainStats || {};
  let worst = 1, worstRate = 2;
  for (let d = 1; d <= 5; d++) {
    const st = s[d];
    const rate = st && st.seen ? st.correct / st.seen : -1; // unseen = weakest
    if (rate < worstRate) { worstRate = rate; worst = d; }
  }
  return worst;
}

export function domainAccuracy(state) {
  const s = state?.domainStats || {};
  const out = {};
  for (let d = 1; d <= 5; d++) {
    const st = s[d];
    out[d] = st && st.seen ? Math.round((st.correct / st.seen) * 100) : null;
  }
  return out;
}

// Record a single answered question into state (mutates a copy, returns it).
export function recordAnswer(state, q, isCorrect) {
  const next = { ...state, domainStats: { ...state.domainStats }, qHistory: { ...state.qHistory } };
  for (const d of q.domains || []) {
    if (d === 0) continue;
    const cur = next.domainStats[d] || { seen: 0, correct: 0 };
    next.domainStats[d] = { seen: cur.seen + 1, correct: cur.correct + (isCorrect ? 1 : 0) };
  }
  const rec = next.qHistory[q.id] || { attempts: 0, lastCorrect: null };
  next.qHistory[q.id] = { attempts: rec.attempts + 1, lastCorrect: isCorrect };
  return next;
}
