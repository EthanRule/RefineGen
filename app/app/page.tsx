import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import VideoSection from "./components/VideoSection";
import FeaturesSection from "./components/FeaturesSection";
import CTASection from "./components/CTASection";
import PricingSection from "./components/PricingSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <HeroSection />
        <VideoSection />
        <FeaturesSection />
        <CTASection />
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}
