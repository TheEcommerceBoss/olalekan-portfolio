import LiquidGlass from "liquid-glass-react";
import type { ReactNode, RefObject } from "react";

type Props = {
  children: ReactNode;
  width: number | string;
  height: number | string;
  radius?: number;
  padding?: string;
  href?: string;
  download?: boolean;
  container?: RefObject<HTMLElement | null>;
  strength?: number;
};

// liquid-glass-react centres itself on its parent, so it lives inside a sized slot.
export default function Glass({ children, width, height, radius = 999, padding = "14px 26px", href, download, container, strength = 64 }: Props) {
  const glass = (
    <LiquidGlass
      cornerRadius={radius}
      padding={padding}
      displacementScale={strength}
      blurAmount={0.08}
      saturation={150}
      aberrationIntensity={2}
      elasticity={0.18}
      mouseContainer={container}
      style={{ position: "absolute", top: "50%", left: "50%" }}
    >
      <span className="glass-content">{children}</span>
    </LiquidGlass>
  );
  return (
    <span className="glass-slot" style={{ width, height }}>
      {href ? (
        <a className="glass-link" href={href} {...(download ? { download: "" } : {})}
          target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{glass}</a>
      ) : glass}
    </span>
  );
}
