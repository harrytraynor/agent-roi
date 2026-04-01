import { useState, useMemo, useRef, useEffect } from "react";

/* ══════════════════════════════════════════════
   BRAND TOKENS
   ══════════════════════════════════════════════ */
const brand = {
  navy: "#1B2D5B",
  navyDeep: "#0F1D3D",
  navyLight: "#2A4178",
  lavender: "#C8D0E8",
  lavenderLight: "#E8ECF6",
  lavenderPale: "#F2F4FA",
  white: "#FFFFFF",
  offWhite: "#F7F8FC",
  accent: "#4A6CF7",
  accentLight: "#7B93FA",
  teal: "#0D9488",
  amber: "#D97706",
  emerald: "#059669",
  textPrimary: "#1B2D5B",
  textSecondary: "#5C6A8A",
  textTertiary: "#8E99B4",
  border: "#E2E6F0",
  borderLight: "#EEF0F7",
};

const fmt = (n) => {
  if (n >= 1e6) return `£${(n / 1e6).toFixed(2)}m`;
  if (n >= 1e3) return `£${(n / 1e3).toFixed(1)}k`;
  return `£${Math.round(n)}`;
};
const fmtNum = (n) => n.toLocaleString("en-GB");

/* ══════════════════════════════════════════════
   DONUT CHART (SVG)
   ══════════════════════════════════════════════ */
function DonutChart({ segments, size = 200, strokeWidth = 28, centerLabel, centerValue }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let accumulated = 0;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}
      role="img" aria-label={`Chart showing ${segments.map(s => `${s.label}: ${((s.value / total) * 100).toFixed(0)}%`).join(", ")}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}>
        {/* background ring */}
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={brand.lavenderPale} strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const dashLen = pct * circumference;
          const dashOff = accumulated * circumference;
          accumulated += pct;
          return (
            <circle key={i} cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke={seg.color} strokeWidth={strokeWidth}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={-dashOff}
              strokeLinecap="butt"
              style={{ transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }} />
          );
        })}
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 11, color: brand.textTertiary, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {centerLabel}
        </span>
        <span style={{ fontSize: 22, fontWeight: 700, color: brand.navy, fontFamily: "var(--font-mono)" }}>
          {centerValue}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SLIDER COMPONENT (Accessible)
   ══════════════════════════════════════════════ */
function Slider({ label, id, value, onChange, min, max, step = 1, displayValue, note }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <label htmlFor={id} style={{ fontSize: 14, fontWeight: 500, color: brand.textPrimary }}>
          {label}
        </label>
        <output htmlFor={id} style={{
          fontSize: 15, fontWeight: 600, color: brand.navy, fontFamily: "var(--font-mono)",
          background: brand.lavenderPale, padding: "3px 10px", borderRadius: 6,
        }}>
          {displayValue || fmtNum(value)}
        </output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
        style={{
          width: "100%", height: 6, appearance: "none", borderRadius: 3, cursor: "pointer", outline: "none",
          background: `linear-gradient(to right, ${brand.navy} ${pct}%, ${brand.lavender} ${pct}%)`,
        }} />
      {note && <p style={{ fontSize: 12, color: brand.textTertiary, marginTop: 6, lineHeight: 1.5 }}>{note}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SUMMARY ROW
   ══════════════════════════════════════════════ */
function SummaryRow({ label, value, bold, color }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0",
      borderBottom: bold ? "none" : `1px solid ${brand.borderLight}`,
    }}>
      <span style={{ fontSize: 13, color: bold ? brand.navy : brand.textSecondary, fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{
        fontSize: bold ? 18 : 14, fontWeight: bold ? 700 : 600,
        color: color || (bold ? brand.navy : brand.textPrimary),
        fontFamily: "var(--font-mono)",
      }}>{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   TIER CARD (compact)
   ══════════════════════════════════════════════ */
function TierCard({ name, subtitle, color, pct, onPctChange, mins, onMinsChange }) {
  const pctPos = (pct / 100) * 100;
  const minsPos = ((mins - 5) / 85) * 100;
  return (
    <div style={{
      padding: 16, borderRadius: 12, border: `1px solid ${brand.border}`,
      background: brand.white, marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: brand.textPrimary }}>{name}</div>
          <div style={{ fontSize: 11, color: brand.textTertiary }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: brand.textTertiary, display: "block", marginBottom: 6 }}>
            Share: <strong style={{ color: brand.textPrimary }}>{pct}%</strong>
          </label>
          <input type="range" min={0} max={100} step={5} value={pct}
            onChange={(e) => onPctChange(Number(e.target.value))}
            aria-label={`${name} share of agents`}
            style={{
              width: "100%", height: 5, appearance: "none", borderRadius: 3, cursor: "pointer",
              background: `linear-gradient(to right, ${color} ${pctPos}%, ${brand.lavender} ${pctPos}%)`,
            }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: brand.textTertiary, display: "block", marginBottom: 6 }}>
            Saving: <strong style={{ color: brand.textPrimary }}>{mins}m/day</strong>
          </label>
          <input type="range" min={5} max={90} step={5} value={mins}
            onChange={(e) => onMinsChange(Number(e.target.value))}
            aria-label={`${name} minutes saved per day`}
            style={{
              width: "100%", height: 5, appearance: "none", borderRadius: 3, cursor: "pointer",
              background: `linear-gradient(to right, ${color} ${minsPos}%, ${brand.lavender} ${minsPos}%)`,
            }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   NAV TAB
   ══════════════════════════════════════════════ */
function NavTab({ label, active, onClick, id }) {
  return (
    <button role="tab" id={`tab-${id}`} aria-selected={active} aria-controls={`panel-${id}`}
      onClick={onClick}
      style={{
        padding: "10px 0", fontSize: 13, fontWeight: active ? 600 : 400, border: "none", background: "none",
        color: active ? brand.navy : brand.textTertiary, cursor: "pointer",
        borderBottom: `2.5px solid ${active ? brand.navy : "transparent"}`,
        transition: "all 0.2s", flex: 1, textAlign: "center",
      }}>
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════
   SCENARIO INPUT
   ══════════════════════════════════════════════ */
function ScenarioInput({ label, value, onChange, color }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: 11, color: brand.textTertiary, display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`${label} minutes per day`}
          style={{
            width: "100%", padding: "10px 40px 10px 12px", fontSize: 15, fontWeight: 600,
            fontFamily: "var(--font-mono)", color, border: `1.5px solid ${brand.border}`,
            borderRadius: 10, background: brand.offWhite, outline: "none", boxSizing: "border-box",
          }}
          onFocus={(e) => e.target.style.borderColor = brand.navy}
          onBlur={(e) => e.target.style.borderColor = brand.border}
        />
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: brand.textTertiary }}>m/d</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCENARIO BAR
   ══════════════════════════════════════════════ */
function ScenarioBar({ label, value, maxVal, detail, color, bg }) {
  const w = maxVal > 0 ? (value / maxVal) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{fmt(value)}</span>
      </div>
      <div style={{ height: 36, background: brand.lavenderPale, borderRadius: 8, overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", width: `${w}%`, background: bg, borderRadius: 8, transition: "width 0.5s ease" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: 12, fontSize: 11, fontFamily: "var(--font-mono)", color: brand.textTertiary }}>
          {detail}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ██   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
export default function AgentROIModeller() {
  const [useCases, setUseCases] = useState(60);
  const [pop, setPop] = useState(5000);
  const [coverage, setCoverage] = useState(50);
  const [days, setDays] = useState(220);
  const [salary, setSalary] = useState(45000);
  const [hrsYr, setHrsYr] = useState(1856);
  const [t1p, setT1p] = useState(40);
  const [t2p, setT2p] = useState(40);
  const [t3p, setT3p] = useState(20);
  const [t1m, setT1m] = useState(12);
  const [t2m, setT2m] = useState(25);
  const [t3m, setT3m] = useState(45);
  const [sL, setSL] = useState(15);
  const [sM, setSM] = useState(20);
  const [sH, setSH] = useState(30);
  const [tab, setTab] = useState("model");

  const calc = useMemo(() => {
    const users = Math.round(pop * (coverage / 100));
    const rate = salary / hrsYr;
    const tot = t1p + t2p + t3p;
    const n1 = tot > 0 ? t1p / tot : 0.33, n2 = tot > 0 ? t2p / tot : 0.33, n3 = tot > 0 ? t3p / tot : 0.34;
    const blend = n1 * t1m + n2 * t2m + n3 * t3m;
    const hrsU = (blend * days) / 60;
    const valU = hrsU * rate;
    const total = valU * users;
    const sc = (m) => { const h = (m * days) / 60; return { mins: m, hrs: h, users, val: h * rate * users }; };
    return {
      users, rate, blend, hrsU, valU, total, tot, n1, n2, n3,
      t1c: Math.round(useCases * n1), t2c: Math.round(useCases * n2), t3c: useCases - Math.round(useCases * n1) - Math.round(useCases * n2),
      sc: { low: sc(sL), mid: sc(sM), high: sc(sH) },
    };
  }, [useCases, pop, coverage, days, salary, hrsYr, t1p, t2p, t3p, t1m, t2m, t3m, sL, sM, sH]);

  const doReset = () => {
    setUseCases(60); setPop(5000); setCoverage(50); setDays(220); setSalary(45000); setHrsYr(1856);
    setT1p(40); setT2p(40); setT3p(20); setT1m(12); setT2m(25); setT3m(45);
    setSL(15); setSM(20); setSH(30);
  };

  const tierColors = { t1: brand.navy, t2: brand.accent, t3: brand.navyLight };
  const maxScenario = Math.max(calc.sc.low.val, calc.sc.mid.val, calc.sc.high.val);

  return (
    <div style={{
      fontFamily: "var(--font-body)", minHeight: "100vh",
      background: brand.offWhite, color: brand.textPrimary,
      ["--font-body"]: "'Outfit', 'Avenir Next', -apple-system, sans-serif",
      ["--font-mono"]: "'IBM Plex Mono', 'Menlo', monospace",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <header style={{
        background: brand.navy, color: brand.white, padding: "28px 24px 24px",
        borderRadius: "0 0 24px 24px",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            {/* Brand mark */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.12)" />
              <path d="M16 6L22 10V14L16 18L10 14V10L16 6Z" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M16 18L22 22V26L16 30L10 26V22L16 18Z" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
            </svg>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Agent ROI Modeller</h1>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.6, letterSpacing: "0.04em" }}>CPS — Going Beyond Technology</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO RESULT ── */}
      <div style={{ maxWidth: 960, margin: "-1px auto 0", padding: "0 16px" }}>
        <div style={{
          background: brand.white, borderRadius: 20, padding: "28px 24px",
          boxShadow: "0 4px 24px rgba(27,45,91,0.08)", border: `1px solid ${brand.borderLight}`,
          marginTop: -12, position: "relative", zIndex: 2,
        }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 12, color: brand.textTertiary, margin: "0 0 8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Annual Productivity Value Released
            </p>
            <div aria-live="polite" style={{
              fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1,
              fontFamily: "var(--font-mono)", color: brand.navy,
            }}>
              {fmt(calc.total)}
            </div>
            <p style={{ fontSize: 12, color: brand.textTertiary, margin: "8px 0 0" }}>per year at full deployment</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 24 }}>
            {[
              { label: "Blended saving", val: `${calc.blend.toFixed(1)}m/day` },
              { label: "Hours / user / yr", val: `${calc.hrsU.toFixed(1)} hrs` },
              { label: "Value / user", val: fmt(calc.valU) },
              { label: "Impacted users", val: fmtNum(calc.users) },
            ].map((m) => (
              <div key={m.label} style={{
                background: brand.lavenderPale, borderRadius: 12, padding: "12px 14px", textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: brand.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: brand.navy, fontFamily: "var(--font-mono)" }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px" }}>
        <nav role="tablist" aria-label="Calculator sections" style={{
          display: "flex", gap: 0, borderBottom: `1px solid ${brand.border}`,
          marginTop: 24, marginBottom: 0,
        }}>
          {[
            { id: "model", label: "Model Inputs" },
            { id: "tiers", label: "Use Case Tiers" },
            { id: "scenarios", label: "Scenarios" },
            { id: "summary", label: "Summary" },
          ].map((t) => (
            <NavTab key={t.id} id={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />
          ))}
        </nav>
      </div>

      {/* ── TAB PANELS ── */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 48px" }}>

        {/* ─── MODEL INPUTS ─── */}
        {tab === "model" && (
          <div role="tabpanel" id="panel-model" aria-labelledby="tab-model"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            
            {/* Left: Workforce */}
            <section style={{
              background: brand.white, borderRadius: 16, padding: 24,
              border: `1px solid ${brand.borderLight}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: brand.navy, margin: "0 0 20px" }}>Workforce & Coverage</h2>
              <Slider id="use-cases" label="Total agent use cases" value={useCases} onChange={setUseCases} min={1} max={200} />
              <Slider id="population" label="Target population" value={pop} onChange={setPop} min={100} max={20000} step={100}
                displayValue={`${fmtNum(pop)} staff`} />
              <Slider id="coverage" label="Unique user coverage" value={coverage} onChange={setCoverage} min={10} max={100}
                displayValue={`${coverage}%`}
                note={`= ${fmtNum(Math.round(pop * coverage / 100))} unique impacted users — avoids double-counting across agents`} />
              <Slider id="working-days" label="Working days per year" value={days} onChange={setDays} min={180} max={260} />
            </section>

            {/* Right: Valuation */}
            <section style={{
              background: brand.white, borderRadius: 16, padding: 24,
              border: `1px solid ${brand.borderLight}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: brand.navy, margin: "0 0 20px" }}>Productivity Valuation</h2>
              <Slider id="salary" label="Average fully-loaded salary" value={salary} onChange={setSalary} min={20000} max={120000} step={1000}
                displayValue={`£${fmtNum(salary)}`} />
              <Slider id="hrs-year" label="Working hours per year" value={hrsYr} onChange={setHrsYr} min={1200} max={2200} step={10}
                displayValue={`${fmtNum(hrsYr)} hrs`} />

              <div style={{
                background: brand.lavenderPale, borderRadius: 14, padding: 20, marginTop: 8,
              }}>
                <div style={{ fontSize: 11, color: brand.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Derived rates</div>
                <SummaryRow label="Hourly rate" value={`£${calc.rate.toFixed(2)}`} />
                <SummaryRow label="Daily rate (7.5h)" value={`£${(calc.rate * 7.5).toFixed(0)}`} />
                <SummaryRow label="Per-user annual value" value={fmt(calc.valU)} bold color={brand.navy} />
              </div>
            </section>
          </div>
        )}

        {/* ─── USE CASE TIERS ─── */}
        {tab === "tiers" && (
          <div role="tabpanel" id="panel-tiers" aria-labelledby="tab-tiers"
            style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>

            <section style={{
              background: brand.white, borderRadius: 16, padding: 24,
              border: `1px solid ${brand.borderLight}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: brand.navy, margin: "0 0 6px" }}>Classify Use Cases by Impact</h2>
              <p style={{ fontSize: 12, color: brand.textTertiary, margin: "0 0 20px" }}>
                Adjust each tier's share of total agents and average daily time saving
              </p>
              {calc.tot !== 100 && (
                <div role="alert" style={{
                  background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10,
                  padding: "10px 14px", marginBottom: 16, fontSize: 12, color: brand.amber,
                }}>
                  Tier percentages sum to {calc.tot}% — they will be normalised for calculation
                </div>
              )}
              <TierCard name="Tier 1 · Assistive" subtitle="Drafting, summaries, research prep"
                color={tierColors.t1} pct={t1p} onPctChange={setT1p} mins={t1m} onMinsChange={setT1m} />
              <TierCard name="Tier 2 · Process" subtitle="CRM updates, proposals, pipeline hygiene"
                color={tierColors.t2} pct={t2p} onPctChange={setT2p} mins={t2m} onMinsChange={setT2m} />
              <TierCard name="Tier 3 · Agentic" subtitle="Lead qual, campaign orchestration, insights"
                color={tierColors.t3} pct={t3p} onPctChange={setT3p} mins={t3m} onMinsChange={setT3m} />
            </section>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Donut */}
              <div style={{
                background: brand.white, borderRadius: 16, padding: 24,
                border: `1px solid ${brand.borderLight}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              }}>
                <DonutChart
                  size={180} strokeWidth={26}
                  centerLabel="Blended"
                  centerValue={`${calc.blend.toFixed(0)}m`}
                  segments={[
                    { label: "Tier 1", value: calc.t1c * t1m, color: tierColors.t1 },
                    { label: "Tier 2", value: calc.t2c * t2m, color: tierColors.t2 },
                    { label: "Tier 3", value: calc.t3c * t3m, color: tierColors.t3 },
                  ]}
                />
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
                  {[
                    { label: `T1 · ${calc.t1c}`, color: tierColors.t1 },
                    { label: `T2 · ${calc.t2c}`, color: tierColors.t2 },
                    { label: `T3 · ${calc.t3c}`, color: tierColors.t3 },
                  ].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                      <span style={{ fontSize: 12, color: brand.textSecondary }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent counts */}
              <div style={{
                background: brand.lavenderPale, borderRadius: 14, padding: 16,
              }}>
                <SummaryRow label="Tier 1 agents" value={calc.t1c} />
                <SummaryRow label="Tier 2 agents" value={calc.t2c} />
                <SummaryRow label="Tier 3 agents" value={calc.t3c} />
                <SummaryRow label="Total agents" value={useCases} bold />
              </div>
            </div>
          </div>
        )}

        {/* ─── SCENARIOS ─── */}
        {tab === "scenarios" && (
          <div role="tabpanel" id="panel-scenarios" aria-labelledby="tab-scenarios">
            <div style={{
              background: brand.white, borderRadius: 16, padding: 24,
              border: `1px solid ${brand.borderLight}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: brand.navy, margin: "0 0 6px" }}>Scenario Analysis</h2>
              <p style={{ fontSize: 12, color: brand.textTertiary, margin: "0 0 20px" }}>
                Override the blended minutes-per-day with low / mid / high assumptions
              </p>

              <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
                <ScenarioInput label="Conservative" value={sL} onChange={setSL} color={brand.amber} />
                <ScenarioInput label="Base case" value={sM} onChange={setSM} color={brand.navy} />
                <ScenarioInput label="Optimistic" value={sH} onChange={setSH} color={brand.emerald} />
              </div>

              <ScenarioBar label="Conservative" value={calc.sc.low.val} maxVal={maxScenario}
                detail={`${fmtNum(Math.round(calc.sc.low.hrs))} hrs · ${fmtNum(calc.users)} users`}
                color={brand.amber} bg="rgba(217,119,6,0.15)" />
              <ScenarioBar label="Base case" value={calc.sc.mid.val} maxVal={maxScenario}
                detail={`${fmtNum(Math.round(calc.sc.mid.hrs))} hrs · ${fmtNum(calc.users)} users`}
                color={brand.navy} bg="rgba(27,45,91,0.12)" />
              <ScenarioBar label="Optimistic" value={calc.sc.high.val} maxVal={maxScenario}
                detail={`${fmtNum(Math.round(calc.sc.high.hrs))} hrs · ${fmtNum(calc.users)} users`}
                color={brand.emerald} bg="rgba(5,150,105,0.15)" />

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 24,
              }}>
                {[
                  { label: "Conservative", val: fmt(calc.sc.low.val), color: brand.amber, bg: "#FFF7ED" },
                  { label: "Base case", val: fmt(calc.sc.mid.val), color: brand.navy, bg: brand.lavenderPale },
                  { label: "Optimistic", val: fmt(calc.sc.high.val), color: brand.emerald, bg: "#ECFDF5" },
                ].map((s) => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: brand.textTertiary, marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: brand.textTertiary }}>per year</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── SUMMARY ─── */}
        {tab === "summary" && (
          <div role="tabpanel" id="panel-summary" aria-labelledby="tab-summary"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Statement */}
            <section style={{
              background: brand.white, borderRadius: 16, padding: 24,
              border: `1px solid ${brand.borderLight}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: brand.navy, margin: "0 0 16px" }}>Business Case Statement</h2>
              <blockquote style={{
                margin: 0, padding: "16px 20px", background: brand.lavenderPale,
                borderLeft: `3px solid ${brand.navy}`, borderRadius: "0 12px 12px 0",
                fontSize: 13, lineHeight: 1.8, color: brand.textSecondary, fontStyle: "italic",
              }}>
                "The agentic Copilot business case is based on conservative assumptions around time released from repetitive processes. Across approximately{" "}
                <strong style={{ color: brand.navy, fontStyle: "normal" }}>{useCases} use cases</strong>, impacting{" "}
                <strong style={{ color: brand.navy, fontStyle: "normal" }}>{fmtNum(calc.users)} users</strong>, we model an average saving of{" "}
                <strong style={{ color: brand.navy, fontStyle: "normal" }}>~{Math.round(calc.blend)} minutes/day</strong>. At{" "}
                <strong style={{ color: brand.navy, fontStyle: "normal" }}>£{calc.rate.toFixed(2)}/hr</strong>, this equates to{" "}
                <strong style={{ color: brand.navy, fontStyle: "normal" }}>{fmt(calc.total)}</strong> of annual capacity released."
              </blockquote>
              <p style={{ fontSize: 11, color: brand.textTertiary, marginTop: 12, lineHeight: 1.6 }}>
                This figure represents productive capacity released, not headcount reduction. Secondary upside from revenue acceleration, improved win rates, and reduced cycle times is excluded from the core model.
              </p>
            </section>

            {/* Audit */}
            <section style={{
              background: brand.white, borderRadius: 16, padding: 24,
              border: `1px solid ${brand.borderLight}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: brand.navy, margin: "0 0 16px" }}>Calculation Audit Trail</h2>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 2.2,
                color: brand.textSecondary, background: brand.lavenderPale,
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div><span style={{ color: brand.textTertiary }}>Blend:</span> ({(calc.n1 * 100).toFixed(0)}%×{t1m}m)+({(calc.n2 * 100).toFixed(0)}%×{t2m}m)+({(calc.n3 * 100).toFixed(0)}%×{t3m}m) = <strong style={{ color: brand.navy }}>{calc.blend.toFixed(1)}m</strong></div>
                <div><span style={{ color: brand.textTertiary }}>Annual:</span> {calc.blend.toFixed(1)}m × {days}d ÷ 60 = <strong style={{ color: brand.navy }}>{calc.hrsU.toFixed(1)} hrs</strong></div>
                <div><span style={{ color: brand.textTertiary }}>Rate:</span> £{fmtNum(salary)} ÷ {fmtNum(hrsYr)}h = <strong style={{ color: brand.navy }}>£{calc.rate.toFixed(2)}/hr</strong></div>
                <div><span style={{ color: brand.textTertiary }}>Per user:</span> {calc.hrsU.toFixed(1)}h × £{calc.rate.toFixed(2)} = <strong style={{ color: brand.navy }}>{fmt(calc.valU)}</strong></div>
                <div><span style={{ color: brand.textTertiary }}>Total:</span> {fmtNum(calc.users)} × {fmt(calc.valU)} = <strong style={{ color: brand.navy, fontSize: 13 }}>{fmt(calc.total)}</strong></div>
              </div>

              <button onClick={doReset}
                aria-label="Reset all inputs to defaults"
                style={{
                  marginTop: 20, width: "100%", padding: "12px 0", borderRadius: 12,
                  background: brand.navy, color: brand.white, border: "none", fontSize: 13,
                  fontWeight: 600, letterSpacing: "0.04em", cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.opacity = "0.85"}
                onMouseLeave={(e) => e.target.style.opacity = "1"}
              >
                Reset All Inputs
              </button>
            </section>
          </div>
        )}
      </main>

      {/* ── RESPONSIVE + SLIDER STYLES ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        input[type=range] { outline: none; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: ${brand.white}; border: 3px solid ${brand.navy};
          cursor: pointer; box-shadow: 0 2px 6px rgba(27,45,91,0.18);
          transition: box-shadow 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          box-shadow: 0 2px 12px rgba(27,45,91,0.3);
        }
        input[type=range]:focus-visible::-webkit-slider-thumb {
          outline: 3px solid ${brand.accentLight};
          outline-offset: 2px;
        }
        input[type=range]::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: ${brand.white}; border: 3px solid ${brand.navy};
          cursor: pointer;
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 0.2; }

        /* Focus visible for all interactive elements */
        button:focus-visible, input:focus-visible {
          outline: 3px solid ${brand.accentLight};
          outline-offset: 2px;
        }

        /* Responsive: stack on mobile */
        @media (max-width: 720px) {
          [role="tabpanel"] > div,
          div[style*="gridTemplateColumns: \\"1fr 1fr\\""],
          div[style*="gridTemplateColumns: \\"1fr 320px\\""] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: \\"repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 520px) {
          div[style*="gridTemplateColumns: \\"repeat(4"] {
            grid-template-columns: 1fr !important;
          }
          nav[role="tablist"] {
            overflow-x: auto;
          }
          nav[role="tablist"] button {
            white-space: nowrap;
            font-size: 12px !important;
            padding: 10px 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
