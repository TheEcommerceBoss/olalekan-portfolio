import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

// Chrome-glass shapes that drift and lean towards the pointer.
function Shape({ geometry, position, scale, color, speed, glow }: {
  geometry: React.ReactNode; position: [number, number, number]; scale: number; color: string; speed: number; glow: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const bg = useMemo(() => new THREE.Color(glow), [glow]);
  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const { x, y } = state.pointer;
    m.rotation.x = THREE.MathUtils.damp(m.rotation.x, -y * 0.9 + state.clock.elapsedTime * 0.15 * speed, 3, delta);
    m.rotation.y = THREE.MathUtils.damp(m.rotation.y, x * 1.2 + state.clock.elapsedTime * 0.2 * speed, 3, delta);
    m.position.x = THREE.MathUtils.damp(m.position.x, position[0] + x * 0.35, 2, delta);
    m.position.y = THREE.MathUtils.damp(m.position.y, position[1] + y * 0.25, 2, delta);
  });
  return (
    <Float speed={speed * 1.6} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={mesh} position={position} scale={scale}>
        {geometry}
        <MeshTransmissionMaterial samples={4} resolution={256} thickness={0.6} roughness={0.05} ior={1.35}
          chromaticAberration={0.35} anisotropy={0.2} distortion={0.3} distortionScale={0.4} temporalDistortion={0.1}
          backside color={color} transmission={1} background={bg} />
      </mesh>
    </Float>
  );
}

export default function GlassObjects() {
  const small = typeof window !== "undefined" && window.innerWidth < 700;
  return (
    <Canvas className="hero-objects" camera={{ position: [0, 0, 8], fov: 40 }} dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }} eventSource={typeof document !== "undefined" ? document.body : undefined}>
      <Shape geometry={<torusKnotGeometry args={[0.9, 0.3, 160, 24]} />} position={small ? [1.4, 2.6, 0] : [-4.6, 1.4, 0]} scale={small ? 0.55 : 0.85} color="#ffd9c7" speed={1} glow="#ff6a3d" />
      <Shape geometry={<icosahedronGeometry args={[1, 0]} />} position={small ? [-1.5, -2.9, 0] : [4.7, -1.2, 0.5]} scale={small ? 0.6 : 0.95} color="#d8d2ff" speed={1.3} glow="#6d5cff" />
      {!small && <Shape geometry={<torusGeometry args={[0.8, 0.28, 32, 96]} />} position={[3.9, 2.3, -1]} scale={0.7} color="#ffffff" speed={0.8} glow="#c04dff" />}
      {!small && <Shape geometry={<capsuleGeometry args={[0.45, 1.1, 12, 32]} />} position={[-3.8, -2.2, -0.5]} scale={0.75} color="#ffe6f0" speed={1.1} glow="#3d6bff" />}
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
