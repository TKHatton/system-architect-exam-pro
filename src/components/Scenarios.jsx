import { SCENARIOS } from "../data/curriculum.js";
import { allQuestions } from "../lib/engine.js";

export default function Scenarios({ onDrill }) {
  return (
    <div className="rise">
      <div className="eyebrow">Where the exam lives</div>
      <div className="h2">The 8 scenarios</div>
      <p className="lead">You'll be hit with 4 of these 8, chosen at random. Learn each one's decision rule — the "when do you use this and why" — and the similar-looking answer options stop being a trap.</p>

      <div className="grid" style={{ marginTop: 22 }}>
        {Object.entries(SCENARIOS).map(([n, s]) => {
          const count = allQuestions.filter((q) => q.scenario === Number(n)).length;
          return (
            <div className="panel" key={n}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: ".1em" }}>SCENARIO {n}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 600, margin: "4px 0 8px" }}>{s.name}</div>
                  <p className="muted" style={{ fontSize: 14 }}>{s.blurb}</p>
                </div>
              </div>
              <div className="row" style={{ marginTop: 14, justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                  {count > 0 ? `${count} dedicated questions` : "drilled via its domains"}
                </span>
                {count > 0 && <button className="btn sm" onClick={() => onDrill(Number(n))}>Drill scenario {n}</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
