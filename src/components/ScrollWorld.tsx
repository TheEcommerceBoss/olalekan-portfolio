import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapters } from "../data";

type Progress = { current: number };

const vertex = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPush;
  attribute vec3 aChaos;
  attribute vec3 aFunnel;
  attribute vec3 aGrid;
  attribute float aSeed;
  varying float vMix;
  varying float vSeed;
  void main() {
    // 0 -> 0.5 : chaos to funnel, 0.5 -> 1 : funnel to grid
    float a = smoothstep(0.05, 0.5, uProgress);
    float b = smoothstep(0.5, 0.92, uProgress);
    vec3 p = mix(aChaos, aFunnel, a);
    p = mix(p, aGrid, b);
    // chaos keeps drifting until it is organised
    float drift = (1.0 - b) * (1.0 - a * 0.7);
    p += drift * 0.35 * vec3(sin(uTime * 0.6 + aSeed * 6.28), cos(uTime * 0.5 + aSeed * 12.0), sin(uTime * 0.4 + aSeed * 3.0));
    // playful: points scatter away from the cursor, then settle back
    vec2 away = p.xy - uMouse;
    float falloff = exp(-dot(away, away) * 0.45) * uPush;
    p.xy += normalize(away + 0.0001) * falloff * 1.6;
    p.z += falloff * 1.2;
    vMix = uProgress;
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (2.2 + aSeed * 2.4) * (18.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  varying float vMix;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    vec3 ember = vec3(1.0, 0.40, 0.18);
    vec3 iris = vec3(0.45, 0.40, 1.0);
    vec3 clear = vec3(0.92, 0.95, 1.0);
    vec3 col = mix(ember, iris, smoothstep(0.0, 0.55, vMix + vSeed * 0.15));
    col = mix(col, clear, smoothstep(0.6, 1.0, vMix));
    float alpha = smoothstep(0.5, 0.0, d) * 0.9;
    gl_FragColor = vec4(col, alpha);
  }
`;

function Particles({ progress, count }: { progress: Progress; count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const points = useRef<THREE.Points>(null);
  const eased = useRef(0);

  const geometry = useMemo(() => {
    const chaos = new Float32Array(count * 3);
    const funnel = new Float32Array(count * 3);
    const grid = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const side = Math.ceil(Math.sqrt(count));
    for (let i = 0; i < count; i++) {
      const s = Math.random();
      seed[i] = s;
      // chaos: noisy sphere shell with clumps
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 5;
      chaos.set([r * Math.sin(v) * Math.cos(u), r * Math.sin(v) * Math.sin(u) * 0.7, r * Math.cos(v)], i * 3);
      // funnel: particles spiral into a narrowing stream
      const t = i / count;
      const ang = t * Math.PI * 28;
      const rad = 0.3 + (1 - t) * 3.8;
      funnel.set([Math.cos(ang) * rad, (t - 0.5) * 9, Math.sin(ang) * rad], i * 3);
      // grid: an ordered, slightly tilted lattice (a structured requirement set)
      const gx = i % side;
      const gy = Math.floor(i / side);
      grid.set([(gx / side - 0.5) * 11, (gy / side - 0.5) * 7, Math.sin(gx * 0.35) * 0.25], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(chaos.slice(), 3));
    g.setAttribute("aChaos", new THREE.BufferAttribute(chaos, 3));
    g.setAttribute("aFunnel", new THREE.BufferAttribute(funnel, 3));
    g.setAttribute("aGrid", new THREE.BufferAttribute(grid, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(() => ({ uProgress: { value: 0 }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(99, 99) }, uPush: { value: 0 } }), []);
  const push = useRef(0);

  useFrame((state, delta) => {
    eased.current += (progress.current - eased.current) * Math.min(1, delta * 4);
    const p = eased.current;
    if (mat.current) {
      mat.current.uniforms.uProgress.value = p;
      mat.current.uniforms.uTime.value = state.clock.elapsedTime;
      // map the pointer onto the particle plane and ease the push strength in and out
      const vw = state.viewport.getCurrentViewport(state.camera, new THREE.Vector3(0, 0, 0));
      const target = new THREE.Vector2(state.pointer.x * vw.width / 2, state.pointer.y * vw.height / 2);
      mat.current.uniforms.uMouse.value.lerp(target, Math.min(1, delta * 8));
      push.current += ((state.pointer.x === 0 && state.pointer.y === 0 ? 0 : 1) - push.current) * Math.min(1, delta * 3);
      mat.current.uniforms.uPush.value = push.current;
    }
    if (points.current) {
      // the world turns while it is chaotic and settles face-on as it resolves
      points.current.rotation.y = (1 - p) * state.clock.elapsedTime * 0.08 + (1 - p) * 0.6;
      points.current.rotation.x = (1 - p) * 0.25;
    }
    state.camera.position.z = 15 - p * 5;
    state.camera.position.y = (1 - p) * 1.5;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms}
        transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function ScrollWorld() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef<Progress>({ current: 0 }).current;
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);
  const count = typeof window !== "undefined" && window.innerWidth < 700 ? 3000 : 6000;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      progress.current = p;
      setPct(p);
      setActive(Math.min(chapters.length - 1, Math.floor(p * chapters.length)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [progress]);

  return (
    <section ref={section} className="world" id="approach" aria-label="How I work">
      <div className="world-sticky">
        <Canvas className="world-canvas" camera={{ position: [0, 1.5, 15], fov: 50 }} dpr={[1, 1.75]}
          eventSource={typeof document !== "undefined" ? document.body : undefined}
          gl={{ antialias: false, powerPreference: "high-performance" }}>
          <Particles progress={progress} count={count} />
        </Canvas>
        <div className="world-label">
          <span>From noise</span>
          <span className="world-bar"><span style={{ transform: `scaleX(${pct})` }} /></span>
          <span>to clarity</span>
        </div>
        {chapters.map((c, i) => (
          <article key={c.num} className={`chapter ${i === active ? "is-active" : ""}`} aria-hidden={i !== active}>
            <p className="chapter-num">{c.num} / {c.verb}</p>
            <h2 className="chapter-line">{c.line}</h2>
            <p className="chapter-proof">{c.proof}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
