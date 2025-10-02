"use client";

import { useState } from "react";

interface StartButtonProps {
  onStart?: () => void;
}

export default function StartButton({ onStart }: StartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onStart?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
          isLoading
            ? "bg-teal-600 cursor-not-allowed"
            : "bg-teal-700 hover:bg-teal-800"
        } text-white`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          "Start Analysis"
        )}
      </button>
    </div>
  );
}
