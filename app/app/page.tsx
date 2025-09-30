import Header from "./components/Header";
import Footer from "./components/footer/Footer";
import HeroSection from "./components/sections/HeroSection";
import VideoSection from "./components/sections/VideoSection";
import FeaturesSection from "./components/sections/FeaturesSection";
import PricingSection from "./components/sections/PricingSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-800">
      <Header />

      <main>
        <HeroSection />
        <VideoSection />
        <FeaturesSection />
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}
