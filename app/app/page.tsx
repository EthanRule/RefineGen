import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import VideoSection from "./components/VideoSection";
import FeaturesSection from "./components/FeaturesSection";
import PricingSection from "./components/PricingSection";

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
