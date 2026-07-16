import { UNITS, WEEKS, DOMAINS } from "../data/curriculum.js";
import { isFreeMode } from "../lib/engine.js";

export default function Curriculum({ state, onStartUnit, onToggleUnit, onUpgrade }) {
  const freeMode = isFreeMode();
  const byWeek = { 1: [], 2: [], 3: [], 4: [] };
  UNITS.forEach((u) => byWeek[u.week].push(u));

  return (
    <div className="rise">
      <div className="eyebrow">The official 4-week plan</div>
      <div className="h2">Curriculum {freeMode && <span className="badge badge-locked">LOCKED</span>}</div>
      <p className="lead">{freeMode
        ? "The 4-week curriculum is locked in free mode. Unlock full access to see daily tasks, structured study plan, and track your progress."
        : "This mirrors your pod's weekly plan exactly — every day, plus the hands-on Labs and Anthropic Academy courses. Progress is by unit, so a free day = 2–3 units, a busy Wednesday = one. Each Sunday ends with a check-in."}</p>

      {[1, 2, 3, 4].map((w) => {
        const wk = WEEKS[w];
        const dom = DOMAINS[wk.domain];
        const doneInWeek = freeMode ? 0 : byWeek[w].filter((u) => state.completedUnits.includes(u.id)).length;
        return (
          <div className="phase" key={w} style={{ marginTop: 30, "--accent": dom?.color, opacity: freeMode ? 0.5 : 1 }}>
            <div className="phase-head">
              <span className="n">{wk.icon} Week {w}: {wk.title}</span>
              <span className="t">
                {freeMode ? "LOCKED" : `${wk.weight}% · ${doneInWeek}/${byWeek[w].length} done`}
              </span>
            </div>
            <p className="muted" style={{ fontSize: 14 }}>{wk.blurb}</p>
            <div className="units">
              {byWeek[w].map((u) => {
                const done = freeMode ? false : state.completedUnits.includes(u.id);
                const dDom = u.domain ? DOMAINS[u.domain] : null;
                const kind = u.isExam ? "exam" : u.isLab ? "lab" : u.quiz?.mixed ? "review" : "study";
                return (
                  <div key={u.id} className={`unit ${done ? "done" : ""} ${freeMode ? "locked" : ""}`}
                    style={dDom ? { "--accent": dDom.color } : undefined}
                    onClick={() => { if (!u.isLab && !freeMode) onStartUnit(u); }}>
                    {done && <span className="check">✓ done</span>}
                    {freeMode && <span className="lock-icon">🔒</span>}
                    <div className="um" style={{ marginTop: 0, marginBottom: 8 }}>
                      <span className="tag" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>{u.day}</span>
                      {u.academy && <span className="tag">🎓 Academy</span>}
                      {kind === "lab" && <span className="tag" style={{ color: "var(--d2)", borderColor: "var(--d2)" }}>🛠 Lab</span>}
                      {kind === "exam" && <span className="tag" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}>📝 60Q exam</span>}
                    </div>
                    <div className="ut">{u.topic}</div>
                    <div className="uf">{u.activity}</div>
                    {u.lab && <div className="callout" style={{ marginTop: 10, fontSize: 13 }}>{u.lab}</div>}
                    <div className="um">
                      <span>{u.time}</span>
                      {u.reading && <span>{u.reading}</span>}
                      {u.quiz && !u.quiz.mixed && <span>{u.quiz.count}Q</span>}
                      {dDom && <span style={{ color: dDom.color }}>{dDom.weight}%</span>}
                    </div>
                    {u.isLab && (
                      <div className="row" style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                        <button className={`btn sm ${done ? "ghost" : ""}`} onClick={() => onToggleUnit(u.id)}>
                          {done ? "Mark not done" : "Mark done"}
                        </button>
                        {u.link && <a className="btn ghost sm" href={u.link} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>Open reference ↗</a>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {freeMode ? (
        <div className="callout" style={{ marginTop: 28, textAlign: "center" }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Curriculum locked in free mode</div>
          <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
            Unlock the full 4-week structured study plan with daily tasks, labs, and progress tracking
          </p>
          <button className="btn" onClick={onUpgrade}>Unlock Curriculum →</button>
        </div>
      ) : (
        <div className="callout" style={{ marginTop: 28 }}>
          🎓 The Academy courses live on <b>Anthropic Academy</b> (the Skilljar learning portal). The tool quizzes every concept they cover, but watch the videos there for the full walkthrough.
        </div>
      )}
    </div>
  );
}
