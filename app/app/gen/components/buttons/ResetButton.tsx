'use client';

interface ResetButtonProps {
  onReset?: () => void;
  disabled?: boolean;
}

export default function ResetButton({ onReset, disabled = false }: ResetButtonProps) {
  const handleReset = () => {
    if (disabled) return;
    onReset?.();
  };

  return (
    <button
      onClick={handleReset}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
        disabled
          ? 'bg-zinc-700 cursor-not-allowed opacity-50'
          : 'bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 active:scale-100 hover:scale-105'
      }`}
      title="Reset prompt and refinements"
    >
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${
          disabled ? 'text-stone-500' : 'text-stone-300 hover:text-white'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  );
}
