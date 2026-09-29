import { useEffect, useRef, useState, type ReactNode } from "react";

// Scroll-driven BA toolkit: seven stations from elicitation to handover, each with the artefact it produces.

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = {
  verb: string; line: string; proof: string; file: string;
  techniques: string[]; tools: string[]; Art: (p: { t: number }) => ReactNode;
};

/* ---------- 01 Elicit: stickies from interviews cluster into an affinity map ---------- */
const notes = [
  { text: "Can't find my ticket", c: 0, from: [70, 250, -8] },
  { text: "Pay in naira or pounds", c: 0, from: [300, 60, 6] },
  { text: "Queue at the gate", c: 0, from: [470, 300, -4] },
  { text: "Stall fees unclear", c: 1, from: [120, 110, 7] },
  { text: "Need a power hookup", c: 1, from: [430, 150, -9] },
  { text: "Approval takes weeks", c: 1, from: [240, 320, 5] },
  { text: "Which shift am I on?", c: 2, from: [480, 60, -6] },
  { text: "No briefing pack", c: 2, from: [90, 330, 9] },
  { text: "Who do I report to?", c: 2, from: [300, 200, -5] },
];
const clusters = [{ name: "Attendees", x: 95, col: "#ffb38a" }, { name: "Vendors", x: 280, col: "#b7adff" }, { name: "Volunteers", x: 465, col: "#8ee6c4" }];

function Affinity({ t }: { t: number }) {
  const move = ease(seg(t, 0.15, 0.55));
  const head = seg(t, 0.5, 0.62);
  const banner = seg(t, 0.62, 0.74);
  const counts = [0, 0, 0];
  return (
    <svg viewBox="0 0 560 380" className="kit-svg" aria-hidden="true">
      {clusters.map((c) => (
        <g key={c.name} opacity={head}>
          <rect x={c.x - 82} y={20} width={164} height={236} rx={14} className="kit-zone" />
          <text x={c.x} y={46} textAnchor="middle" className="kit-label" fill={c.col}>{c.name}</text>
        </g>
      ))}
      {notes.map((n) => {
        const row = counts[n.c]++;
        const tx = clusters[n.c].x, ty = 88 + row * 58;
        const x = lerp(n.from[0], tx, move), y = lerp(n.from[1], ty, move), r = lerp(n.from[2], 0, move);
        const appear = seg(t, 0.0 + notes.indexOf(n) * 0.012, 0.1 + notes.indexOf(n) * 0.012);
        return (
          <g key={n.text} transform={`translate(${x} ${y}) rotate(${r})`} opacity={appear}>
            <rect x={-74} y={-21} width={148} height={42} rx={6} fill={move > 0.6 ? clusters[n.c].col : "#f3f1ec"} className="kit-note" />
            <text y={4} textAnchor="middle" className="kit-note-text">{n.text}</text>
          </g>
        );
      })}
      <g opacity={banner} transform={`translate(0 ${(1 - banner) * 10})`}>
        <rect x={130} y={290} width={300} height={52} rx={26} className="kit-banner" />
        <text x={280} y={322} textAnchor="middle" className="kit-banner-text">1 request → 3 journeys</text>
      </g>
    </svg>
  );
}

/* ---------- 02 Analyse: a fishbone draws itself and lands on the root cause ---------- */
const bones = [
  { x: 220, up: true, label: "People", causes: ["Retries on slow page", "No status shown"] },
  { x: 420, up: true, label: "Process", causes: ["Manual reconciliation"], at: [0.7] },
  { x: 220, up: false, label: "System", causes: ["Callback timing", "Webhook retries"], root: 0 },
  { x: 420, up: false, label: "Data", causes: ["No payment ref"], at: [0.7] },
];
const SLANT = 60;

function Fishbone({ t }: { t: number }) {
  const spine = seg(t, 0.02, 0.2);
  const root = seg(t, 0.58, 0.7);
  return (
    <svg viewBox="0 0 560 380" className="kit-svg" aria-hidden="true">
      <line x1={20} y1={190} x2={20 + 420 * spine} y2={190} className="kit-stroke" />
      <g opacity={seg(t, 0.12, 0.22)}>
        <rect x={440} y={160} width={110} height={60} rx={12} className="kit-fishhead" />
        <text x={495} y={186} textAnchor="middle" className="kit-small-strong">Duplicate</text>
        <text x={495} y={204} textAnchor="middle" className="kit-small-strong">charges</text>
      </g>
      {bones.map((b, i) => {
        const g = ease(seg(t, 0.18 + i * 0.07, 0.34 + i * 0.07));
        const dy = b.up ? -120 : 120;
        const ex = b.x - SLANT * g, ey = 190 + dy * g;
        return (
          <g key={b.label}>
            <line x1={b.x} y1={190} x2={ex} y2={ey} className="kit-stroke" />
            <text x={b.x - SLANT} y={b.up ? 56 : 334} textAnchor="middle" className="kit-label" opacity={g}>{b.label}</text>
            {b.causes.map((c, j) => {
              const f = b.at ? b.at[j] : 0.4 + j * 0.35, cx = b.x - SLANT * f, cy = 190 + dy * f;
              const on = seg(t, 0.36 + i * 0.05 + j * 0.03, 0.44 + i * 0.05 + j * 0.03);
              const isRoot = b.root === j;
              return (
                <g key={c} opacity={on}>
                  <line x1={cx} y1={cy} x2={cx - 40} y2={cy} className="kit-thin" />
                  {isRoot && <rect x={cx - 160} y={cy - 18} width={124} height={26} rx={13} className="kit-root" opacity={root} />}
                  <text x={cx - 46} y={cy} textAnchor="end" className={isRoot && root > 0.5 ? "kit-small-strong" : "kit-small"}>{c}</text>
                </g>
              );
            })}
          </g>
        );
      })}
      <g opacity={root}>
        <text x={40} y={372} className="kit-tag">ROOT CAUSE · 5 WHYS CONFIRMED</text>
      </g>
    </svg>
  );
}

/* ---------- 03 Data: a query types out and the per-currency chart grows ---------- */
const sql = ["SELECT currency,", "       SUM(amount) AS revenue", "FROM   orders", "WHERE  status = 'paid'", "GROUP  BY currency;"];
const bars = [{ k: "NGN", v: 0.92 }, { k: "GBP", v: 0.64 }, { k: "USD", v: 0.38 }, { k: "CAD", v: 0.22 }];

function DataStage({ t }: { t: number }) {
  const total = sql.join("").length;
  let shown = Math.floor(seg(t, 0.02, 0.36) * total);
  const grow = ease(seg(t, 0.4, 0.68));
  const kw = /\b(SELECT|SUM|AS|FROM|WHERE|GROUP|BY)\b/g;
  return (
    <svg viewBox="0 0 560 380" className="kit-svg" aria-hidden="true">
      <rect x={16} y={14} width={528} height={142} rx={12} className="kit-code-bg" />
      {sql.map((l, i) => {
        const part = l.slice(0, Math.max(0, shown));
        shown -= l.length;
        const pieces = part.split(kw);
        return (
          <text key={i} x={36} y={42 + i * 24} className="kit-code" xmlSpace="preserve">
            {pieces.map((p, j) => <tspan key={j} className={/^(SELECT|SUM|AS|FROM|WHERE|GROUP|BY)$/.test(p) ? "kit-code-kw" : p.includes("'") ? "kit-code-str" : undefined}>{p}</tspan>)}
          </text>
        );
      })}
      <line x1={70} y1={346} x2={530} y2={346} className="kit-thin" />
      {bars.map((b, i) => {
        const h = 150 * b.v * grow, x = 100 + i * 112;
        return (
          <g key={b.k}>
            <rect x={x} y={346 - h} width={64} height={h} rx={6} fill={i === 0 ? "#ff7a45" : i === 1 ? "#b7adff" : i === 2 ? "#8ee6c4" : "#7ce7ff"} opacity={0.9} />
            <text x={x + 32} y={366} textAnchor="middle" className="kit-tag">{b.k}</text>
          </g>
        );
      })}
      <text x={70} y={186} className="kit-small" opacity={seg(t, 0.66, 0.76)}>Revenue per currency, not one blended total</text>
    </svg>
  );
}

/* ---------- 04 Model: a To-Be swimlane draws its happy path ---------- */
const route: [number, number][] = [[60, 110], [150, 110], [205, 110], [205, 270], [262, 270], [372, 270], [462, 270], [505, 270], [505, 110], [530, 110]];
const routeLen = route.slice(1).reduce((s, [x, y], i) => s + Math.abs(x - route[i][0]) + Math.abs(y - route[i][1]), 0);
const nodes = [
  { at: 0, el: <circle cx={60} cy={110} r={14} className="kit-start" /> },
  { at: 0.12, el: <><rect x={110} y={88} width={80} height={44} rx={10} className="kit-task" /><text x={150} y={115} textAnchor="middle" className="kit-small-strong">Pay</text></> },
  { at: 0.38, el: <><rect x={214} y={248} width={96} height={44} rx={10} className="kit-task" /><text x={262} y={268} textAnchor="middle" className="kit-small-strong">Verify on</text><text x={262} y={283} textAnchor="middle" className="kit-small-strong">return</text></> },
  { at: 0.52, el: <><path d="M372,244 L398,270 L372,296 L346,270 Z" className="kit-gate" /><text x={372} y={274} textAnchor="middle" className="kit-small">Paid?</text></> },
  { at: 0.68, el: <><rect x={418} y={248} width={88} height={44} rx={10} className="kit-task" /><text x={462} y={275} textAnchor="middle" className="kit-small-strong">Issue ticket</text></> },
  { at: 0.95, el: <circle cx={530} cy={110} r={14} className="kit-end" /> },
];

function Model({ t }: { t: number }) {
  const draw = seg(t, 0.04, 0.62);
  const loop = seg(t, 0.62, 0.72);
  return (
    <svg viewBox="0 0 560 380" className="kit-svg" aria-hidden="true">
      <rect x={10} y={30} width={540} height={160} rx={12} className="kit-lane" />
      <rect x={10} y={190} width={540} height={160} rx={12} className="kit-lane kit-lane-alt" />
      <text x={24} y={52} className="kit-tag">CUSTOMER</text>
      <text x={24} y={212} className="kit-tag">SYSTEM</text>
      <path d={"M" + route.map(([x, y]) => `${x},${y}`).join(" L")} className="kit-track" />
      <path d={"M" + route.map(([x, y]) => `${x},${y}`).join(" L")} className="kit-route"
        style={{ strokeDasharray: routeLen, strokeDashoffset: routeLen * (1 - draw) }} />
      {nodes.map((n, i) => <g key={i} opacity={seg(draw, n.at - 0.04, n.at + 0.04)}>{n.el}</g>)}
      <g opacity={loop}>
        <path d="M372,296 V330 H262 V292" className="kit-loop" />
        <text x={318} y={346} textAnchor="middle" className="kit-tag">NO · RECONCILE JOB</text>
      </g>
      <text x={530} y={146} textAnchor="middle" className="kit-small" opacity={seg(draw, 0.9, 1)}>Ticket</text>
      <text x={546} y={20} textAnchor="end" className="kit-tag" opacity={seg(t, 0.1, 0.2)}>TO-BE · BPMN 2.0</text>
    </svg>
  );
}

/* ---------- 05 Specify: a user story writes its acceptance criteria and traces to the RTM ---------- */
const ac = [["Given", "payment succeeds at the gateway"], ["When", "I return to the site"], ["Then", "my order is verified and my ticket issued"], ["And", "no second charge is possible"]];
const trace = ["BR-03", "FR-11", "MTS-142", "UAT-07"];

function Specify({ t }: { t: number }) {
  const link = seg(t, 0.58, 0.74);
  return (
    <svg viewBox="0 0 560 380" className="kit-svg" aria-hidden="true">
      <rect x={16} y={12} width={528} height={282} rx={14} className="kit-card" />
      <text x={36} y={42} className="kit-tag">MTS-142 · STORY</text>
      <g opacity={seg(t, 0.02, 0.1)}>
        <rect x={446} y={26} width={80} height={24} rx={12} className="kit-must" />
        <text x={486} y={43} textAnchor="middle" className="kit-must-text">MUST</text>
      </g>
      {["As an attendee, I want my ticket the moment I pay,", "so I am never charged twice."].map((l, i) => (
        <text key={i} x={36} y={78 + i * 24} className="kit-story" opacity={seg(t, 0.04 + i * 0.05, 0.12 + i * 0.05)}>{l}</text>
      ))}
      <text x={36} y={148} className="kit-tag" opacity={seg(t, 0.14, 0.2)}>ACCEPTANCE CRITERIA</text>
      {ac.map(([k, v], i) => (
        <text key={k} x={36} y={180 + i * 26} className="kit-small" opacity={seg(t, 0.2 + i * 0.08, 0.28 + i * 0.08)}>
          <tspan className="kit-code-kw">{k}</tspan> {v}
        </text>
      ))}
      {trace.map((id, i) => {
        const x = 52 + i * 128, on = seg(link, i * 0.2, i * 0.2 + 0.3);
        return (
          <g key={id} opacity={on}>
            {i > 0 && <line x1={x - 74} y1={334} x2={x - 42} y2={334} className="kit-thin" markerEnd="url(#kit-arrow)" />}
            <rect x={x - 40} y={318} width={96} height={32} rx={16} className={i === 2 ? "kit-chip-on" : "kit-chip"} />
            <text x={x + 8} y={339} textAnchor="middle" className="kit-tag">{id}</text>
          </g>
        );
      })}
      <defs><marker id="kit-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="rgba(243,241,236,0.6)" /></marker></defs>
    </svg>
  );
}

/* ---------- 06 Validate: UAT scenarios run, one fails, gets fixed, then sign-off ---------- */
const uat = ["UAT-01  Pay by card in GBP", "UAT-02  Pay by transfer in NGN", "UAT-03  Slow network, user retries", "UAT-04  Refund issued and verified", "UAT-05  Door staff scan tickets"];

function Validate({ t }: { t: number }) {
  const stamp = seg(t, 0.64, 0.72);
  return (
    <svg viewBox="0 0 560 380" className="kit-svg" aria-hidden="true">
      <rect x={16} y={12} width={528} height={300} rx={14} className="kit-card" />
      <text x={36} y={44} className="kit-tag">SCENARIO</text>
      <text x={444} y={44} className="kit-tag">RESULT</text>
      {uat.map((u, i) => {
        const run = seg(t, 0.06 + i * 0.08, 0.12 + i * 0.08);
        const failing = i === 2 && t < 0.56;
        const y = 82 + i * 48;
        return (
          <g key={u}>
            <line x1={36} x2={524} y1={y + 20} y2={y + 20} className="kit-row" />
            <text x={36} y={y + 4} className="kit-small">{u}</text>
            <g opacity={run}>
              <rect x={432} y={y - 14} width={92} height={26} rx={13} className={failing ? "kit-fail" : "kit-pass"} />
              <text x={478} y={y + 4} textAnchor="middle" className="kit-result">{failing ? "✗ DEF-19" : i === 2 ? "✓ Retest" : "✓ Pass"}</text>
            </g>
          </g>
        );
      })}
      <g opacity={stamp} transform={`translate(400 344) rotate(-8) scale(${lerp(1.4, 1, stamp)})`}>
        <rect x={-104} y={-24} width={208} height={48} rx={8} className="kit-stamp" />
        <text y={7} textAnchor="middle" className="kit-stamp-text">SIGNED OFF</text>
      </g>
      <text x={36} y={350} className="kit-small" opacity={seg(t, 0.36, 0.44)}>Defect fixed in build, retested, closed.</text>
    </svg>
  );
}

/* ---------- 07 Handover: the pack assembles and benefits land under target ---------- */
const pack = ["User guide", "Training x3", "Support runbook", "RAID log closed", "Two weeks hypercare"];
const series = [9.2, 8.6, 5.1, 2.4, 1.1, 0.6, 0.3, 0.2];

function Handover({ t }: { t: number }) {
  const draw = seg(t, 0.3, 0.68);
  const px = (i: number) => 262 + i * 38, py = (v: number) => 300 - v * 24;
  const pts = series.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  const len = 520;
  return (
    <svg viewBox="0 0 560 380" className="kit-svg" aria-hidden="true">
      {pack.map((p, i) => {
        const on = ease(seg(t, 0.02 + i * 0.06, 0.12 + i * 0.06));
        return (
          <g key={p} opacity={on} transform={`translate(${(1 - on) * -20} 0)`}>
            <rect x={16} y={40 + i * 56} width={200} height={42} rx={10} className="kit-card" />
            <circle cx={40} cy={61 + i * 56} r={9} className="kit-check" />
            <path d={`M35,${61 + i * 56} l4,4 l7,-8`} className="kit-tick" />
            <text x={58} y={66 + i * 56} className="kit-small-strong">{p}</text>
          </g>
        );
      })}
      <text x={250} y={30} className="kit-tag">DUPLICATE CHARGES PER 1,000 ORDERS</text>
      <line x1={250} y1={300} x2={540} y2={300} className="kit-thin" />
      <line x1={250} y1={py(1)} x2={540} y2={py(1)} className="kit-target" opacity={seg(t, 0.24, 0.3)} />
      <text x={540} y={py(1) - 8} textAnchor="end" className="kit-tag" opacity={seg(t, 0.24, 0.3)}>TARGET</text>
      <polyline points={pts} className="kit-route" style={{ strokeDasharray: len, strokeDashoffset: len * (1 - draw) }} />
      {series.map((_, i) => <text key={i} x={px(i)} y={322} textAnchor="middle" className="kit-tag" opacity={seg(t, 0.26, 0.32)}>W{i + 1}</text>)}
      <text x={250} y={356} className="kit-small" opacity={seg(t, 0.66, 0.76)}>Benefits review against the measure agreed on day one</text>
    </svg>
  );
}

const stages: Stage[] = [
  { verb: "Elicit", file: "affinity-map.board", line: "Get the real problem out of people's heads.",
    proof: "NaijaFoodFestival asked for one registration website. Interviews and an affinity map showed three separate journeys.",
    techniques: ["Stakeholder interviews", "Workshops", "Observation", "Surveys", "Document analysis", "Focus groups"],
    tools: ["Miro", "Microsoft Teams", "Microsoft Forms"], Art: Affinity },
  { verb: "Analyse", file: "root-cause.fishbone", line: "Find the cause, not the loudest symptom.",
    proof: "At MyTicketSeller, two duplicate-charge emails traced back to one timing fault in how payments became tickets.",
    techniques: ["5 Whys", "Fishbone", "Gap analysis", "SWOT", "PESTLE", "Power / interest grid"],
    tools: ["Excel", "Miro", "Confluence"], Art: Fishbone },
  { verb: "Data", file: "revenue_by_currency.sql", line: "Let the numbers argue back.",
    proof: "Foreign-currency sales were blended into one total. Querying per currency made organiser reporting honest.",
    techniques: ["Data profiling", "Reconciliation", "KPI definition", "Funnel analysis"],
    tools: ["SQL", "Excel · Power Query", "Power BI", "GA4", "Looker Studio", "Airtable"], Art: DataStage },
  { verb: "Model", file: "to-be.bpmn", line: "Draw the flow before anyone builds it.",
    proof: "The To-Be flow verifies payment on return, so no paid order depends on a single callback.",
    techniques: ["BPMN 2.0", "As-Is / To-Be swimlanes", "Use cases", "Journey maps", "Data flow diagrams", "ERD"],
    tools: ["Lucidchart", "Visio", "draw.io"], Art: Model },
  { verb: "Specify", file: "MTS-142.story", line: "Write it so it can be tested.",
    proof: "90+ changes shipped in 10 weeks, each traced from a business requirement to a UAT script.",
    techniques: ["BRD", "FRD", "User stories", "Gherkin acceptance criteria", "Decision tables", "MoSCoW", "Traceability matrix"],
    tools: ["Jira", "Confluence"], Art: Specify },
  { verb: "Validate", file: "uat-cycle-2.xlsx", line: "Test it the way real people will break it.",
    proof: "Real users ran real scenarios before go-live. Failures went back to build, got fixed and were retested.",
    techniques: ["UAT planning", "Test scenarios", "Defect triage", "Prototypes", "Sign-off"],
    tools: ["Jira", "Figma", "Excel"], Art: Validate },
  { verb: "Handover", file: "benefits-review.pdf", line: "Leave it running without me.",
    proof: "Guides, training and a benefits review against the measure agreed on day one. That is the finish line.",
    techniques: ["Training", "User guides", "Hypercare", "RAID closure", "Change impact", "Benefits realisation"],
    tools: ["Confluence", "Microsoft 365", "Power BI"], Art: Handover },
];

function StageText({ s, i }: { s: Stage; i: number }) {
  return (
    <>
      <p className="kit-num">{String(i + 1).padStart(2, "0")} / {s.verb}</p>
      <h3 className="kit-line">{s.line}</h3>
      <p className="kit-proof">{s.proof}</p>
      <div className="kit-groups">
        <div><p className="kit-group">Techniques</p><ul className="kit-chips">{s.techniques.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><p className="kit-group">Tools</p><ul className="kit-chips kit-chips-tools">{s.tools.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
    </>
  );
}

function Window({ s, children }: { s: Stage; children: ReactNode }) {
  return (
    <div className="kit-window">
      <div className="kit-chrome"><span /><span /><span /><em>{s.file}</em></div>
      {children}
    </div>
  );
}

export default function Toolkit() {
  const section = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [stacked, setStacked] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px), (prefers-reduced-motion: reduce)");
    const set = () => setStacked(mq.matches);
    set();
    mq.addEventListener("change", set);
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setP(clamp(span > 0 ? -r.top / span : 0));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { mq.removeEventListener("change", set); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const head = (
    <header className="kit-head">
      <p className="eyebrow">Approach · the BA toolkit, elicitation to handover</p>
      <h2 className="section-title">The right tool for <em>each stage.</em></h2>
    </header>
  );

  if (stacked) {
    return (
      <section className="kit kit-stacked" id="approach" aria-label="The BA toolkit">
        {head}
        {stages.map((s, i) => (
          <article key={s.verb} className="kit-block">
            <StageText s={s} i={i} />
            <Window s={s}><s.Art t={1} /></Window>
          </article>
        ))}
      </section>
    );
  }

  const n = stages.length;
  const pos = p * n;
  const active = Math.min(n - 1, Math.floor(pos));
  const local = Math.min(1, pos - active);
  const s = stages[active];
  const jump = (i: number) => {
    const el = section.current;
    if (!el) return;
    const span = el.offsetHeight - innerHeight;
    scrollTo({ top: el.offsetTop + span * ((i + 0.02) / n), behavior: "smooth" });
  };

  return (
    <section ref={section} className="kit" id="approach" aria-label="The BA toolkit" style={{ height: `${n * 95 + 100}vh` }}>
      <div className="kit-sticky">
        {head}
        <nav className="kit-rail" aria-label="Toolkit stages">
          <span className="kit-rail-fill" style={{ transform: `scaleX(${p})` }} />
          {stages.map((st, i) => (
            <button key={st.verb} className={`kit-stop${i === active ? " is-active" : ""}${i < active ? " is-done" : ""}`} onClick={() => jump(i)}>
              <span className="kit-dot" />{st.verb}
            </button>
          ))}
        </nav>
        <div className="kit-body">
          <div className="kit-text" key={s.verb}><StageText s={s} i={active} /></div>
          <Window s={s}><s.Art t={local} /></Window>
        </div>
      </div>
    </section>
  );
}
