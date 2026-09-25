import { useRef } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { LiquidMetal } from "@paper-design/shaders-react";
import Glass from "./Glass";
import GlassObjects from "./GlassObjects";
import { links } from "../data";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const calm = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <section ref={ref} className="hero" id="top">
      <ShaderGradientCanvas className="hero-gradient" pixelDensity={1} fov={45} pointerEvents="none" lazyLoad={false}>
        <ShaderGradient
          control="props"
          type="waterPlane"
          animate={calm ? "off" : "on"}
          uSpeed={0.18}
          uStrength={2.6}
          uDensity={1.4}
          uFrequency={5.5}
          uAmplitude={1}
          color1="#ff5a1f"
          color2="#5b4bff"
          color3="#07070c"
          lightType="3d"
          brightness={1.1}
          reflection={0.1}
          cAzimuthAngle={180}
          cPolarAngle={80}
          cDistance={3.2}
          cameraZoom={1}
          positionX={0}
          positionY={0.6}
          positionZ={0}
          rotationX={50}
          rotationY={0}
          rotationZ={-60}
          grain="on"
        />
      </ShaderGradientCanvas>
      <div className="hero-veil" />
      {!calm && <GlassObjects />}

      <div className="hero-inner">
        <div className="hero-mark" aria-label="Olalekan Ajimoti monogram">
          <LiquidMetal image="/oa-mark.png" colorBack="#00000000" colorTint="#ffffff" shape="none"
            repetition={2.2} softness={0.12} shiftRed={0.3} shiftBlue={0.3} distortion={0.08}
            contour={0.45} angle={70} speed={0.9} scale={0.8} style={{ width: "100%", height: "100%" }} />
        </div>
        <p className="eyebrow">Olalekan Ajimoti · Business Analyst · United Kingdom</p>
        <h1 className="hero-title">
          I find the <em>question</em> behind the problem.
        </h1>
        <p className="hero-sub">
          Nine years turning tangled briefs into clear requirements, redesigned processes and tested products,
          across payments, e-commerce, tax technology and hospitality.
        </p>
        <div className="hero-actions">
          <Glass width={210} height={64} href="#work" container={ref}>See the work</Glass>
          <Glass width={210} height={64} href={links.cv} download container={ref}>Download CV</Glass>
        </div>
      </div>
      <a className="scroll-cue" href="#approach">Scroll to untangle<span /></a>
    </section>
  );
}
