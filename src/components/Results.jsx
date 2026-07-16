import { DOMAINS, EXAM } from "../data/curriculum.js";

export default function Results({ result, questions, isExam, isFreeAssessment, onReviewMisses, onDone, onUpgrade, freeMode }) {
  const pass = result.scaled >= EXAM.passScaled;
  const pct = Math.round((result.correct / result.total) * 100);

  // Free assessment results - show conversion CTA
  if (isFreeAssessment) {
    const freeTotal = 23;
    const paidTotal = 410;
    const scenariosFree = 3;
    const scenariosPaid = 88;

    return (
      <div className="quizwrap rise" style={{ textAlign: "center" }}>
        <div className="eyebrow">Free Assessment Complete</div>
        <div className="score-big" style={{ color: "var(--ink)" }}>
          {pct}%
        </div>
        <div className="muted mono" style={{ fontSize: 14, marginBottom: 24 }}>
          {result.correct} / {result.total} correct · Scaled score: {result.scaled}
        </div>

        <div className="panel" style={{ marginTop: 20, textAlign: "left" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Your Domain Breakdown</div>
          <div className="dom-row">
            {Object.entries(DOMAINS).map(([d, info]) => {
              const s = result.byDomain[d];
              const rate = s ? Math.round((s.correct / s.seen) * 100) : null;
              return (
                <div className="dom" key={d}>
                  <span className="dot" style={{ background: info.color }} />
                  <div>
                    <div className="bar"><span style={{ width: `${rate || 0}%`, background: info.color }} /></div>
                  </div>
                  <span className="pct">{rate == null ? "no data" : `${rate}%`}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="callout" style={{ marginTop: 24, textAlign: "left" }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            You just tried {freeTotal} of {paidTotal} questions
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.6 }}>
            The full study system has <b>{paidTotal} practice questions</b> across all 5 domains, <b>88 scenario questions</b> (you saw {scenariosFree}), <b>60-question mock exams</b>, and a structured <b>4-week curriculum</b>.
          </p>
          <ul style={{ paddingLeft: 20, margin: "12px 0", fontSize: 14, lineHeight: 1.8 }}>
            <li>All 8 scenarios (you saw 3)</li>
            <li>Mock exams scored to the real 720 pass line</li>
            <li>Weak-spot detection that targets your lowest domains</li>
            <li>Daily study tasks for 4 weeks</li>
          </ul>
        </div>

        <div className="row" style={{ marginTop: 28, justifyContent: "center", gap: 16 }}>
          <button className="btn ghost" onClick={onDone}>Back to dashboard</button>
          <button className="btn" onClick={onUpgrade} style={{ background: "var(--accent)", color: "#fff" }}>
            Unlock Full Access — $67
          </button>
        </div>
      </div>
    );
  }

  // Normal (paid) results
  return (
    <div className="quizwrap rise" style={{ textAlign: "center" }}>
      <div className="eyebrow">{isExam ? "Mock exam complete" : "Set complete"}</div>
      <div className="score-big" style={{ color: isExam ? (pass ? "var(--good)" : "var(--bad)") : "var(--ink)" }}>
        {isExam ? result.scaled : `${pct}%`}
      </div>
      {isExam
        ? <div className={`verdict ${pass ? "pass" : "fail"}`}>{pass ? "Above the 720 line" : `Below 720 · need +${EXAM.passScaled - result.scaled}`}</div>
        : <div className="muted mono" style={{ fontSize: 13 }}>{result.correct} / {result.total} correct</div>}

      <div className="panel" style={{ marginTop: 28, textAlign: "left" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>By domain</div>
        <div className="dom-row">
          {Object.entries(DOMAINS).map(([d, info]) => {
            const s = result.byDomain[d];
            const rate = s ? Math.round((s.correct / s.seen) * 100) : null;
            return (
              <div className="dom" key={d}>
                <span className="dot" style={{ background: info.color }} />
                <div>
                  <div className="bar"><span style={{ width: `${rate || 0}%`, background: info.color }} /></div>
                </div>
                <span className="pct">{rate == null ? "—" : `${rate}%`}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="row" style={{ marginTop: 24, justifyContent: "center" }}>
        {onReviewMisses && result.correct < result.total &&
          <button className="btn ghost" onClick={onReviewMisses}>Review my misses</button>}
        <button className="btn" onClick={onDone}>Done</button>
      </div>
    </div>
  );
}
