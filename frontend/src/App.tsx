import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import DivisionShowcase from "./components/DivisionShowcase";
import FeaturedSplit from "./components/FeaturedSplit";
import RegistrationForm from "./components/RegistrationForm";
import Footer from "./components/Footer";

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

export default function App() {
  return (
    <div className="min-h-screen bg-base-bg text-white antialiased">
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
    </div>
  );
}
