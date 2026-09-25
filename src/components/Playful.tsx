import { useEffect, useRef } from "react";

// Glowing dot plus a lagging ring; the ring swells over anything clickable. Desktop pointers only.
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
      const hot = (e.target as HTMLElement).closest("a, button");
      ring.current?.classList.toggle("is-hot", Boolean(hot));
    };
    const down = () => ring.current?.classList.add("is-down");
    const up = () => ring.current?.classList.remove("is-down");
    const tick = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      // sleep once the ring has caught up; the next pointer move wakes it
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(tick) : 0;
    };
    tick();
    addEventListener("pointermove", move);
    addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move); removeEventListener("pointerdown", down); removeEventListener("pointerup", up);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}

// Pointer-driven 3D tilt with a moving glare, for cards.
export function useTilt() {
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };
  const onPointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  return { onPointerMove, onPointerLeave };
}

const skills = ["Requirements elicitation", "BPMN swimlanes", "User stories", "Acceptance criteria", "Traceability matrix",
  "UAT", "Gap analysis", "Root-cause analysis", "Decision tables", "MoSCoW", "Stakeholder mapping", "Excel", "Jira"];

export function Ticker() {
  const row = [...skills, ...skills];
  return (
    <div className="ticker" aria-label="Skills">
      <div className="ticker-track">
        {row.map((s, i) => (
          <span key={i} className="ticker-item" aria-hidden={i >= skills.length}>
            <span className="ticker-glyph">✦</span>{s}
          </span>
        ))}
      </div>
    </div>
  );
}
