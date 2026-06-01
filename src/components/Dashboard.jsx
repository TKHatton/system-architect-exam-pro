import { DOMAINS, UNITS, EXAM } from "../data/curriculum.js";
import { domainAccuracy, weakestDomain } from "../lib/engine.js";

function estScaled(state) {
  const acc = domainAccuracy(state);
  let num = 0, den = 0;
  for (const [d, info] of Object.entries(DOMAINS)) {
    if (acc[d] != null) { num += (acc[d] / 100) * info.weight; den += info.weight; }
  }
  if (!den) return null;
  return Math.round(100 + (num / den) * 900);
}

export default function Dashboard({ state, setTab, setTarget }) {
  const done = state.completedUnits.length;
  const total = UNITS.length;
  const acc = domainAccuracy(state);
  const est = estScaled(state);
  const weak = weakestDomain(state);
  const seen = Object.values(state.domainStats).reduce((a, s) => a + s.seen, 0);

  let daysLeft = null;
  if (state.examTarget) {
    daysLeft = Math.ceil((new Date(state.examTarget) - new Date()) / 86400000);
  }

  return (
    <div className="rise">
      <div className="eyebrow">Pod {state.pod} · 4-week sprint</div>
      <div className="h2">{state.name ? `Onward, ${state.name}.` : "Your command deck."}</div>
      <p className="lead">Heaviest domains first, scenarios second, mock exams last. Pass line is {EXAM.passScaled} on the 100–1000 scale.</p>

      <div className="tiles" style={{ marginTop: 22 }}>
        <div className="tile">
          <div className="k">Est. score</div>
          <div className="v" style={{ color: est == null ? "var(--muted)" : est >= EXAM.passScaled ? "var(--good)" : "var(--accent)" }}>
            {est == null ? "N/A" : est}
          </div>
          <div className="muted mono" style={{ fontSize: 10 }}>target {EXAM.passScaled}</div>
        </div>
        <div className="tile">
          <div className="k">Units done</div>
          <div className="v">{done}<small> / {total}</small></div>
        </div>
        <div className="tile">
          <div className="k">Questions seen</div>
          <div className="v">{seen}</div>
        </div>
        <div className="tile">
          <div className="k">Days to exam</div>
          <div className="v" style={{ color: daysLeft != null && daysLeft < 7 ? "var(--accent)" : "var(--ink)" }}>
            {daysLeft == null ? "N/A" : daysLeft}
          </div>
          {state.examTarget && <div className="muted mono" style={{ fontSize: 10 }}>{new Date(state.examTarget).toLocaleDateString()}</div>}
        </div>
      </div>

      {!state.examTarget && (
        <div className="callout" style={{ marginTop: 16 }}>
          Set your exam date to turn on the countdown.{" "}
          <input type="date" className="input" style={{ width: "auto", display: "inline-block", marginLeft: 8 }}
            onChange={(e) => setTarget(e.target.value)} />
        </div>
      )}

      <div className="panel" style={{ marginTop: 22 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <div className="eyebrow">Domain mastery</div>
          <button className="btn ghost sm" onClick={() => setTab("curriculum")}>Open curriculum →</button>
        </div>
        <div className="dom-row">
          {Object.entries(DOMAINS).map(([d, info]) => (
            <div className="dom" key={d}>
              <span className="dot" style={{ background: info.color }} />
              <div>
                <div className="nm">{info.name}<b>{info.weight}%</b></div>
                <div className="bar" style={{ marginTop: 6 }}>
                  <span style={{ width: `${acc[d] || 3}%`, background: info.color, opacity: acc[d] == null ? .25 : 1 }} />
                </div>
              </div>
              <span className="pct">{acc[d] == null ? "N/A" : `${acc[d]}%`}</span>
            </div>
          ))}
        </div>
        {seen > 8 && (
          <div className="callout" style={{ marginTop: 18 }}>
            <b style={{ color: DOMAINS[weak].color }}>Weakest right now: {DOMAINS[weak].name}.</b>{" "}
            Your "weak-spot drill" and the Phase-3 reviews will pull from here automatically.{" "}
            <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setTab("drill")}>Drill it now</button>
          </div>
        )}
      </div>
    </div>
  );
}
