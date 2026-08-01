import { useScrollReveal } from "../hooks/useScrollReveal";
import teamPhoto from "../assets/team-photo.jpg";
import FWarpLogo from "./FWarpLogo";
import TIWarpLogo from "./TIWarpLogo";
import OSLogo from "./OSLogo";

export default function About() {
  const artRef = useScrollReveal<HTMLDivElement>();
  const photoRef = useScrollReveal<HTMLDivElement>({ delayMs: 150 });
  const textLeftRef = useScrollReveal<HTMLParagraphElement>({ delayMs: 250 });
  const textRightRef = useScrollReveal<HTMLParagraphElement>({
    delayMs: 350,
  });

  return (
    <section id="tentang" className="overflow-x-hidden px-6 py-24">
      <div className="mx-auto max-w-content">
        {/* Wordmark "F...OS...TI" mengapit & menimpa foto tim, sesuai desain
              Figma: F & TI nyelip di belakang foto (vector asli, layer warna +
              transparan), OS jadi coretan SVG merah yang menimpa foto. */}
        <div ref={artRef} className="reveal relative mx-auto max-w-3xl">
          <div
            ref={photoRef}
            className="reveal relative z-10 w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
          >
            <img
              src={teamPhoto}
              alt="Foto bersama anggota FOSTI UMS"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Wordmark "F" + "OS" + "TI" dikelompokkan jadi satu flex row biar
                rapat & center sebagai satu kesatuan (bukan lagi ditempel ke
                tepi kiri/kanan foto). Margin negatif dipakai buat "kerning"
                supaya tiap bagian saling tindih dikit, senada. */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="flex items-center select-none opacity-90">
              <div className="relative z-10 -mr-[18px] w-[177px] sm:-mr-[30px] sm:w-[255px] md:-mr-[38px] md:w-[322px]">
                <FWarpLogo />
              </div>

              {/* OS - tetap paling atas (z-30) menimpa F & TI. Lebar naik
                    seiring F membesar, biar tingginya tetap sama-sama besar. */}
              <div className="relative z-30 w-[263px] sm:w-[380px] md:w-[480px]">
                <OSLogo />
              </div>

              <div className="relative z-10 -ml-[17px] w-[149px] sm:-ml-[24px] sm:w-[222px] md:-ml-[32px] md:w-[284px]">
                <TIWarpLogo />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 text-sm text-white/60 sm:text-base md:grid-cols-2 md:gap-16">
          <p ref={textLeftRef} className="reveal leading-relaxed">
            FOSTI adalah ruang bagi mahasiswa Teknik Informatika untuk
            berkembang lewat semangat keterbukaan: belajar bersama, berbagi
            ilmu, dan membangun proyek open source secara kolaboratif.
          </p>
          <p ref={textRightRef} className="reveal leading-relaxed">
            Setiap anggota memulai dari rasa ingin tahu. Di sinilah ide kecil
            tumbuh jadi karya nyata, lewat diskusi, eksperimen, dan dukungan
            dari komunitas yang saling percaya.
          </p>
        </div>
      </div>
    </section>
  );
}
