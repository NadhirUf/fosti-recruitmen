import fostiLogo from "../assets/fosti-swirl-only.png";

export default function Footer() {
  return (
    <footer className="border-t border-base-border px-6 py-10">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <img
          src={fostiLogo}
          alt="FOSTI UMS"
          className="h-8 w-auto opacity-80"
        />
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} FOSTI UMS - Forum Open Source Teknik
          Informatika. Dibuat dengan ❤ oleh anggota FOSTI.
        </p>
      </div>
    </footer>
  );
}
