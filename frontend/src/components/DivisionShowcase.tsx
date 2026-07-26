import { useEffect, useRef, useState } from "react";

interface DivisionShowcaseProps {
  id: string;
  title: string;
  photoCount?: number;
  photos?: string[];
}

/** Judul dengan animasi reveal huruf-per-huruf saat masuk viewport */
function AnimatedTitle({
  text,
  variant,
}: {
  text: string;
  variant: "solid" | "outline";
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseClass =
    "font-sans text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-5xl";

  return (
    <h2
      ref={ref}
      aria-hidden={variant === "outline" || undefined}
      className={
        variant === "solid"
          ? `${baseClass} text-white`
          : `mt-1 select-none ${baseClass}`
      }
      style={
        variant === "outline"
          ? { color: "transparent", WebkitTextStroke: "1px #FFFFFF" }
          : undefined
      }
    >
      {text.split("").map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((char, i) => (
            <span
              key={i}
              className="inline-block transition-all duration-500 ease-out"
              style={{
                transitionDelay: `${(wi * 10 + i) * 25}ms`,
                transform: visible ? "translateY(0)" : "translateY(1rem)",
                opacity: visible ? 1 : 0,
              }}
            >
              {char}
            </span>
          ))}
          {wi < text.split(" ").length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </h2>
  );
}

export default function DivisionShowcase({
  id,
  title,
  photoCount = 5,
  photos,
}: DivisionShowcaseProps) {
  const items = photos ?? Array.from({ length: photoCount }, () => null);
  const loopItems = [...items, ...items];
  const [paused, setPaused] = useState(false);

  return (
    <section id={id} className="relative py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[700px] w-[700px] translate-x-1/4 translate-y-1/4 rounded-full bg-brand-red/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-[450px] w-[450px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-red/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-content px-6">
        <div className="relative text-center sm:text-left">
          <AnimatedTitle text={title} variant="solid" />
          <AnimatedTitle text={title} variant="outline" />
        </div>
      </div>

      <div className="relative mt-10 h-[42vh] min-h-[300px] w-screen overflow-hidden sm:h-[70vh]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-base-bg to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-base-bg to-transparent sm:w-32" />

        <div
          onClick={() => setPaused((p) => !p)}
          style={{ animationPlayState: paused ? "paused" : "running" }}
          className="flex h-full w-max cursor-pointer gap-1 animate-marquee"
        >
          {loopItems.map((photo, i) => (
            <PhotoCard key={i} src={photo} index={i % items.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PhotoCard({ src, index }: { src: string | null; index: number }) {
  return (
    <div className="relative h-full w-[260px] shrink-0 overflow-hidden rounded-2xl sm:w-[300px]">
      {src ? (
        <img
          src={src}
          alt={`Anggota divisi ${index + 1}`}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-base-panel to-black text-white/25">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v9.75m-18 0A2.25 2.25 0 0 0 5.25 18.75h13.5A2.25 2.25 0 0 0 21 16.5m-18 0 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0L21 16.5M15 8.25h.008v.008H15V8.25Z"
            />
          </svg>
          <span className="text-[10px]">Foto {index + 1}</span>
        </div>
      )}
    </div>
  );
}
