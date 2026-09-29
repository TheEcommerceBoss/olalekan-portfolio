import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshTransmissionMaterial, PerformanceMonitor } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// BA symbols in glass. Each is merged into one geometry so it costs a single transmission pass.
const place = (g: THREE.BufferGeometry, x = 0, y = 0, z = 0, rx = 0, rz = 0) => {
  g.rotateX(rx); g.rotateZ(rz); g.translate(x, y, z); return g;
};
const merge = (parts: THREE.BufferGeometry[]) => {
  const flat = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  flat.forEach((g) => { for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k); });
  return mergeGeometries(flat)!;
};
// Discovery: a magnifying glass
const magnifier = () => merge([
  new THREE.TorusGeometry(0.72, 0.15, 24, 72),
  place(new THREE.CylinderGeometry(0.66, 0.66, 0.06, 48), 0, 0, 0, Math.PI / 2),
  place(new THREE.CylinderGeometry(0.13, 0.17, 1.1, 24), 0.93, -0.93, 0, 0, Math.PI / 4),
]);
// Decision: a BPMN gateway diamond
const gateway = () => place(new RoundedBoxGeometry(1.25, 1.25, 0.34, 4, 0.12), 0, 0, 0, 0, Math.PI / 4);
// Data: a bar chart
const chart = () => merge([0.75, 1.15, 1.6].map((h, i) => place(new RoundedBoxGeometry(0.42, h, 0.42, 4, 0.09), (i - 1) * 0.56, h / 2 - 0.8)));
// Specification: a requirement card with lines of text
const card = () => merge([
  new RoundedBoxGeometry(1.6, 1.05, 0.12, 4, 0.1),
  ...[0.9, 1.15, 0.7].map((w, i) => place(new RoundedBoxGeometry(w, 0.1, 0.08, 2, 0.04), -0.55 + w / 2, 0.25 - i * 0.25, 0.08)),
]);


// Glass BA symbols that sway and lean towards the pointer, staying readable.
function Shape({ geometry, position, scale, color, speed, glow }: {
  geometry: () => THREE.BufferGeometry; position: [number, number, number]; scale: number; color: string; speed: number; glow: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const bg = useMemo(() => new THREE.Color(glow), [glow]);
  const geo = useMemo(geometry, [geometry]);
  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const { x, y } = state.pointer;
    m.rotation.x = THREE.MathUtils.damp(m.rotation.x, -y * 0.5 + Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.3, 3, delta);
    m.rotation.y = THREE.MathUtils.damp(m.rotation.y, x * 0.7 + Math.sin(state.clock.elapsedTime * 0.4 * speed + 1) * 0.5, 3, delta);
    m.position.x = THREE.MathUtils.damp(m.position.x, position[0] + x * 0.35, 2, delta);
    m.position.y = THREE.MathUtils.damp(m.position.y, position[1] + y * 0.25, 2, delta);
  });
  return (
    <Float speed={speed * 1.6} rotationIntensity={0.25} floatIntensity={1.2}>
      <mesh ref={mesh} position={position} scale={scale} geometry={geo}>
        <MeshTransmissionMaterial samples={3} resolution={256} thickness={0.6} roughness={0.05} ior={1.35}
          chromaticAberration={0.35} anisotropy={0.2} distortion={0.3} distortionScale={0.4} temporalDistortion={0.1}
          color={color} transmission={1} background={bg} />
      </mesh>
    </Float>
  );
}

export default function GlassObjects({ active = true }: { active?: boolean }) {
  const [dpr, setDpr] = useState(1.25);
  const small = typeof window !== "undefined" && window.innerWidth < 700;
  return (
    <Canvas className="hero-objects" camera={{ position: [0, 0, 8], fov: 40 }} dpr={dpr} frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }} eventSource={typeof document !== "undefined" ? document.body : undefined}>
      {/* drop resolution on machines that cannot hold the frame rate */}
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Shape geometry={magnifier} position={small ? [1.4, 2.6, 0] : [-4.2, 1.5, 0]} scale={small ? 0.55 : 0.85} color="#ffd9c7" speed={1} glow="#ff6a3d" />
      <Shape geometry={chart} position={small ? [-1.5, -2.9, 0] : [3.5, -1.4, 0.5]} scale={small ? 0.6 : 0.85} color="#d8d2ff" speed={1.3} glow="#6d5cff" />
      {!small && <Shape geometry={gateway} position={[3.9, 2.3, -1]} scale={0.7} color="#ffffff" speed={0.8} glow="#c04dff" />}
      {!small && <Shape geometry={card} position={[-3.8, -2.2, -0.5]} scale={0.75} color="#ffe6f0" speed={1.1} glow="#3d6bff" />}
      {/* procedural studio lighting: no external HDR download */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} color="#ffffff" position={[0, 5, -5]} scale={[10, 2, 1]} />
        <Lightformer form="ring" intensity={3} color="#ff5a1f" position={[-5, 1, 2]} scale={3} />
        <Lightformer form="ring" intensity={3} color="#6d5cff" position={[5, -1, 2]} scale={3} />
        <Lightformer form="rect" intensity={2} color="#7ce7ff" position={[0, -4, 3]} scale={[8, 1, 1]} />
      </Environment>
    </Canvas>
  );
}
