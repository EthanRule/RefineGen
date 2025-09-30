"use client";

import { useState } from "react";
import HeaderLogo from "./header/HeaderLogo";
import HeaderNavigation from "./header/HeaderNavigation";
import HeaderButton from "./header/HeaderButton";
import MobileMenuButton from "./header/MobileMenuButton";
import MobileMenu from "./header/MobileMenu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <HeaderLogo />

          <HeaderNavigation />

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <HeaderButton href="/api/auth/signin">
              <img src="/github.png" alt="GitHub" className="w-5 h-5" />
              Sign up
            </HeaderButton>
          </div>

          <MobileMenuButton
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>

        <MobileMenu isMenuOpen={isMenuOpen} />
      </div>
    </header>
  );
}
