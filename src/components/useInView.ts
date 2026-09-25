import { useEffect, useState, type RefObject } from "react";

// True while the element is on screen (with a margin), so canvases can stop rendering when scrolled away.
export function useInView(ref: RefObject<Element | null>, margin = "200px") {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}
