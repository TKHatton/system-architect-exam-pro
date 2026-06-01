// Storage layer. Zero-config: uses localStorage out of the box.
// When VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set, it upgrades to
// hosted Postgres (cross-device progress + a pod-wide leaderboard).
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const hasCloud = Boolean(url && key);
const sb = hasCloud ? createClient(url, key) : null;

const LS_KEY = "cca_prep_state_v1";
const ID_KEY = "cca_prep_uid";

export function getUserId() {
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = "u_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

const blank = () => ({
  name: "",
  pod: "Epsilon",
  completedUnits: [],
  // per-domain stats: { [domain]: { seen, correct } }
  domainStats: {},
  // per-question history: { [qid]: { attempts, lastCorrect } }
  qHistory: {},
  examHistory: [], // { date, scaled, correct, total, byDomain }
  examTarget: null, // ISO date string
});

export async function loadState() {
  let local = blank();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) local = { ...blank(), ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }

  if (hasCloud) {
    try {
      const { data } = await sb.from("progress").select("state").eq("user_id", getUserId()).maybeSingle();
      if (data?.state) return { ...blank(), ...data.state };
    } catch (e) { console.warn("Supabase load failed, using local:", e.message); }
  }
  return local;
}

let saveTimer = null;
export function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  if (hasCloud) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await sb.from("progress").upsert(
          { user_id: getUserId(), name: state.name || "", state },
          { onConflict: "user_id" }
        );
      } catch (e) { console.warn("Supabase save failed:", e.message); }
    }, 600);
  }
}

// ---- Pod leaderboard (cloud only) ----
export async function postExamToLeaderboard(name, scaled, correct, total) {
  if (!hasCloud) return;
  try {
    await sb.from("leaderboard").insert({
      user_id: getUserId(), name: name || "Anonymous Architect",
      pod: "Epsilon", scaled, correct, total,
    });
  } catch (e) { console.warn("Leaderboard post failed:", e.message); }
}

export async function getLeaderboard() {
  if (!hasCloud) return null;
  try {
    // best scaled score per user
    const { data } = await sb.from("leaderboard").select("name,scaled,total,created_at").order("scaled", { ascending: false }).limit(100);
    if (!data) return [];
    const best = {};
    for (const r of data) {
      if (!best[r.name] || r.scaled > best[r.name].scaled) best[r.name] = r;
    }
    return Object.values(best).sort((a, b) => b.scaled - a.scaled);
  } catch (e) { return []; }
}
