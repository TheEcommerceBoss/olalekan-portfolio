import { useRef } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import Glass from "./Glass";
import { useTilt } from "./Playful";
import { links, stats, work } from "../data";

export function Nav() {
  return (
    <nav className="nav" aria-label="Main">
      <Glass width="min(560px, calc(100vw - 32px))" height={60} padding="10px 22px" strength={40}>
        <span className="nav-row">
          <a href="#top" className="nav-name">OA</a>
          <a href="#about">About</a>
          <a href="#approach">Approach</a>
          <a href="#flow">Process</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
        </span>
      </Glass>
    </nav>
  );
}

export function Stats() {
  return (
    <section className="stats" aria-label="In numbers">
      {stats.map((s) => (
        <div key={s.label} className="stat">
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </section>
  );
}

export function Work() {
  const featured = work.filter((w) => w.featured);
  const rest = work.filter((w) => !w.featured);
  const tilt = useTilt();
  return (
    <section className="work" id="work">
      <MeshGradient className="work-bg" colors={["#07070c", "#1a1240", "#ff5a1f", "#0b1a3a"]}
        distortion={0.85} swirl={0.6} speed={0.25} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <div className="work-inner">
        <header className="section-head">
          <p className="eyebrow">Selected work</p>
          <h2 className="section-title">Problems I untangled.</h2>
          <p className="section-sub">Every case study comes with the real artefacts: BRD, FRD, process maps, traceability matrix, UAT plan and workbook.</p>
        </header>
        <div className="featured">
          {featured.map((w, i) => (
            <a key={w.name} href={w.href} target="_blank" rel="noreferrer" className="card card-featured" {...tilt} style={{ ["--accent" as string]: w.accent }}>
              <span className="card-index">0{i + 1}</span>
              <span className="card-tag">{w.tag}</span>
              <span className="card-name">{w.name}</span>
              <span className="card-title">{w.title}</span>
              <span className="card-summary">{w.summary}</span>
              <span className="card-cta">Open case study →</span>
            </a>
          ))}
        </div>
        <div className="grid">
          {rest.map((w) => (
            <a key={w.name} href={w.href} target="_blank" rel="noreferrer" className="card" {...tilt} style={{ ["--accent" as string]: w.accent }}>
              <span className="card-tag">{w.tag}</span>
              <span className="card-name">{w.name}</span>
              <span className="card-title">{w.title}</span>
              <span className="card-summary">{w.summary}</span>
            </a>
          ))}
        </div>
        <a className="all-link" href={links.github} target="_blank" rel="noreferrer">All 12 case studies on GitHub →</a>
      </div>
    </section>
  );
}

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  return (
    <section ref={ref} className="contact" id="contact">
      <img className="contact-avatar" src="/photos/coat-close-sm.webp" alt="Olalekan Ajimoti" loading="lazy" />
      <p className="eyebrow">Open to Business Analyst roles in the UK</p>
      <h2 className="contact-title">Got something <em>tangled?</em></h2>
      <p className="section-sub">Tell me the problem. I will come back with the questions that matter.</p>
      <div className="contact-actions">
        <Glass width={250} height={64} href={links.email} container={ref}>olalekanajimoti@gmail.com</Glass>
        <Glass width={170} height={64} href={links.linkedin} container={ref}>LinkedIn</Glass>
        <Glass width={170} height={64} href={links.cv} download container={ref}>CV (PDF)</Glass>
      </div>
      <footer className="footer">
        <span>© {new Date().getFullYear()} Olalekan Ajimoti</span>
      </footer>
    </section>
  );
}
