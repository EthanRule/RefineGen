'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/footer/Footer';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFooterOpen, setIsFooterOpen] = useState(false);

  const handleGetStarted = () => {
    if (status === 'authenticated') {
      router.push('/gen');
    } else {
      router.push('/auth?callbackUrl=/gen');
    }
  };

  const handleToggleFooter = () => {
    setIsFooterOpen(prev => !prev);
  };

  return (
    <div className="bg-black flex flex-col min-h-screen">
      <Header props={{ status, session }} />
      <main className="flex justify-center mx-2 mt-2 mb-1">
        <div
          className={`bg-stone-950 rounded-lg border border-stone-700 w-full flex flex-col transition-all duration-300 ease-in-out ${
            isFooterOpen ? 'h-[55vh]' : 'h-[calc(100vh-5.5rem)]'
          }`}
        >
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleGetStarted}
                className="bg-cyan-400 hover:bg-cyan-200 text-black px-12 py-6 rounded-xl text-2xl font-bold shadow-lg hover:shadow-xl shadow-cyan-400/50 transform hover:scale-105 transition-all duration-500 ease-initial sm:min-w-[400px]"
              >
                START
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Footer Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
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

      {/* Footer with smooth transitions */}
      <div
        className={`mt-1 transition-all duration-300 ease-in-out ${
          isFooterOpen
            ? 'opacity-100 translate-y-0 h-auto'
            : 'opacity-0 translate-y-full pointer-events-none h-0 overflow-hidden'
        }`}
      >
        <Footer props={{ status, session }} />
      </div>
    </div>
  );
}
