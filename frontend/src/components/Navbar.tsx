import { useEffect, useRef, useState } from "react";
import fostiLogo from "../assets/fosti-swirl-only.png";

const NAV_LINKS = [
  { label: "Tentang", href: "#tentang" },
  { label: "Divisi", href: "#divisi" },
  { label: "Timeline", href: "#timeline" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("#tentang");
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [pulseHref, setPulseHref] = useState<string | null>(null);

  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lacak section mana yang sedang terlihat, lalu highlight link yang sesuai
  // -> ini yang bikin nav "hidup" mengikuti posisi scroll, bukan cuma
  // dekorasi statis.
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.href.replace("#", ""));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveHref(`#${visible[0].target.id}`);
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Posisikan garis indikator merah tepat di bawah link yang aktif
  useEffect(() => {
    const el = linkRefs.current[activeHref];
    const list = listRef.current;
    if (!el || !list) return;
    const elRect = el.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    setIndicator({
      left: elRect.left - listRect.left,
      width: elRect.width,
    });
  }, [activeHref, scrolled]);

  function handleNavClick(href: string) {
    setPulseHref(href);
    window.setTimeout(() => setPulseHref(null), 400);
    setMobileOpen(false);
    const target = document.getElementById(href.replace("#", ""));
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-base-bg/90 backdrop-blur-sm border-b border-base-border"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-content mx-auto flex items-center justify-between px-6 py-3">
        <a href="#" className="flex items-center gap-2">
          <img src={fostiLogo} alt="FOSTI UMS" className="h-11 w-auto" />
        </a>

        <ul
          ref={listRef}
          className="relative hidden md:flex items-center gap-10 text-sm font-medium text-white"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                ref={(el) => {
                  linkRefs.current[link.href] = el;
                }}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`relative inline-block py-1 transition-colors duration-200 ${
                  activeHref === link.href
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                } ${pulseHref === link.href ? "animate-nav-pulse" : ""}`}
              >
                {link.label}
              </a>
            </li>
          ))}

          {/* Indikator merah yang meluncur mengikuti link aktif */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-1 h-[2px] rounded-full bg-brand-red transition-all duration-300 ease-out"
            style={{ left: indicator.left, width: indicator.width }}
          />
        </ul>

        <a
          href="#pendaftaran"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#pendaftaran");
          }}
          className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-red/20 transition-transform hover:scale-105 active:scale-95"
        >
          Daftar Sekarang
        </a>

        <button
          type="button"
          aria-label="Buka menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="ml-3 flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-white transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-white transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Panel menu mobile - cuma nongol di layar kecil, dan cuma pas dibuka */}
      {mobileOpen && (
        <div className="border-t border-base-border bg-base-bg/95 backdrop-blur-sm md:hidden">
          <ul className="flex flex-col gap-1 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeHref === link.href
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
