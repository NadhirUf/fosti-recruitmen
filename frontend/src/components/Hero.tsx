import HeroLogo from "./HeroLogo";
import { useScrollReveal } from "../hooks/useScrollReveal";

const STATS = [
  { value: "25-31 Agustus", label: "Periode daftar" },
  { value: "3", label: "Divisi terbuka" },
  { value: "Gratis", label: "Tanpa biaya" },
];

export default function Hero() {
  const badgeRef = useScrollReveal<HTMLDivElement>({ delayMs: 0 });
  const headingRef = useScrollReveal<HTMLDivElement>({ delayMs: 100 });
  const logoRef = useScrollReveal<HTMLDivElement>({ delayMs: 200 });
  const descRef = useScrollReveal<HTMLParagraphElement>({ delayMs: 300 });
  const ctaRef = useScrollReveal<HTMLDivElement>({ delayMs: 400 });
  const statsRef = useScrollReveal<HTMLDivElement>({ delayMs: 500 });

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-16 text-center">
      {/* Ambient glow merah samar, mengikuti aksen warna logo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[90px]"
      />

      <div
        ref={badgeRef}
        className="reveal rounded-full border border-brand-red/60 px-4 py-1.5 text-xs font-medium text-brand-red"
      >
        Open recruitmen 2026 sedang dibuka
      </div>

      <div ref={headingRef} className="reveal mt-8">
        <h1 className="font-display text-4xl font-medium sm:text-5xl">
          Bergabung bersama
        </h1>
      </div>

      <div ref={logoRef} className="reveal mt-4 w-full">
        <HeroLogo />
      </div>

      <p
        ref={descRef}
        className="reveal mt-4 max-w-xl text-balance text-sm text-white/60 sm:text-base"
      >
        Forum Open Source Teknik Informatika - tempat belajar, berkarya, dan
        berkembang bersama komunitas
      </p>

      <div
        ref={ctaRef}
        className="reveal mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <a
          href="#pendaftaran"
          className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-red/25 transition-transform hover:scale-105 active:scale-95"
        >
          Daftar sekarang
        </a>
        <a
          href="#tentang"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50"
        >
          Pelajari lebih lanjut
        </a>
      </div>

      <div
        id="timeline"
        ref={statsRef}
        className="reveal mt-20 flex items-center justify-center divide-x divide-white/15"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="px-8 first:pl-0 last:pr-0">
            <p className="font-display text-2xl font-bold sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-white/50 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
