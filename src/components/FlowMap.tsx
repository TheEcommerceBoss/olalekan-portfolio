import { useEffect, useMemo, useRef, useState } from "react";

type Kind = "start" | "task" | "gateway" | "end";
type Step = { id: string; kind: Kind; lane: number; x: number; label: string; what: string; artefacts: string[]; loop?: string };

const LANES = ["Stakeholders", "Business Analyst", "Delivery team"];
const LANE_H = 170, HEAD_W = 150, W = 1300, H = LANE_H * LANES.length;
const laneY = (l: number) => l * LANE_H + LANE_H / 2;

const steps: Step[] = [
  { id: "start", kind: "start", lane: 0, x: 215, label: "A request arrives", what: "Someone asks for a solution: “we need a website”, “fix the checkout”. I treat it as a symptom until proven otherwise.", artefacts: ["Initial brief"] },
  { id: "discover", kind: "task", lane: 1, x: 335, label: "Discover", what: "Interviews, observation and data to find the real problem and everyone it touches.", artefacts: ["Stakeholder map", "As-Is process"] },
  { id: "clear", kind: "gateway", lane: 1, x: 465, label: "Problem clear?", what: "If the root cause is still fuzzy, I go back and ask better questions before anyone builds anything.", artefacts: ["Problem statement", "Five whys"], loop: "No: back to Discover" },
  { id: "define", kind: "task", lane: 1, x: 595, label: "Define", what: "Turn the problem into requirements people can test, with a success measure agreed up front.", artefacts: ["BRD", "User stories", "Acceptance criteria"] },
  { id: "design", kind: "task", lane: 1, x: 725, label: "Design", what: "Map the To-Be flow and prioritise what fits the budget and the deadline.", artefacts: ["To-Be swimlane", "MoSCoW", "Traceability matrix"] },
  { id: "build", kind: "task", lane: 2, x: 855, label: "Build", what: "Work alongside developers, answer questions fast and keep every change traced to a requirement.", artefacts: ["FRD", "Backlog", "Change log"] },
  { id: "uat", kind: "task", lane: 0, x: 985, label: "Test with users", what: "Real users run real scenarios before anything goes live.", artefacts: ["UAT plan", "Defect log"] },
  { id: "accepted", kind: "gateway", lane: 1, x: 1105, label: "Accepted?", what: "Anything that fails goes back to build, gets fixed and is retested.", artefacts: ["Sign-off"], loop: "No: back to Build" },
  { id: "value", kind: "end", lane: 0, x: 1215, label: "Value measured", what: "Check the outcome against the measure agreed at the start. That is the real finish line.", artefacts: ["Benefits review"] },
];

// Orthogonal happy path through every step, with the arc length at which each step sits.
function buildPath() {
  const pts: [number, number][] = [];
  const at: number[] = [];
  let len = 0;
  const push = (x: number, y: number) => {
    if (pts.length) { const [px, py] = pts[pts.length - 1]; len += Math.abs(x - px) + Math.abs(y - py); }
    pts.push([x, y]);
  };
  steps.forEach((s, i) => {
    const y = laneY(s.lane);
    if (i === 0) push(s.x, y);
    else {
      const p = steps[i - 1], py = laneY(p.lane);
      if (py === y) push(s.x, y);
      else { const mx = (p.x + s.x) / 2; push(mx, py); push(mx, y); push(s.x, y); }
    }
    at.push(len);
  });
  const d = "M" + pts.map(([x, y]) => `${x},${y}`).join(" L");
  return { d, pts, at, total: len };
}

function pointAt(pts: [number, number][], dist: number): [number, number] {
  let left = dist;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const seg = Math.abs(bx - ax) + Math.abs(by - ay);
    if (left <= seg) { const t = seg ? left / seg : 0; return [ax + (bx - ax) * t, ay + (by - ay) * t]; }
    left -= seg;
  }
  return pts[pts.length - 1];
}

function Node({ s, active, onPick }: { s: Step; active: boolean; onPick: () => void }) {
  const y = laneY(s.lane);
  const cls = `fm-node fm-${s.kind}${active ? " is-active" : ""}`;
  return (
    <g className={cls} tabIndex={0} role="button" aria-label={`${s.label}: ${s.what}`}
      onClick={onPick} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(); } }}>
      {s.kind === "task" && <rect x={s.x - 58} y={y - 30} width={116} height={60} rx={14} />}
      {s.kind === "gateway" && <path d={`M${s.x},${y - 40} L${s.x + 44},${y} L${s.x},${y + 40} L${s.x - 44},${y} Z`} />}
      {(s.kind === "start" || s.kind === "end") && <circle cx={s.x} cy={y} r={22} />}
      {s.kind === "task" && <text x={s.x} y={y + 5} textAnchor="middle">{s.label}</text>}
      {s.kind === "gateway" && (
        <text x={s.x} y={y - 3} textAnchor="middle" className="fm-small">
          {s.label.split(" ").map((w, i) => <tspan key={i} x={s.x} dy={i ? 14 : 0}>{w}</tspan>)}
        </text>
      )}
      {(s.kind === "start" || s.kind === "end") && <text x={s.x} y={y + 46} textAnchor="middle" className="fm-caption">{s.label}</text>}
    </g>
  );
}

export default function FlowMap() {
  const section = useRef<HTMLElement>(null);
  const { d, pts, at, total } = useMemo(buildPath, []);
  const [p, setP] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const calm = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setP(Math.min(1, Math.max(0, span > 0 ? -r.top / span : 0)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const progress = calm ? 1 : p;
  const dist = progress * total;
  const scrollActive = at.reduce((acc, a, i) => (dist + 1 >= a ? i : acc), 0);
  const active = picked ?? scrollActive;
  const [tx, ty] = pointAt(pts, dist);
  const step = steps[active];

  // "No" loops, drawn dashed like a real process map
  const clear = steps[2], disc = steps[1], acc = steps[7], build = steps[5];
  const loop1 = `M${clear.x},${laneY(1) - 40} V${laneY(1) - 64} H${disc.x} V${laneY(1) - 30}`;
  const loop2 = `M${acc.x},${laneY(1) + 40} V${laneY(2)} H${build.x + 58}`;

  return (
    <section ref={section} className="flow" id="flow" aria-labelledby="flow-title">
      <div className="flow-sticky">
        <header className="flow-head">
          <p className="eyebrow">How I work · a process map of my process</p>
          <h2 id="flow-title" className="section-title">Every project, <em>mapped.</em></h2>
        </header>

        <div className="flow-canvas">
          <svg viewBox={`0 0 ${W} ${H}`} className="flow-svg" role="img"
            aria-label="Swimlane process map of how Olalekan works, from a request arriving to value being measured">
            <defs>
              <marker id="fm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className="fm-arrowhead" />
              </marker>
              <radialGradient id="fm-glow"><stop offset="0" stopColor="#fff" /><stop offset="0.35" stopColor="#ff8a5c" /><stop offset="1" stopColor="#ff5a1f" stopOpacity="0" /></radialGradient>
            </defs>
            {LANES.map((l, i) => (
              <g key={l} className="fm-lane">
                <rect x={0} y={i * LANE_H} width={W} height={LANE_H} className={i % 2 ? "fm-lane-alt" : "fm-lane-bg"} />
                <rect x={0} y={i * LANE_H} width={HEAD_W - 20} height={LANE_H} className="fm-lane-head" />
                <text x={(HEAD_W - 20) / 2} y={laneY(i) + 5 - (l.split(" ").length - 1) * 9} textAnchor="middle" className="fm-lane-label">
                  {l.split(" ").map((w, j) => <tspan key={j} x={(HEAD_W - 20) / 2} dy={j ? 18 : 0}>{w}</tspan>)}
                </text>
                {i > 0 && <line x1={0} x2={W} y1={i * LANE_H} y2={i * LANE_H} className="fm-divider" />}
              </g>
            ))}
            <path d={d} className="fm-track" />
            <path d={d} className="fm-flow-glow" style={{ strokeDasharray: total, strokeDashoffset: total * (1 - progress) }} />
            <path d={d} className="fm-flow" style={{ strokeDasharray: total, strokeDashoffset: total * (1 - progress) }} markerEnd={progress > 0.98 ? "url(#fm-arrow)" : undefined} />
            <path d={loop1} className="fm-loop" markerEnd="url(#fm-arrow)" />
            <text x={(clear.x + disc.x) / 2} y={laneY(1) - 72} textAnchor="middle" className="fm-tag">No</text>
            <text x={clear.x + 52} y={laneY(1) - 8} className="fm-tag">Yes</text>
            <path d={loop2} className="fm-loop" markerEnd="url(#fm-arrow)" />
            <text x={acc.x + 10} y={laneY(2) - 12} className="fm-tag">No</text>
            <text x={acc.x + 30} y={laneY(1) - 50} className="fm-tag">Yes</text>
            {steps.map((s, i) => <Node key={s.id} s={s} active={i === active} onPick={() => setPicked(i === picked ? null : i)} />)}
            {!calm && <circle cx={tx} cy={ty} r={16} fill="url(#fm-glow)" className="fm-token" />}
          </svg>
        </div>

        <div className="flow-info" aria-live="polite">
          <span className="flow-step-num">{String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>
          <div>
            <h3 className="flow-step-title">{step.label}</h3>
            <p className="flow-step-what">{step.what}</p>
          </div>
          <ul className="flow-artefacts" aria-label="Artefacts">
            {step.artefacts.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>

        {/* Mobile and screen-reader version of the same flow */}
        <ol className="flow-list">
          {steps.map((s, i) => (
            <li key={s.id} className={`flow-li flow-li-${s.kind}`}>
              <span className="flow-li-mark" aria-hidden="true">{s.kind === "gateway" ? "?" : String(i + 1)}</span>
              <div>
                <p className="flow-li-lane">{LANES[s.lane]}</p>
                <h3 className="flow-li-title">{s.label}</h3>
                <p className="flow-li-what">{s.what}</p>
                {s.loop && <p className="flow-li-loop">{s.loop}</p>}
                <p className="flow-li-art">{s.artefacts.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
