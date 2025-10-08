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
    const baseClass = 'px-4 py-2 rounded-lg font-semibold transition-colors text-stone-950';

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
    <div className="flex flex-1 group">
      {/* Main Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        className={`flex-1 rounded-l-lg rounded-r-none ${
          disabled || isGenerating
            ? getButtonClass(isGenerating)
            : `group-hover:bg-cyan-200 ${getButtonClass(isGenerating)}`
        }`}
      >
        <span className="text-sm">{getGenerateButtonText()}</span>
      </button>

      {/* Gem Cost Button */}
      <button
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        className={`px-2 py-2 rounded-r-lg transition-colors ${
          disabled || isGenerating
            ? 'bg-stone-900 cursor-not-allowed'
            : 'bg-stone-800 group-hover:bg-stone-700'
        }`}
      >
        <div className="flex items-center space-x-1">
          <svg
            className={`w-4 h-4 transition-colors ${
              disabled || isGenerating
                ? 'text-red-400'
                : 'text-green-400 group-hover:text-red-400'
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ transform: 'scaleY(-1)' }}
          >
            <path d="M12 2L6 8L12 14L18 8L12 2ZM6 8L12 14L6 20L6 8ZM18 8L12 14L18 20L18 8Z" />
          </svg>
          <span
            className={`text-xs font-semibold transition-colors ${
              disabled || isGenerating
                ? 'text-red-400'
                : 'text-green-400 group-hover:text-red-400'
            }`}
          >
            10
          </span>
        </div>
      </button>
    </div>
  );
}
