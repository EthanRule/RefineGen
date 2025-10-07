'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface GenHeaderProps {
  onToggleGallery?: () => void;
  isGalleryOpen?: boolean;
  tokenCount?: number;
}

export default function GenHeader({
  onToggleGallery,
  isGalleryOpen,
  tokenCount = 0,
}: GenHeaderProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleGalleryToggle = () => {
    if (isMobile) {
      // On mobile, navigate to mobile gallery page
      router.push('/gen/mobile-gallery');
    } else {
      // On desktop, toggle the sidebar
      onToggleGallery?.();
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
      <button
        onClick={() => router.push('/')}
        className="text-white hover:bg-zinc-800 active:bg-zinc-700 rounded-lg hover:text-gray-300 transition-colors p-1"
        title="Go to Homepage"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </button>

      {/* Right Side: Token Count, Gem Icon, and Gallery Button */}
      <div className="flex items-center space-x-4">
        {/* Token Count and Gem Icon */}
        <button
          onClick={() => router.push('/gems')}
          className="flex items-center space-x-2 cursor-pointer group hover:bg-zinc-800 rounded-lg p-1 px-2 active:bg-zinc-700"
          title="Purchase Gems"
        >
          <span className="text-white font-semibold text-lg group-hover:text-green-200 transition-colors">
            {tokenCount}
          </span>
          <div className="relative">
            <svg
              className="w-6 h-6 text-green-400 group-hover:rotate-180 transition-transform duration-300"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ transform: 'scaleY(-1)' }}
            >
              <path d="M12 2L6 8L12 14L18 8L12 2ZM6 8L12 14L6 20L6 8ZM18 8L12 14L18 20L18 8Z" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-green-600 rounded-full opacity-20"></div>
          </div>
        </button>
        <button
          onClick={handleGalleryToggle}
          className={`p-2 rounded-lg transition-colors ${
            isGalleryOpen && !isMobile
              ? 'bg-cyan-600 text-white'
              : 'text-white-400 hover:text-white hover:bg-zinc-800 active:bg-zinc-700'
          }`}
          title={isMobile ? 'Open Gallery' : isGalleryOpen ? 'Close Gallery' : 'Open Gallery'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
