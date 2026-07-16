import { useState } from "react";

export default function UpgradePrompt({ onClose, onActivate }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("buy"); // "buy" | "activate"

  function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter your access code");
      return;
    }
    onActivate(code.trim());
    // If it returns without reloading, it failed
    setError("Invalid access code. Please check and try again.");
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {mode === "buy" && (
          <>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Full Access</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, margin: "0 0 16px" }}>Unlock the Complete Study System</h2>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>$47</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>One-time purchase · Lifetime access</div>
            </div>

            <ul style={{ paddingLeft: 0, margin: "0 0 24px", listStyle: "none" }}>
              {[
                ["410 practice questions", "All 5 domains with detailed explanations"],
                ["88 scenario questions", "8 real-world scenarios, like the real exam"],
                ["Mock exams", "60 questions, timed, scored 100–1000"],
                ["4-week curriculum", "Daily tasks, structured study plan"],
                ["Weak-spot detection", "Targets your lowest domains automatically"],
                ["Progress dashboard", "Domain accuracy + exam history"],
              ].map(([title, desc], i) => (
                <li key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--good)", fontWeight: 600, flexShrink: 0 }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{title}</div>
                    <div className="muted" style={{ fontSize: 13 }}>{desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href="https://signalstructure.ai/checkout/saep"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                display: "block",
                textAlign: "center",
                width: "100%",
                padding: "14px",
                fontSize: 16,
                fontWeight: 600,
                background: "var(--accent)",
                color: "#fff",
                textDecoration: "none",
                marginBottom: 12,
              }}
            >
              Buy Now →
            </a>

            <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
              Already have an access code?{" "}
              <button className="text-link" onClick={() => { setMode("activate"); setError(""); }}>
                Enter it here
              </button>
            </div>
          </>
        )}

        {mode === "activate" && (
          <>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Activate Access</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, margin: "0 0 16px" }}>Enter Your Access Code</h2>

            <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
              After purchase, you'll receive an access code via email. Enter it below to unlock the full study system.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="input"
                placeholder="SAEP-XXXX-XXXX-XXXX"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                style={{ width: "100%", fontSize: 16, padding: "12px", marginBottom: 12, fontFamily: "var(--mono)" }}
                autoFocus
              />
              {error && (
                <div style={{ color: "var(--bad)", fontSize: 13, marginBottom: 12 }}>{error}</div>
              )}
              <button
                type="submit"
                className="btn"
                style={{ width: "100%", padding: "12px", fontSize: 16, background: "var(--accent)", color: "#fff" }}
              >
                Activate
              </button>
            </form>

            <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 16 }}>
              Don't have a code yet?{" "}
              <button className="text-link" onClick={() => { setMode("buy"); setError(""); }}>
                Purchase access
              </button>
            </div>
          </>
        )}

        <div style={{ marginTop: 20, fontSize: 12, color: "var(--faint)", textAlign: "center" }}>
          Questions? Email <a href="mailto:lenise@signalstructure.ai">lenise@signalstructure.ai</a>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 32px;
          max-width: 480px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .modal-close {
          position: absolute;
          top: 12px;
          right: 16px;
          background: none;
          border: none;
          font-size: 28px;
          color: var(--muted);
          cursor: pointer;
          line-height: 1;
          padding: 4px 8px;
        }
        .modal-close:hover {
          color: var(--ink);
        }
        .text-link {
          background: none;
          border: none;
          color: var(--accent);
          cursor: pointer;
          font-size: inherit;
          padding: 0;
          text-decoration: underline;
        }
        .text-link:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
