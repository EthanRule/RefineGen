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
    <div className="min-h-screen bg-black flex flex-col">
      <Header props={{ status, session }} />
      <main className="flex-1 flex justify-center mx-2 my-2 mt-4">
        <div className="bg-stone-950 rounded-lg border border-stone-700 w-full flex flex-col min-h-[calc(100vh-1rem)]">
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
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
      <div className="fixed bottom-4 right-6 z-50">
        <button
          onClick={handleToggleFooter}
          className={`p-3 rounded-full transition-all duration-300 ease-in-out ${
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

      {/* Conditional Footer */}
      {isFooterOpen && (
        <div className="animate-in slide-in-from-bottom duration-300">
          <Footer props={{ status, session }} />
        </div>
      )}
    </div>
  );
}
