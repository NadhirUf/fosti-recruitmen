import { useEffect, type HTMLAttributes } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import DivisionShowcase from "./components/DivisionShowcase";
import FeaturedSplit from "./components/FeaturedSplit";
import RegistrationForm from "./components/RegistrationForm";
import Footer from "./components/Footer";
import RecruitmentClosed from "./components/RecruitmentClosed";

import { CLOSED_MODE, RECRUITMENT_CLOSED } from "./config";

import ristek1 from "./assets/divisi/ristek_1.jpg";
import ristek2 from "./assets/divisi/ristek_2.jpg";
import ristek3 from "./assets/divisi/ristek_3.jpg";
import ristek4 from "./assets/divisi/ristek_4.jpg";
import ristek5 from "./assets/divisi/ristek_5.jpg";

import keor1 from "./assets/divisi/keor-1.jpg";
import keor2 from "./assets/divisi/keor-2.jpg";
import keor3 from "./assets/divisi/keor-3.jpg";
import keor4 from "./assets/divisi/keor-4.jpg";
import keor5 from "./assets/divisi/keor-5.jpg";

import hubpub1 from "./assets/divisi/hubpub-1.jpg";
import hubpub2 from "./assets/divisi/hubpub-2.jpg";
import hubpub3 from "./assets/divisi/hubpub-3.jpg";
import hubpub4 from "./assets/divisi/hubpub-4.jpg";
import hubpub5 from "./assets/divisi/hubpub-5.jpg";

/* `inert` bikin seluruh isi div tidak bisa diklik, di-tab, maupun difokus.
   Ditulis sebagai atribut string biar aman di React 18 maupun 19. */
const INERT = { inert: "" } as unknown as HTMLAttributes<HTMLDivElement>;

function SiteContent() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />

        <div id="divisi">
          <DivisionShowcase
            id="divisi-riset"
            title="Divisi Riset dan Teknologi"
            photos={[ristek1, ristek2, ristek3, ristek4, ristek5]}
          />

          <FeaturedSplit
            items={[
              {
                src: ristek5,
                caption: "Divisi Riset dan Teknologi",
                objectPosition: "center 85%",
              },
              { src: keor5, caption: "Divisi Keorganisasian" },
            ]}
          />

          <DivisionShowcase
            id="divisi-keorganisasian"
            title="Divisi Keorganisasian"
            photos={[keor1, keor2, keor3, keor4, keor5]}
          />

          <FeaturedSplit
            items={[
              { src: keor2, caption: "Divisi Keorganisasian" },
              {
                src: hubpub1,
                caption: "Divisi Hubungan Publik",
                objectPosition: "center 65%",
              },
            ]}
          />

          <DivisionShowcase
            id="divisi-humas"
            title="Divisi Hubungan Publik"
            photos={[hubpub1, hubpub2, hubpub3, hubpub4, hubpub5]}
          />
        </div>

        <RegistrationForm />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const closedAsOverlay = RECRUITMENT_CLOSED && CLOSED_MODE === "overlay";

  // Kunci scroll halaman di belakang selama overlay penutup tampil.
  useEffect(() => {
    if (!closedAsOverlay) return;
    document.body.classList.add("recruitment-closed");
    return () => document.body.classList.remove("recruitment-closed");
  }, [closedAsOverlay]);

  // Mode "replace": website lama tidak dirender sama sekali.
  if (RECRUITMENT_CLOSED && CLOSED_MODE === "replace") {
    return (
      <div className="min-h-screen bg-base-bg text-white antialiased">
        <RecruitmentClosed />
      </div>
    );
  }

  // Mode "overlay": website lama tetap terlihat samar di belakang, tapi
  // dibekukan total (blur + pointer-events none + inert + aria-hidden).
  if (closedAsOverlay) {
    return (
      <div className="min-h-screen bg-base-bg text-white antialiased">
        <div className="closed-backdrop" aria-hidden {...INERT}>
          <SiteContent />
        </div>
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
          <RecruitmentClosed />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-bg text-white antialiased">
      <SiteContent />
    </div>
  );
}
