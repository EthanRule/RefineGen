'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer/Footer';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);

  const handleGetStarted = () => {
    if (status === 'authenticated') {
      router.push('/gen');
    } else {
      router.push('/auth?callbackUrl=/gen');
    }
  };

  const handleToggleFooter = () => {
    if (!isFooterOpen) {
      // Opening footer: start the transition
      setIsFooterOpen(true);
      // Wait 500ms for START box to finish transitioning, then give footer space
      setTimeout(() => {
        setFooterVisible(true); // Give footer space first
        // Wait a bit more for space to be allocated, then fade in
        setTimeout(() => {
          setShowFooter(true); // Show footer after space is allocated
        }, 100);
      }, 500);
    } else {
      // Closing footer: fade out first, then deallocate space
      setShowFooter(false);
      // Wait 500ms for footer to fade out, then deallocate space
      setTimeout(() => {
        setFooterVisible(false); // Remove footer space after fade
        setIsFooterOpen(false);
      }, 500);
    }
  };

  // Reset showFooter when isFooterOpen changes to false
  useEffect(() => {
    if (!isFooterOpen) {
      setShowFooter(false);
    }
  }, [isFooterOpen]);

  // Handle background image loading and fade-in
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      // Wait for image to render, then start fade-in
      setTimeout(() => {
        setIsBackgroundLoaded(true);
      }, 100);
    };
    img.src = '/background.png';
  }, []);

  return (
    <div className="bg-black flex flex-col h-screen overflow-hidden">
      <Header props={{ status, session }} />
      <main className="flex justify-center mx-2 mt-2 flex-1">
        <div
          className={`bg-stone-950 rounded-lg border border-stone-700 w-full flex flex-col transition-all duration-500 ease-in-out relative overflow-hidden ${
            isFooterOpen ? 'h-[55vh]' : 'h-full'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div
              className={`w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-[10000ms] ease-out ${
                isBackgroundLoaded ? 'opacity-100 scale-105' : 'opacity-0 scale-100 rotate-1'
              }`}
              style={{
                backgroundImage: `url('/background.png')`,
                filter: ' brightness(0.8)',
                transform: 'scale(1.0)',
              }}
            />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-cyan-400 hover:bg-blue-500 text-black px-12 py-6 rounded-xl text-2xl font-bold shadow-lg hover:shadow-xl shadow-cyan-400/50 transform active:scale-103 hover:scale-105 transition-all duration-500 ease-initial sm:min-w-[400px]">
                Message .rudarz on discord.
              </div>
            </div>
          </div>

          {/* Footer Toggle Button - Inside the stone-950 box */}
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
      </main>

      {/* Footer with smooth transitions */}
      <div
        className={`mt-2 mb-2 ${
          showFooter ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${
          footerVisible ? 'flex-1' : 'h-0 overflow-hidden'
        } overflow-x-auto transition-opacity duration-500 ease-in-out`}
      >
        <Footer props={{ status, session }} />
      </div>
    </div>
  );
}
