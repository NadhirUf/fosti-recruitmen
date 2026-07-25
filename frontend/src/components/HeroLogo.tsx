import swirl from "../assets/fosti-swirl-only.png";

/**
 * Logo "FOSTI" versi hero — pakai gambar swirl asli sepenuhnya
 * (fosti-swirl-only.png) tanpa overlay teks tambahan.
 */
export default function HeroLogo() {
  return (
    <div className="relative mx-auto w-full max-w-md select-none sm:max-w-lg md:max-w-xl">
      <img
        src={swirl}
        alt="FOSTI - Forum Open Source Teknik Informatika"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
