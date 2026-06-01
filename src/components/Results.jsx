import { DOMAINS, EXAM } from "../data/curriculum.js";

export default function Results({ result, questions, isExam, onReviewMisses, onDone }) {
  const pass = result.scaled >= EXAM.passScaled;
  const pct = Math.round((result.correct / result.total) * 100);
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
