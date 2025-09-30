"use client";

import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-blue-600">Tailor</span>Apply
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Pricing
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-white text-black border-2 border-black px-6 py-2 rounded-lg hover:bg-gray-100 hover:border-gray-400 hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2">
              <img src="/github.png" alt="GitHub" className="w-5 h-5" />
              Sign up
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <a
                href="#features"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                How it Works
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Pricing
              </a>
              <button className="block w-full text-left px-3 py-2 bg-white text-black border border-black rounded-lg hover:bg-gray-100 hover:border-gray-400 hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2">
                <img src="/github.png" alt="GitHub" className="w-5 h-5" />
                Sign up
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
