import { useState, useEffect, useRef } from "react";
import { DOMAINS } from "../data/curriculum.js";
import { toScaled } from "../lib/engine.js";

const LETTERS = ["a", "b", "c", "d"];

export default function Quiz({ questions, mode = "practice", title, minutes, onAnswer, onComplete, onExit }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [secsLeft, setSecsLeft] = useState(minutes ? minutes * 60 : null);
  const timerRef = useRef(null);

  const q = questions[i];
  const isExam = mode === "exam";
  const isFreeAssessment = mode === "free-assessment";

  useEffect(() => {
    if (!isExam || !minutes) return;
    timerRef.current = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) { clearInterval(timerRef.current); finish({ ...answers }); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, []);

  function choosePractice(letter) {
    if (revealed) return;
    setPicked(letter);
    setRevealed(true);
    const correct = letter === q.correct;
    setAnswers((a) => ({ ...a, [i]: letter }));
    onAnswer && onAnswer(q, correct);
  }

  function chooseExam(letter) {
    setPicked(letter);
    setAnswers((a) => ({ ...a, [i]: letter }));
  }

  function next() {
    if (i + 1 >= questions.length) { finish(answers); return; }
    setI(i + 1); setPicked(answers[i + 1] || null); setRevealed(false);
  }
  function prev() {
    if (i === 0) return;
    setI(i - 1); setPicked(answers[i - 1] || null); setRevealed(false);
  }

  function finish(finalAnswers) {
    clearInterval(timerRef.current);
    let correct = 0;
    const byDomain = {};
    questions.forEach((qq, idx) => {
      const ok = finalAnswers[idx] === qq.correct;
      if (ok) correct++;
      (qq.domains || []).forEach((d) => {
        if (!d) return;
        byDomain[d] = byDomain[d] || { seen: 0, correct: 0 };
        byDomain[d].seen++; if (ok) byDomain[d].correct++;
      });
      // for exam mode and free assessment, feed answers to global stats
      if (isExam || isFreeAssessment) onAnswer && onAnswer(qq, ok);
    });
    const result = { correct, total: questions.length, scaled: toScaled(correct, questions.length), byDomain, answers: finalAnswers };
    setFinished(true);
    onComplete && onComplete(result, questions);
  }

  if (finished) return null; // parent swaps to results view via onComplete

  const optClass = (letter) => {
    if (isExam) return picked === letter ? "opt sel" : "opt";
    if (!revealed) return "opt";
    if (letter === q.correct) return "opt correct";
    if (letter === picked) return "opt wrong";
    return "opt";
  };

  return (
    <div className="quizwrap rise">
      <div className="qmeta">
        <span>
          {title}
          {isFreeAssessment && <span className="badge badge-free" style={{ marginLeft: 8, fontSize: 10 }}>FREE</span>}
        </span>
        <span>
          {isExam && secsLeft != null && (
            <span style={{ color: secsLeft < 300 ? "var(--bad)" : "var(--accent)", marginRight: 14 }}>
              ⏱ {String(Math.floor(secsLeft / 60)).padStart(2, "0")}:{String(secsLeft % 60).padStart(2, "0")}
            </span>
          )}
          Q{i + 1} / {questions.length}
        </span>
      </div>
      <div className="qprogress"><span style={{ width: `${((i + 1) / questions.length) * 100}%` }} /></div>

      {isFreeAssessment && (
        <div className="callout" style={{ marginBottom: 12, fontSize: 13, padding: "8px 12px" }}>
          Question {i + 1} of 23 · Free Assessment · No signup required
        </div>
      )}

      <div className="qtext">{q.question}</div>

      <div className="opts">
        {LETTERS.map((l) => q.options[l] != null && (
          <button key={l} className={optClass(l)} disabled={!isExam && revealed}
            onClick={() => (isExam ? chooseExam(l) : choosePractice(l))}>
            <span className="lt">{l.toUpperCase()}</span>
            <span>{q.options[l]}</span>
          </button>
        ))}
      </div>

      {!isExam && revealed && (
        <div className="expl rise">
          <div className="lab">{picked === q.correct ? "✓ Correct" : "✗ Not quite"} · why</div>
          <p>{q.explanation || "(No explanation provided for this item.)"}</p>
          <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 10, letterSpacing: ".08em" }}>
            {q.scenario_name ? `SCENARIO: ${q.scenario_name.toUpperCase()} · ` : ""}
            {(q.domains || []).filter(Boolean).map((d) => DOMAINS[d]?.name.split(" ")[0]).join(" / ")} · {q.id}
          </div>
        </div>
      )}

      <div className="row" style={{ marginTop: 22, justifyContent: "space-between" }}>
        <button className="btn ghost sm" onClick={onExit}>Save & exit</button>
        <div className="row">
          {isExam && <button className="btn ghost sm" onClick={prev} disabled={i === 0}>Back</button>}
          {isExam
            ? <button className="btn sm" onClick={next}>{i + 1 >= questions.length ? "Submit exam" : "Next"}</button>
            : <button className="btn sm" onClick={next} disabled={!revealed}>
                {i + 1 >= questions.length
                  ? (isFreeAssessment ? "See my results" : "See results")
                  : "Next"}
              </button>}
        </div>
      </div>
    </div>
  );
}
