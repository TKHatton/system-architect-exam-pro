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

export default function Dashboard({ state, setTab, setTarget, freeMode, onFreeAssessment, onUpgrade }) {
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
      <div className="eyebrow">{freeMode ? "Free Assessment" : "4-week sprint"}</div>
      <div className="h2">{state.name ? `Onward, ${state.name}.` : "Your command deck."}</div>

      {freeMode ? (
        <p className="lead">
          <b>23 free questions.</b> Covers 5 domains + 3 scenarios. Scored on the real 100–1000 scale. Take the assessment to see where you stand, then unlock the full system.
        </p>
      ) : (
        <p className="lead">Heaviest domains first, scenarios second, mock exams last. Pass line is {EXAM.passScaled} on the 100–1000 scale.</p>
      )}

      <div className="tiles" style={{ marginTop: 22 }}>
        {freeMode ? (
          <>
            <div className="tile">
              <div className="k">Free Questions</div>
              <div className="v">23</div>
              <div className="muted mono" style={{ fontSize: 10 }}>of 410 total</div>
            </div>
            <div className="tile">
              <div className="k">Domains Covered</div>
              <div className="v">5</div>
              <div className="muted mono" style={{ fontSize: 10 }}>of 5 total</div>
            </div>
            <div className="tile">
              <div className="k">Scenarios</div>
              <div className="v">3</div>
              <div className="muted mono" style={{ fontSize: 10 }}>of 8 total</div>
            </div>
            <div className="tile">
              <div className="k">Mock Exams</div>
              <div className="v">0</div>
              <div className="muted mono" style={{ fontSize: 10 }}>paid only</div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Free assessment CTA */}
      {freeMode && (
        <div className="callout" style={{ marginTop: 22, textAlign: "center", padding: "32px 24px" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Ready to test yourself?</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
            Take the Free Assessment
          </div>
          <p className="muted" style={{ fontSize: 15, marginBottom: 20, maxWidth: 500, margin: "0 auto 20px" }}>
            23 questions · ~15 minutes · Covers all 5 domains + 3 scenarios. See your score and domain breakdown instanty.
          </p>
          <button
            className="btn"
            onClick={onFreeAssessment}
            style={{ padding: "14px 32px", fontSize: 16, fontWeight: 600, background: "var(--accent)", color: "#fff" }}
          >
            Start Free Assessment →
          </button>
        </div>
      )}

      {!state.examTarget && !freeMode && (
        <div className="callout" style={{ marginTop: 16 }}>
          Set your exam date to turn on the countdown.{" "}
          <input type="date" className="input" style={{ width: "auto", display: "inline-block", marginLeft: 8 }}
            onChange={(e) => setTarget(e.target.value)} />
        </div>
      )}

      <div className="panel" style={{ marginTop: 22 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <div className="eyebrow">Domain mastery</div>
          {!freeMode && (
            <button className="btn ghost sm" onClick={() => setTab("curriculum")}>Open curriculum →</button>
          )}
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
        {seen > 8 && !freeMode && (
          <div className="callout" style={{ marginTop: 18 }}>
            <b style={{ color: DOMAINS[weak].color }}>Weakest right now: {DOMAINS[weak].name}.</b>{" "}
            Your "weak-spot drill" and the Phase-3 reviews will pull from here automatically.{" "}
            <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setTab("drill")}>Drill it now</button>
          </div>
        )}
        {freeMode && (
          <div className="callout" style={{ marginTop: 18, textAlign: "center" }}>
            <b>Want to see Domain 4 data?</b> It's not in the free tier. Unlock full access to track all 5 domains.{" "}
            <button className="btn sm" style={{ marginTop: 10 }} onClick={onUpgrade}>Unlock →</button>
          </div>
        )}
      </div>

      {freeMode && (
        <div className="panel" style={{ marginTop: 22, textAlign: "center", padding: 24 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            Ready for the full system?
          </div>
          <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
            Unlock 410 questions · 88 scenarios · Mock exams · 4-week curriculum
          </p>
          <button className="btn" onClick={onUpgrade} style={{ background: "var(--accent)", color: "#fff" }}>
            Unlock Full Access — $47
          </button>
        </div>
      )}
    </div>
  );
}
