"use client";

import { useSession } from "next-auth/react";
import Header from "./components/Header";
import Footer from "./components/footer/Footer";
import HeroSection from "./components/sections/HeroSection";
import VideoSection from "./components/sections/VideoSection";
import FeaturesSection from "./components/sections/FeaturesSection";
import PricingSection from "./components/sections/PricingSection";

export default function Home() {
  const { data: session, status } = useSession();
  return (
    <div className="min-h-screen bg-gray-900">
      <Header props={{ status, session }} />
      <main>
        <HeroSection />
        <VideoSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer props={{ status, session }} />
    </div>
  );
}
