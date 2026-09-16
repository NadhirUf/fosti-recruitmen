import fostiLogo from "../assets/fosti-swirl-only.png";
import teamPhoto from "../assets/closed/team-2026.png";
import thankYou from "../assets/closed/thank-you.svg";
import ClosedParticles from "./ClosedParticles";

/**
 * Layar penutup open recruitment.
 *
 * Sengaja TIDAK memuat satupun elemen interaktif: tidak ada <a>, <button>,
 * <input>, maupun handler onClick. Jadi begitu layar ini muncul, website
 * memang sudah tidak bisa diapa-apain lagi selain dibaca.
 *
 * Layout:
 * - mobile  : foto di atas, tulisan "Thank you..." full-width di bawah foto
 *             (kalau ditumpuk di atas foto, hurufnya jadi terlalu kecil)
 * - sm ke atas: tulisan ditumpuk di tengah foto, persis desain Figma
 *
 * Animasi:
 * - background "aurora" blur yang berputar & dua glow merah yang melayang
 *   pelan, bikin latar tidak terasa statis
 * - partikel/confetti kecil yang naik terus-menerus (lihat ClosedParticles)
 * - foto angkatan zoom-in perlahan (Ken Burns) supaya terasa hidup
 * - tiap elemen teks/logo muncul bertahap (fade + naik) saat halaman dibuka
 */
export default function RecruitmentClosed() {
  return (
    <main className="relative flex min-h-[100svh] w-full select-none flex-col items-center justify-center overflow-hidden px-5 py-14 text-center sm:px-8 sm:py-16">
      {/* Lampu merah besar yang berputar mengelilingi layar */}
      <div aria-hidden className="closed-orbit">
        <div className="closed-orbit-inner">
          <span className="closed-orbit-blob closed-orbit-blob-1" />
          <span className="closed-orbit-blob closed-orbit-blob-2" />
          <span className="closed-orbit-blob closed-orbit-blob-3" />
        </div>
      </div>

      {/* Tekstur grid titik-titik halus, bikin latar tidak polos */}
      <div aria-hidden className="closed-grid" />

      {/* Confetti / partikel melayang naik */}
      <ClosedParticles />

      <div className="closed-stage relative z-10 flex w-full max-w-4xl flex-col items-center">
        {/* --- Logo --- */}
        <img
          src={fostiLogo}
          alt="FOSTI UMS"
          className="closed-item h-12 w-auto sm:h-14"
          style={{ animationDelay: "0ms" }}
        />

        {/* --- Badge status --- */}
        <p
          className="closed-item closed-badge mt-5 rounded-full border border-brand-red/60 px-4 py-1.5 text-[11px] font-medium tracking-wide text-brand-red sm:text-xs"
          style={{ animationDelay: "120ms" }}
        >
          Open Recruitment 2026 telah ditutup
        </p>

        {/* Judul asli untuk screen reader & SEO, karena teksnya berupa gambar */}
        <h1 className="sr-only">
          Thank you for joining with us — see you in 2027. Open Recruitment
          FOSTI UMS 2026 telah ditutup.
        </h1>

        {/* --- Foto angkatan --- */}
        <figure
          className="closed-item relative mt-8 w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60 sm:mt-10 sm:rounded-[18px]"
          style={{ animationDelay: "240ms" }}
        >
          <img
            src={teamPhoto}
            alt="Foto bersama keluarga besar FOSTI UMS"
            width={807}
            height={453}
            draggable={false}
            className="closed-photo-zoom block h-auto w-full"
          />

          {/* Scrim gelap supaya tulisan putih tetap terbaca di atas foto */}
          <div
            aria-hidden
            className="absolute inset-0 hidden bg-gradient-to-b from-black/25 via-black/55 to-black/25 sm:block"
          />

          {/* Tulisan di atas foto (desktop / tablet) */}
          <img
            src={thankYou}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute left-1/2 top-1/2 hidden w-[92%] -translate-x-1/2 -translate-y-1/2 sm:block"
          />
        </figure>

        {/* Tulisan di bawah foto (mobile) */}
        <img
          src={thankYou}
          alt=""
          aria-hidden
          draggable={false}
          className="closed-item mt-7 w-full sm:hidden"
          style={{ animationDelay: "320ms" }}
        />

        {/* --- Keterangan --- */}
        <p
          className="closed-item mt-8 max-w-xl text-balance text-sm leading-relaxed text-white/60 sm:mt-10 sm:text-base"
          style={{ animationDelay: "420ms" }}
        >
          Masa pendaftaran Open Recruitment FOSTI UMS 2026 sudah berakhir dan
          formulir tidak lagi menerima data baru. Terima kasih untuk setiap
          teman yang sudah mendaftar dan mempercayakan langkahnya di sini.
        </p>
        <p
          className="closed-item mt-3 max-w-xl text-balance text-sm leading-relaxed text-white/40 sm:text-base"
          style={{ animationDelay: "500ms" }}
        >
          Informasi tahap selanjutnya akan disampaikan melalui kontak yang kamu
          isi saat mendaftar. Sampai jumpa di tahun berikutnya.
        </p>

        {/* --- Footer --- */}
        <div
          aria-hidden
          className="closed-item mt-10 h-px w-24 bg-white/15"
          style={{ animationDelay: "580ms" }}
        />
        <p
          className="closed-item mt-5 text-[11px] uppercase tracking-[0.2em] text-white/35 sm:text-xs"
          style={{ animationDelay: "640ms" }}
        >
          FOSTI UMS · Forum Open Source Teknik Informatika
        </p>
      </div>
    </main>
  );
}
