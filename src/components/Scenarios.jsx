import { SCENARIOS } from "../data/curriculum.js";
import { allQuestions } from "../lib/engine.js";

export default function Scenarios({ onDrill, freeMode, onUpgrade }) {
  return (
    <div className="rise">
      <div className="eyebrow">Where the exam lives</div>
      <div className="h2">The 8 scenarios</div>
      <p className="lead">You'll be hit with 4 of these 8, chosen at random. Learn each one's decision rule — the "when do you use this and why" — and the similar-looking answer options stop being a trap.</p>

      <div className="grid" style={{ marginTop: 22 }}>
        {Object.entries(SCENARIOS).map(([n, s]) => {
          const count = allQuestions.filter((q) => q.scenario === Number(n)).length;
          const isLocked = freeMode;
          return (
            <div className="panel" key={n} style={{ opacity: isLocked ? 0.6 : 1 }}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: ".1em" }}>SCENARIO {n}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 600, margin: "4px 0 8px" }}>
                    {s.name}
                    {isLocked && <span className="badge badge-locked" style={{ marginLeft: 8, fontSize: 10 }}>LOCKED</span>}
                  </div>
                  <p className="muted" style={{ fontSize: 14 }}>{s.blurb}</p>
                </div>
              </div>
              <div className="row" style={{ marginTop: 14, justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                  {count > 0 ? `${count} dedicated questions` : "drilled via its domains"}
                </span>
                {isLocked ? (
                  <button className="btn ghost sm" onClick={onUpgrade} style={{ fontSize: 12 }}>Unlock →</button>
                ) : (
                  count > 0 && <button className="btn sm" onClick={() => onDrill(Number(n))}>Drill scenario {n}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {freeMode && (
        <div className="callout" style={{ marginTop: 28, textAlign: "center" }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Scenario drills are locked in free mode</div>
          <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
            Unlock to practice all 88 scenario questions (8 scenarios × ~11 questions each)
          </p>
          <button className="btn" onClick={onUpgrade}>Unlock Scenarios →</button>
        </div>
      )}
    </div>
  );
}
