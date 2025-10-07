'use client';

interface GenerateButtonProps {
  onGenerate?: () => void;
  generateButtonState?: 'generate' | 'generating';
  disabled?: boolean;
}

export default function GenerateButton({
  onGenerate,
  generateButtonState = 'generate',
  disabled = false,
}: GenerateButtonProps) {
  const handleGenerate = async () => {
    if (generateButtonState === 'generating') return;
    await onGenerate?.();
  };

  const getGenerateButtonText = () => {
    switch (generateButtonState) {
      case 'generate':
        return 'Generate';
      case 'generating':
        return 'Generating...';
      default:
        return 'Generate';
    }
  };

  const getButtonClass = (isProcessing: boolean) => {
    const baseClass = 'px-1 py-2 rounded-lg font-semibold transition-colors text-stone-950';

    if (disabled) {
      return `${baseClass} bg-cyan-400 cursor-not-allowed`;
    }

    if (isProcessing) {
      return `${baseClass} bg-cyan-600 cursor-not-allowed`;
    }

    return `${baseClass} bg-cyan-400 hover:bg-cyan-200`;
  };

  const isGenerating = generateButtonState === 'generating';

  return (
    <button
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className={`flex-1 group ${getButtonClass(isGenerating)} relative overflow-hidden`}
    >
      {/* Stone-800 background with proper slanted mask */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 bg-stone-800"
        style={{
          clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      ></div>

      <div className="flex items-center justify-between w-full px-0 relative z-10">
        <span className="text-sm">{getGenerateButtonText()}</span>
        <div className="flex items-center space-x-1">
          <svg
            className="w-4 h-4 text-green-400 group-hover:text-red-400 transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ transform: 'scaleY(-1)' }}
          >
            <path d="M12 2L6 8L12 14L18 8L12 2ZM6 8L12 14L6 20L6 8ZM18 8L12 14L18 20L18 8Z" />
          </svg>
          <span className="text-xs text-green-400 group-hover:text-red-400 font-semibold transition-colors">
            10
          </span>
        </div>
      </div>
    </button>
  );
}
