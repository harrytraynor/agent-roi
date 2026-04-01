import { useState, useMemo, useCallback } from "react";

const fmt = (n) => {
  if (Math.abs(n) >= 1e6) return `£${(n / 1e6).toFixed(2)}m`;
  if (Math.abs(n) >= 1e3) return `£${(n / 1e3).toFixed(1)}k`;
  return `£${Math.round(n)}`;
};
const num = (v) => v.toLocaleString("en-GB");

export default function App() {
  const [pop, setPop] = useState(5000);
  const [coverage, setCoverage] = useState(50);
  const [useCases, setUseCases] = useState(60);
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
  const [tab, setTab] = useState("inputs");

  const c = useMemo(() => {
    const users = Math.round(pop * (coverage / 100));
    const rate = salary / hrsYr;
    const tot = t1p + t2p + t3p;
    const n1 = tot > 0 ? t1p / tot : 0.33, n2 = tot > 0 ? t2p / tot : 0.33, n3 = tot > 0 ? t3p / tot : 0.34;
    const blend = n1 * t1m + n2 * t2m + n3 * t3m;
    const hrsU = (blend * days) / 60;
    const valU = hrsU * rate;
    const total = valU * users;
    const sc = (m) => ({ mins: m, hrs: (m * days) / 60, val: ((m * days) / 60) * rate * users });
    return {
      users, rate, blend, hrsU, valU, total, tot, n1, n2, n3,
      t1c: Math.round(useCases * n1), t2c: Math.round(useCases * n2),
      t3c: useCases - Math.round(useCases * n1) - Math.round(useCases * n2),
      sc: { low: sc(sL), mid: sc(sM), high: sc(sH) },
    };
  }, [pop, coverage, useCases, days, salary, hrsYr, t1p, t2p, t3p, t1m, t2m, t3m, sL, sM, sH]);

  const reset = useCallback(() => {
    setPop(5000); setCoverage(50); setUseCases(60); setDays(220); setSalary(45000); setHrsYr(1856);
    setT1p(40); setT2p(40); setT3p(20); setT1m(12); setT2m(25); setT3m(45);
    setSL(15); setSM(20); setSH(30);
  }, []);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(
      `Across ~${useCases} agent use cases impacting ${num(c.users)} users, we model ~${Math.round(c.blend)} mins/day saved. At £${c.rate.toFixed(2)}/hr this equals ${fmt(c.total)}/yr of capacity released.`
    );
  }, [useCases, c]);

  const maxSc = Math.max(c.sc.low.val, c.sc.mid.val, c.sc.high.val);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 text-sm">

      {/* ── TOP BAR ── */}
      <header className="border-b border-gray-200 px-6 h-11 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-sm tracking-tight">CPS</span>
          <nav className="flex items-center gap-4 text-xs text-gray-500">
            <button onClick={() => setTab("inputs")}
              className={`hover:text-gray-900 ${tab === "inputs" ? "text-gray-900 font-medium" : ""}`}>
              Inputs
            </button>
            <button onClick={() => setTab("tiers")}
              className={`hover:text-gray-900 ${tab === "tiers" ? "text-gray-900 font-medium" : ""}`}>
              Tiers
            </button>
            <button onClick={() => setTab("scenarios")}
              className={`hover:text-gray-900 ${tab === "scenarios" ? "text-gray-900 font-medium" : ""}`}>
              Scenarios
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={copy} className="text-xs text-gray-500 hover:text-gray-900">Copy Summary</button>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500">Reset</button>
        </div>
      </header>

      <div className="flex">

        {/* ── LEFT SIDEBAR: results ── */}
        <aside className="w-52 min-w-52 border-r border-gray-200 p-5 space-y-5">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Annual Value</div>
            <div className="text-2xl font-bold font-mono tracking-tight text-gray-900">{fmt(c.total)}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">per year at full deployment</div>
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-3">
            {[
              ["Blended saving", `${c.blend.toFixed(1)} m/day`],
              ["Hours / user / yr", c.hrsU.toFixed(1)],
              ["Value / user", fmt(c.valU)],
              ["Impacted users", num(c.users)],
              ["Hourly rate", `£${c.rate.toFixed(2)}`],
              ["Daily rate", `£${(c.rate * 7.5).toFixed(0)}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-xs text-gray-400">{l}</span>
                <span className="text-xs font-medium font-mono text-gray-700">{v}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">Scenarios</div>
            {[
              ["Conservative", c.sc.low.val],
              ["Base case", c.sc.mid.val],
              ["Optimistic", c.sc.high.val],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-xs text-gray-400">{l}</span>
                <span className="text-xs font-medium font-mono text-gray-700">{fmt(v)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">Agent Split</div>
            {[
              ["T1 · Assistive", c.t1c],
              ["T2 · Process", c.t2c],
              ["T3 · Agentic", c.t3c],
              ["Total", useCases],
            ].map(([l, v], i, arr) => (
              <div key={l} className={`flex justify-between ${i === arr.length - 1 ? "pt-1 border-t border-gray-100 font-medium" : ""}`}>
                <span className={`text-xs ${i === arr.length - 1 ? "text-gray-700" : "text-gray-400"}`}>{l}</span>
                <span className="text-xs font-medium font-mono text-gray-700">{v}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 p-6">

          {/* Tab header */}
          <div className="mb-6">
            <div className="flex gap-4 border-b border-gray-200">
              {[["inputs", "Model Inputs"], ["tiers", "Impact Tiers"], ["scenarios", "Scenarios"]].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`pb-2 text-sm border-b-2 -mb-px ${tab === k ? "border-gray-900 text-gray-900 font-medium" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* ── INPUTS TAB ── */}
          {tab === "inputs" && (
            <div className="max-w-xl space-y-5">
              <h2 className="text-base font-semibold">Model Inputs</h2>
              <p className="text-xs text-gray-400 -mt-3">Configure workforce and cost assumptions. Results update live in the sidebar.</p>

              <div className="space-y-4">
                <InputRow label="Target population" value={pop} onChange={setPop} min={10} max={100000} step={100} suffix="staff" />
                <SliderRow label="Coverage %" value={coverage} onChange={setCoverage} min={10} max={100}
                  note={`= ${num(Math.round(pop * coverage / 100))} impacted users`} />
                <InputRow label="Agent use cases" value={useCases} onChange={setUseCases} min={1} max={500} />
                <SliderRow label="Working days / year" value={days} onChange={setDays} min={180} max={260} />
                <InputRow label="Avg fully-loaded salary" value={salary} onChange={setSalary} min={15000} max={200000} step={1000} prefix="£" />
                <InputRow label="Working hours / year" value={hrsYr} onChange={setHrsYr} min={1000} max={2400} step={10} suffix="hrs" />
              </div>

              {/* Audit */}
              <div className="border-t border-gray-100 pt-5 mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Calculation Audit</h3>
                <div className="font-mono text-xs text-gray-400 leading-6 bg-gray-50 rounded-md border border-gray-100 px-4 py-3">
                  <div>Blend: ({(c.n1*100).toFixed(0)}%×{t1m}m)+({(c.n2*100).toFixed(0)}%×{t2m}m)+({(c.n3*100).toFixed(0)}%×{t3m}m) = <span className="text-gray-700">{c.blend.toFixed(1)}m</span></div>
                  <div>Annual: {c.blend.toFixed(1)}m × {days}d ÷ 60 = <span className="text-gray-700">{c.hrsU.toFixed(1)} hrs</span></div>
                  <div>Rate: £{num(salary)} ÷ {num(hrsYr)}h = <span className="text-gray-700">£{c.rate.toFixed(2)}/hr</span></div>
                  <div>Per user: {c.hrsU.toFixed(1)}h × £{c.rate.toFixed(2)} = <span className="text-gray-700">{fmt(c.valU)}</span></div>
                  <div>Total: {num(c.users)} × {fmt(c.valU)} = <span className="text-gray-900 font-semibold">{fmt(c.total)}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ── TIERS TAB ── */}
          {tab === "tiers" && (
            <div className="max-w-xl space-y-5">
              <h2 className="text-base font-semibold">Impact Tiers</h2>
              <p className="text-xs text-gray-400 -mt-3">Classify use cases by complexity and expected time saving per user.</p>

              {c.tot !== 100 && (
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  Tier shares sum to {c.tot}% — they will be normalised.
                </div>
              )}

              <div className="space-y-4">
                <TierBlock label="Tier 1 · Assistive" desc="Drafting, summaries, research prep"
                  pct={t1p} onPctChange={setT1p} mins={t1m} onMinsChange={setT1m} count={c.t1c} />
                <TierBlock label="Tier 2 · Process" desc="CRM updates, proposals, pipeline hygiene"
                  pct={t2p} onPctChange={setT2p} mins={t2m} onMinsChange={setT2m} count={c.t2c} />
                <TierBlock label="Tier 3 · Agentic" desc="Lead qual, campaign orchestration, insights"
                  pct={t3p} onPctChange={setT3p} mins={t3m} onMinsChange={setT3m} count={c.t3c} />
              </div>
            </div>
          )}

          {/* ── SCENARIOS TAB ── */}
          {tab === "scenarios" && (
            <div className="max-w-xl space-y-5">
              <h2 className="text-base font-semibold">Scenario Analysis</h2>
              <p className="text-xs text-gray-400 -mt-3">Override the blended minutes-per-day with low / mid / high assumptions.</p>

              <div className="grid grid-cols-3 gap-4">
                <ScenarioInput label="Conservative" value={sL} onChange={setSL} />
                <ScenarioInput label="Base case" value={sM} onChange={setSM} />
                <ScenarioInput label="Optimistic" value={sH} onChange={setSH} />
              </div>

              <div className="space-y-3 pt-2">
                {[
                  ["Conservative", c.sc.low, "bg-gray-100"],
                  ["Base case", c.sc.mid, "bg-green-50"],
                  ["Optimistic", c.sc.high, "bg-green-100"],
                ].map(([label, sc, bg]) => {
                  const w = maxSc > 0 ? (sc.val / maxSc) * 100 : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-xs font-semibold font-mono text-gray-900">{fmt(sc.val)}</span>
                      </div>
                      <div className="h-6 bg-gray-50 rounded border border-gray-100 overflow-hidden relative">
                        <div className={`h-full rounded ${bg} transition-all duration-500`} style={{ width: `${Math.max(w, 2)}%` }} />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400">
                          {num(Math.round(sc.hrs))} hrs saved
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Business case */}
              <div className="border-t border-gray-100 pt-5 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Case Statement</h3>
                  <button onClick={copy} className="text-[11px] text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5 hover:bg-green-100">
                    Copy
                  </button>
                </div>
                <blockquote className="border-l-2 border-gray-200 pl-4 text-xs text-gray-500 leading-6 italic">
                  Across ~<strong className="text-gray-900 not-italic">{useCases} use cases</strong> impacting{" "}
                  <strong className="text-gray-900 not-italic">{num(c.users)} users</strong>, saving{" "}
                  <strong className="text-gray-900 not-italic">~{Math.round(c.blend)} m/day</strong> at{" "}
                  <strong className="text-gray-900 not-italic">£{c.rate.toFixed(2)}/hr</strong> ={" "}
                  <strong className="text-gray-900 not-italic">{fmt(c.total)}/yr</strong> capacity released.
                </blockquote>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

/* ── Simple inline components ── */

function InputRow({ label, value, onChange, min, max, step = 1, suffix, prefix }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">{prefix}</span>}
          <input type="number" value={value} min={min} max={max} step={step}
            onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v)) onChange(v); }}
            className={`w-36 border border-gray-200 rounded-md bg-white text-sm font-mono py-1.5 outline-none focus:border-gray-400 ${prefix ? "pl-6" : "pl-2.5"} ${suffix ? "pr-12" : "pr-2.5"}`}
          />
          {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">{suffix}</span>}
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1 rounded-full accent-gray-400" />
      </div>
    </div>
  );
}

function SliderRow({ label, value, onChange, min, max, step = 1, note }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs text-gray-500">{label}</label>
        <span className="text-xs font-mono text-gray-700 font-medium">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full accent-gray-400" />
      {note && <div className="text-[11px] text-gray-400 mt-1">{note}</div>}
    </div>
  );
}

function TierBlock({ label, desc, pct, onPctChange, mins, onMinsChange, count }) {
  return (
    <div className="border border-gray-100 rounded-md p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          <div className="text-[11px] text-gray-400">{desc}</div>
        </div>
        <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{count} agents</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-gray-400">Share of agents</span>
            <span className="text-xs font-mono font-medium text-gray-700">{pct}%</span>
          </div>
          <input type="range" min={0} max={100} step={5} value={pct}
            onChange={(e) => onPctChange(Number(e.target.value))}
            className="w-full h-1 rounded-full accent-gray-400" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-gray-400">Time saved</span>
            <span className="text-xs font-mono font-medium text-gray-700">{mins} m/day</span>
          </div>
          <input type="range" min={5} max={90} step={5} value={mins}
            onChange={(e) => onMinsChange(Number(e.target.value))}
            className="w-full h-1 rounded-full accent-gray-400" />
        </div>
      </div>
    </div>
  );
}

function ScenarioInput({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="relative">
        <input type="number" value={value} min={1} max={120}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full border border-gray-200 rounded-md bg-white text-sm font-mono py-1.5 pl-2.5 pr-10 outline-none focus:border-gray-400"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">m/day</span>
      </div>
    </div>
  );
}
