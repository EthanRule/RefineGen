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

    if (disabled || isProcessing) {
      return `${baseClass} bg-cyan-400 cursor-not-allowed`;
    }

    return `${baseClass} bg-cyan-400 hover:bg-cyan-200`;
  };

  const showGenerateSpinner = generateButtonState === 'generating';

  return (
    <button
      onClick={handleGenerate}
      disabled={disabled || generateButtonState === 'generating'}
      className={`flex-1 ${getButtonClass(showGenerateSpinner)}`}
    >
      {showGenerateSpinner ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">{getGenerateButtonText()}</span>
        </div>
      ) : (
        <span className="text-sm">{getGenerateButtonText()}</span>
      )}
    </button>
  );
}
