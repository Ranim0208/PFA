import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import Hero from "../components/homepage/hero-section";
import HeroSectionSlide from "../components/homepage/hero-section-slide";
import KpiSection from "../components/homepage/Kpi-section";
import PartnersSlider from "../components/homepage/partners-section";
export default function Homapage() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <HeroSectionSlide />
        <KpiSection />
        <PartnersSlider />
      </main>
      <Footer />
    </div>
  );
}
