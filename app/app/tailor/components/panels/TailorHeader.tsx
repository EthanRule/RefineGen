'use client';

import { useRouter } from 'next/navigation';

interface TailorHeaderProps {
  // Add any props you might need in the future
}

export default function TailorHeader({}: TailorHeaderProps) {
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

      {/* Placeholder for future header icons */}
      <div className="flex items-center space-x-4">{/* Future icons can go here */}</div>
    </div>
  );
}
