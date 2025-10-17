'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer/Footer';

export default function TermsPage() {
  const { data: session, status } = useSession();
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);

  const handleToggleFooter = () => {
    if (!isFooterOpen) {
      setIsFooterOpen(true);
      setTimeout(() => {
        setFooterVisible(true);
        setTimeout(() => {
          setShowFooter(true);
        }, 100);
      }, 500);
    } else {
      setShowFooter(false);
      setTimeout(() => {
        setFooterVisible(false);
        setIsFooterOpen(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (!isFooterOpen) {
      setShowFooter(false);
    }
  }, [isFooterOpen]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setTimeout(() => {
        setIsBackgroundLoaded(true);
      }, 100);
    };
    img.src = '/background.png';
  }, []);

  return (
    <div className="bg-black flex flex-col min-h-screen">
      <Header props={{ status, session }} />
      <main className="flex justify-center mx-2 mt-2 flex-1">
        <div
          className={`bg-stone-950 rounded-lg border border-stone-700 w-full flex flex-col transition-all duration-500 ease-in-out relative ${
            isFooterOpen ? 'h-[55vh] overflow-hidden' : 'min-h-full'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div
              className={`w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-[5000ms] ease-in-out ${
                isBackgroundLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('/background.png')`,
                filter: 'brightness(0.4)',
                transform: 'scale(1.0)',
              }}
            />
          </div>

          <div className="flex flex-1 flex-col items-center justify-start px-6 text-center relative z-10 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8">
              <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

              <div className="text-left text-gray-300 space-y-6">
                <p className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    1. Acceptance of Terms
                  </h2>
                  <p>
                    By accessing and using RefineGen ("the Service"), you accept and agree to
                    be bound by the terms and provision of this agreement.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    2. Description of Service
                  </h2>
                  <p>
                    RefineGen is an AI-powered image generation service that creates custom
                    images based on user prompts and provides intelligent refinement options
                    using OpenAI's DALL-E 3 API.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    3. User Responsibilities
                  </h2>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>
                      You are responsible for maintaining the confidentiality of your account
                    </li>
                    <li>You agree to provide accurate and complete information</li>
                    <li>You will not use the service for any unlawful purpose</li>
                    <li>
                      You will not attempt to gain unauthorized access to any part of the
                      service
                    </li>
                    <li>
                      You will not violate OpenAI's content policy or generate inappropriate
                      content
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    4. Payment and Gems
                  </h2>
                  <p>
                    RefineGen uses a gem-based payment system. Gems are purchased through
                    Stripe and used to generate images. All purchases are final and
                    non-refundable unless required by law.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    5. Privacy and Data
                  </h2>
                  <p>
                    Your privacy is important to us. Please read our Privacy Policy to
                    understand how we collect, use, and protect your information.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    6. Limitation of Liability
                  </h2>
                  <p>
                    RefineGen shall not be liable for any indirect, incidental, special,
                    consequential, or punitive damages, including without limitation, loss of
                    profits, data, use, goodwill, or other intangible losses.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    7. Changes to Terms
                  </h2>
                  <p>
                    We reserve the right to modify these terms at any time. Changes will be
                    effective immediately upon posting to our website.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    8. Contact Information
                  </h2>
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Discord: .rudarz</li>
                  </ul>
                </section>
              </div>

              {/* Footer Toggle Button */}
              <div className="absolute bottom-6 right-6 z-20">
                <button
                  onClick={handleToggleFooter}
                  className={`p-2 rounded-full transition-all duration-300 ease-in-out ${
                    isFooterOpen
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-400/50'
                      : 'bg-stone-700 text-gray-300 hover:bg-stone-600 hover:text-white'
                  }`}
                  title={isFooterOpen ? 'Close Footer' : 'Open Footer'}
                >
                  <svg
                    className="w-6 h-6 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with smooth transitions */}
      <div
        className={`mt-1 mb-2 transition-all duration-500 ease-in-out ${
          showFooter ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${footerVisible ? 'flex-1' : 'h-0 overflow-hidden'} overflow-x-auto`}
      >
        <Footer props={{ status, session }} />
      </div>
    </div>
  );
}
