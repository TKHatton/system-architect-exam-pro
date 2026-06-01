import { useState, useEffect, useRef } from "react";
import { DOMAINS, UNITS } from "../data/curriculum.js";
import { domainAccuracy } from "../lib/engine.js";
import { getLeaderboard, hasCloud, getUserId } from "../lib/storage.js";

function buildCheckin(state) {
  const acc = domainAccuracy(state);
  const done = state.completedUnits.length;
  const recent = state.completedUnits.slice(-3).map((id) => UNITS.find((u) => u.id === id)?.title).filter(Boolean);
  const lastExam = state.examHistory[state.examHistory.length - 1];
  const strong = Object.entries(acc).filter(([, v]) => v != null).sort((a, b) => b[1] - a[1])[0];
  const weak = Object.entries(acc).filter(([, v]) => v != null).sort((a, b) => a[1] - b[1])[0];
  const lines = [
    `📍 Pod ${state.pod} check-in — ${state.name || "me"}`,
    `Units complete: ${done}/${UNITS.length}`,
    recent.length ? `Just finished: ${recent.join(", ")}` : null,
    lastExam ? `Latest mock: ${lastExam.scaled} (${lastExam.correct}/${lastExam.total})` : null,
    strong ? `Strongest: ${DOMAINS[strong[0]].name} (${strong[1]}%)` : null,
    weak ? `Working on: ${DOMAINS[weak[0]].name} (${weak[1]}%)` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export default function PodView({ state, onImport }) {
  const [board, setBoard] = useState(null);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const text = buildCheckin(state);

  useEffect(() => { if (hasCloud) getLeaderboard().then(setBoard); }, []);

  function copy() {
    navigator.clipboard?.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `saep-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg("Backup saved to your downloads ✓"); setTimeout(() => setMsg(""), 2400);
  }

  function importData(e) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try { onImport(JSON.parse(r.result)); setMsg("Progress restored ✓"); }
      catch { setMsg("Couldn't read that file — is it a SAEP backup?"); }
      setTimeout(() => setMsg(""), 2800);
    };
    r.readAsText(f);
    e.target.value = "";
  }

  return (
    <div className="rise">
      <div className="eyebrow">Pod {state.pod}</div>
      <div className="h2">Check-in & leaderboard</div>
      <p className="lead">Generate your daily check-in for the pod, and (once the shared database is connected) see how Epsilon stacks up.</p>

      <div className="panel" style={{ marginTop: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Your check-in</div>
        <div className="checkin-box">{text}</div>
        <button className="btn sm" style={{ marginTop: 14 }} onClick={copy}>{copied ? "Copied ✓" : "Copy check-in"}</button>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Your data — saved locally, free, forever</div>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Your progress lives in this browser and survives closing the app and rebooting — no database, no cost.
          Back it up to a file anytime so you're covered even if you clear your browser or switch machines.
        </p>
        <div className="row">
          <button className="btn sm" onClick={exportData}>Download backup</button>
          <button className="btn ghost sm" onClick={() => fileRef.current?.click()}>Restore from file</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={importData} style={{ display: "none" }} />
          {msg && <span className="mono" style={{ fontSize: 12, color: "var(--good)" }}>{msg}</span>}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Pod leaderboard — best mock-exam score</div>
        {!hasCloud && (
          <div className="callout">
            The leaderboard needs the shared database. Add your Supabase keys (see README) and your pod's scores show up here automatically — a clean way to flex on Epsilon.
          </div>
        )}
        {hasCloud && board && board.length === 0 && <p className="muted">No mock exams posted yet. Be the first.</p>}
        {hasCloud && board && board.map((r, idx) => (
          <div className={`lbrow ${r.user_id === getUserId() ? "me" : ""}`} key={idx}>
            <span className="rk">{idx + 1}</span>
            <span>{r.name}</span>
            <span className="sc">{r.scaled}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
