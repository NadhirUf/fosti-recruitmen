import { useEffect, useRef } from "react";

/**
 * Hook untuk animasi "fade + slide up" saat elemen masuk viewport.
 * Pakai IntersectionObserver bawaan browser (bukan library eksternal
 * seperti Framer Motion) supaya bundle tetap ringan dan tidak
 * menambah dependency.
 *
 * Cara pakai:
 *   const ref = useScrollReveal<HTMLDivElement>();
 *   <div ref={ref} className="reveal">...</div>
 */
export function useScrollReveal<T extends HTMLElement>(options?: {
  threshold?: number;
  delayMs?: number;
}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delay = options?.delayMs ?? 0;
          window.setTimeout(() => {
            el.classList.add("reveal-visible");
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: options?.threshold ?? 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.delayMs]);

  return ref;
}
