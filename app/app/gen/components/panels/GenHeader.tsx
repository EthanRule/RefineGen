'use client';

import { useRouter } from 'next/navigation';

interface GenHeaderProps {
  onToggleGallery?: () => void;
  isGalleryOpen?: boolean;
}

export default function GenHeader({ onToggleGallery, isGalleryOpen }: GenHeaderProps) {
  const router = useRouter();

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

      {/* Gallery Toggle Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleGallery}
          className={`p-2 rounded-lg transition-colors ${
            isGalleryOpen
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-zinc-800'
          }`}
          title={isGalleryOpen ? 'Close Gallery' : 'Open Gallery'}
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
