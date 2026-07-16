import { useState, useEffect } from "react";
import { UNITS, EXAM } from "./data/curriculum.js";
import { loadState, saveState, postExamToLeaderboard } from "./lib/storage.js";
import { pickQuestions, buildExam, buildFreeAssessment, recordAnswer, isFreeMode, isValidLicense, activateLicense, FREE_IDS } from "./lib/engine.js";
import Dashboard from "./components/Dashboard.jsx";
import Curriculum from "./components/Curriculum.jsx";
import Scenarios from "./components/Scenarios.jsx";
import PodView from "./components/PodView.jsx";
import Quiz from "./components/Quiz.jsx";
import Results from "./components/Results.jsx";
import UpgradePrompt from "./components/UpgradePrompt.jsx";

// Tabs differ based on license status
function getTabs() {
  if (isFreeMode()) {
    return [["home", "Deck"], ["drill", "Drill"], ["pod", "Pod"]];
  }
  return [
    ["home", "Deck"], ["curriculum", "Curriculum"],
    ["scenarios", "Scenarios"], ["drill", "Drill"], ["pod", "Pod"],
  ];
}

export default function App() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("home");
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [freeMode, setFreeMode] = useState(isFreeMode());
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => { loadState().then(setState); }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");
  if (!state) return <div className="app" style={{ paddingTop: 80 }}><p className="muted mono">Loading your progress…</p></div>;

  const update = (patch) => setState((s) => { const n = { ...s, ...patch }; saveState(n); return n; });

  const TABS = getTabs();

  function handleActivate(code) {
    if (activateLicense(code)) {
      setFreeMode(false);
      setShowUpgrade(false);
      window.location.reload();
    }
  }

  // ---- launching study sessions ----
  function startUnit(u) {
    if (u.isLab) return;
    if (u.isExam) return startExam(u.id);
    if (freeMode) return setShowUpgrade(true);
    const qs = pickQuestions(u.quiz, state, u.quiz.count);
    setSession({ questions: qs, mode: "practice", title: u.title || u.topic, unitId: u.id });
    setResult(null);
  }
  function toggleUnit(id) {
    setState((s) => {
      const has = s.completedUnits.includes(id);
      const n = { ...s, completedUnits: has ? s.completedUnits.filter((x) => x !== id) : [...s.completedUnits, id] };
      saveState(n); return n;
    });
  }
  function startScenario(n) {
    if (freeMode) return setShowUpgrade(true);
    const qs = pickQuestions({ scenario: n }, state, 10);
    setSession({ questions: qs, mode: "practice", title: `Scenario ${n} drill` });
    setResult(null);
  }
  function startDrill(count = 15) {
    if (freeMode) return setShowUpgrade(true);
    const qs = pickQuestions({ weak: true }, state, count);
    setSession({ questions: qs, mode: "practice", title: "Weak-spot drill" });
    setResult(null); setTab("drill");
  }
  function startFreeAssessment() {
    const qs = buildFreeAssessment();
    setSession({ questions: qs, mode: "free-assessment", title: "Free Assessment", minutes: 15, unitId: null });
    setResult(null);
  }
  function startMixed(count = 20) {
    if (freeMode) return setShowUpgrade(true);
    const qs = pickQuestions({ mixed: true }, state, count);
    setSession({ questions: qs, mode: "practice", title: "Mixed quiz" });
    setResult(null);
  }
  function startExam(unitId) {
    if (freeMode) return setShowUpgrade(true);
    const qs = buildExam(state);
    setSession({ questions: qs, mode: "exam", title: "Mock Exam", minutes: EXAM.minutes, unitId });
    setResult(null);
  }

  // ---- answer + completion ----
  function handleAnswer(q, correct) {
    setState((s) => { const n = recordAnswer(s, q, correct); saveState(n); return n; });
  }

  function handleComplete(res, questions) {
    setState((s) => {
      const n = { ...s };
      if (session?.unitId && !n.completedUnits.includes(session.unitId))
        n.completedUnits = [...n.completedUnits, session.unitId];
      if (session?.mode === "exam") {
        n.examHistory = [...n.examHistory, { date: new Date().toISOString(), scaled: res.scaled, correct: res.correct, total: res.total, byDomain: res.byDomain }];
        postExamToLeaderboard(n.name, res.scaled, res.correct, res.total);
      }
      saveState(n); return n;
    });
    setResult({ result: res, questions, isExam: session?.mode === "exam", isFreeAssessment: session?.mode === "free-assessment" });
    setSession(null);
  }

  function reviewMisses() {
    const { result: r, questions } = result;
    const misses = questions.filter((q, idx) => r.answers[idx] !== q.correct);
    if (freeMode) return setShowUpgrade(true);
    setSession({ questions: misses, mode: "practice", title: "Reviewing your misses" });
    setResult(null);
  }

  function importState(obj) {
    const n = {
      ...state, ...obj,
      completedUnits: Array.isArray(obj.completedUnits) ? obj.completedUnits : [],
      domainStats: obj.domainStats || {},
      qHistory: obj.qHistory || {},
      examHistory: Array.isArray(obj.examHistory) ? obj.examHistory : [],
    };
    setState(n); saveState(n);
  }

  // ---- render ----
  const inSession = session || result;

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <span className="mark">SAEP</span>
          <div>
            <h1>System Architect Exam Pro</h1>
            <div className="sub">
              Claude Certified Architect · Foundations
              {freeMode && <span className="badge badge-free">FREE</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {!inSession && (
            <nav className="nav">
              {TABS.map(([k, label]) => (
                <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{label}</button>
              ))}
            </nav>
          )}
          {freeMode && !inSession && (
            <button className="btn" onClick={() => setShowUpgrade(true)} style={{ background: "var(--accent)", color: "#fff" }}>
              Unlock Full Access
            </button>
          )}
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === "light" ? (
              <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </div>

      {/* Onboarding: name */}
      {!state.name && !inSession && (
        <div className="callout rise" style={{ marginBottom: 22 }}>
          <div className="row">
            <span>Quick — what should the pod call you?</span>
            <input className="input" style={{ maxWidth: 240 }} placeholder="Your name"
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.value.trim()) update({ name: e.target.value.trim() }); }} />
            <span className="muted mono" style={{ fontSize: 11 }}>press enter</span>
          </div>
        </div>
      )}

      {/* Active quiz / exam / free assessment */}
      {session && (
        <Quiz {...session} onAnswer={handleAnswer} onComplete={handleComplete}
          onExit={() => { setSession(null); }} />
      )}

      {/* Results */}
      {result && (
        <Results result={result.result} questions={result.questions}
          isExam={result.isExam} isFreeAssessment={result.isFreeAssessment}
          onReviewMisses={reviewMisses} onDone={() => setResult(null)}
          onUpgrade={() => setShowUpgrade(true)} freeMode={freeMode} />
      )}

      {/* Tabs */}
      {!inSession && tab === "home" && (
        <Dashboard state={state} setTab={setTab} setTarget={(d) => update({ examTarget: d })}
          freeMode={freeMode} onFreeAssessment={startFreeAssessment} onUpgrade={() => setShowUpgrade(true)} />
      )}
      {!inSession && tab === "curriculum" && <Curriculum state={state} onStartUnit={startUnit} onToggleUnit={toggleUnit} />}
      {!inSession && tab === "scenarios" && <Scenarios onDrill={startScenario} freeMode={freeMode} onUpgrade={() => setShowUpgrade(true)} />}
      {!inSession && tab === "drill" && (
        <div className="rise">
          <div className="eyebrow">{freeMode ? "Try the full experience" : "Phase 3 · no new learning"}</div>
          <div className="h2">{freeMode ? "Unlock Full Practice" : "Drill"}</div>

          {freeMode ? (
            <>
              <p className="lead">You've seen what 23 questions can do. The full study system has <b>410 questions</b> across all 5 domains, <b>88 scenario questions</b>, <b>60-question mock exams</b>, and a <b>4-week curriculum</b>.</p>
              <div className="callout" style={{ marginTop: 22 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Full Access — $67</div>
                <ul style={{ paddingLeft: 20, margin: "10px 0", lineHeight: 1.8 }}>
                  <li><b>410 practice questions</b> with detailed explanations</li>
                  <li><b>Scenario drills</b> — 88 questions across 8 real-world scenarios</li>
                  <li><b>Mock exams</b> — 60 questions, timed, scored on the real 100–1000 scale</li>
                  <li><b>4-week study curriculum</b> with daily tasks</li>
                  <li><b>Weak-spot detection</b> — targets your lowest domains automatically</li>
                  <li><b>Progress tracking</b> with domain accuracy dashboard</li>
                </ul>
                <button className="btn" onClick={() => setShowUpgrade(true)} style={{ marginTop: 12, background: "var(--accent)", color: "#fff" }}>
                  Unlock now →
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="lead">Full timed mock exams scored to {EXAM.passScaled}, targeted weak-spot drills, and broad mixed sets. This is the last-10-days mode.</p>
              <div className="grid" style={{ marginTop: 22, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                <div className="panel">
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 600 }}>Mock exam</div>
                  <p className="muted" style={{ fontSize: 14, margin: "6px 0 14px" }}>60 questions, {EXAM.minutes} min, weighted exactly like the real domains. Scored on the 100–1000 scale.</p>
                  <button className="btn" onClick={() => startExam()}>Start mock exam</button>
                </div>
                <div className="panel">
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 600 }}>Weak-spot drill</div>
                  <p className="muted" style={{ fontSize: 14, margin: "6px 0 14px" }}>20 questions pulled from your weakest domain, with explanations on every answer.</p>
                  <button className="btn ghost" onClick={() => startDrill(20)}>Drill weak spot</button>
                </div>
                <div className="panel">
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 600 }}>Mixed set</div>
                  <p className="muted" style={{ fontSize: 14, margin: "6px 0 14px" }}>20 questions across all five domains, prioritizing items you haven't seen or missed.</p>
                  <button className="btn ghost" onClick={() => startMixed(20)}>Start mixed set</button>
                </div>
              </div>
              {state.examHistory.length > 0 && (
                <div className="panel" style={{ marginTop: 18 }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>Mock exam history</div>
                  {state.examHistory.slice().reverse().map((e, i) => (
                    <div className="lbrow" key={i}>
                      <span className="rk" style={{ fontSize: 13 }}>{new Date(e.date).toLocaleDateString()}</span>
                      <span className="muted mono" style={{ fontSize: 12 }}>{e.correct}/{e.total}</span>
                      <span className="sc" style={{ color: e.scaled >= EXAM.passScaled ? "var(--good)" : "var(--bad)" }}>{e.scaled}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {!inSession && tab === "pod" && <PodView state={state} onImport={importState} />}

      {/* Footer */}
      {!inSession && (
        <footer className="footer">
          Created with care by <a href="https://linkedin.com/in/lenisekenney" target="_blank" rel="noopener noreferrer">Lenise Kenney</a>
          {freeMode && (
            <div style={{ marginTop: 12, fontSize: 14 }}>
              Ready to go deeper?{" "}
              <button className="text-link" onClick={() => setShowUpgrade(true)}>
                Unlock full access →
              </button>
            </div>
          )}
        </footer>
      )}

      {/* Upgrade Modal */}
      {showUpgrade && (
        <UpgradePrompt
          onClose={() => setShowUpgrade(false)}
          onActivate={handleActivate}
        />
      )}
    </div>
  );
}
