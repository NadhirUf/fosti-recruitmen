import { useMemo } from "react";

type Particle = {
  id: number;
  left: number; // posisi horizontal, dalam %
  size: number; // px
  duration: number; // detik
  delay: number; // detik
  drift: number; // px, seberapa jauh melayang ke samping
  rotate: number; // derajat rotasi akhir
  shape: "dot" | "strip";
  color: string;
};

const COLORS = [
  "#e10600", // brand red
  "#ff6b6b", // red lembut
  "#ffe2e2", // pink pucat
  "#ffffff", // putih
  "#ffd166", // gold hangat, aksen pesta
];

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const shape: Particle["shape"] = Math.random() < 0.55 ? "dot" : "strip";
    return {
      id: i,
      left: Math.random() * 100,
      size: shape === "dot" ? 4 + Math.random() * 6 : 6 + Math.random() * 8,
      duration: 9 + Math.random() * 10,
      delay: Math.random() * -18, // negatif = sebagian mulai "di tengah jalan"
      drift: (Math.random() - 0.5) * 140,
      rotate: Math.random() * 360,
      shape,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  });
}

/**
 * Lapisan partikel/confetti yang melayang naik pelan-pelan dari bawah layar.
 * Murni dekoratif (aria-hidden, pointer-events-none) dan pakai CSS animation
 * saja (transform + opacity) supaya ringan di HP.
 */
export default function ClosedParticles() {
  // useMemo supaya posisi acaknya cuma dihitung sekali saat mount,
  // tidak "meloncat" tiap kali komponen re-render.
  const particles = useMemo(() => makeParticles(26), []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={
            p.shape === "dot" ? "closed-particle-dot" : "closed-particle-strip"
          }
          style={
            {
              left: `${p.left}%`,
              width: p.shape === "dot" ? p.size : p.size * 0.35,
              height: p.shape === "dot" ? p.size : p.size,
              backgroundColor: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": `${p.drift}px`,
              "--rotate": `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
