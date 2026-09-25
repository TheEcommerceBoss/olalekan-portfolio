import { useEffect, useRef } from "react";
import Glass from "./Glass";

const strip = [
  { src: "/photos/knit-wall-sm.webp", alt: "Olalekan leaning on a stone wall in a black knit jumper" },
  { src: "/photos/coat-full-sm.webp", alt: "Olalekan in a cream overcoat on a city street" },
  { src: "/photos/knit-lean-sm.webp", alt: "Olalekan smiling against a granite wall" },
];

const facts = [
  ["Based in", "United Kingdom"],
  ["Education", "MBA, York St John University (2026) · BBA, Nexford University (2024)"],
  ["Certified", "IBM Business Analysis Professional Certificate"],
  ["Toolkit", "BRD · FRD · BPMN · user stories · RTM · UAT · Excel · Jira"],
];

export default function About() {
  const ref = useRef<HTMLElement>(null);

  // the photo strip drifts sideways as the section passes through the viewport
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (r.bottom / (window.innerHeight + r.height))));
      el.style.setProperty("--drift", String(p));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={ref} className="about" id="about">
      <div className="about-media">
        <figure className="about-portrait">
          <img src="/photos/coat-smile.webp" srcSet="/photos/coat-smile-sm.webp 600w, /photos/coat-smile.webp 1200w"
            sizes="(max-width: 900px) 90vw, 40vw" alt="Portrait of Olalekan Ajimoti in a cream overcoat, smiling" loading="lazy" />
          <span className="about-badge">
            <Glass width={236} height={54} padding="10px 20px" strength={48} container={ref}>
              <span className="dot" /> Open to BA roles
            </Glass>
          </span>
        </figure>
        <div className="about-strip-wrap" aria-hidden="true">
          <div className="about-strip">
            {strip.map((s) => <img key={s.src} src={s.src} alt="" loading="lazy" />)}
          </div>
        </div>
      </div>

      <div className="about-copy">
        <p className="eyebrow">The person asking the questions</p>
        <h2 className="section-title">Hello, I'm <em>Olalekan.</em></h2>
        <p className="about-lead">
          I started in digital marketing at Creatrix Empire, where I learned that data only matters when it changes a decision.
          At BOZ Jewelry I learned that technology projects succeed or fail on people. At HunterTV Africa I owned a live
          ticketing platform and learned to follow a customer complaint all the way down to the system that caused it.
        </p>
        <p className="about-lead">Today I bring all three to every brief: the data, the people and the system.</p>
        <dl className="facts">
          {facts.map(([k, v]) => (
            <div key={k} className="fact"><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}
