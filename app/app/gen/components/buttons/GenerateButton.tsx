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
    <button
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className={`flex-1 ${getButtonClass(isGenerating)}`}
    >
      <span className="text-sm">{getGenerateButtonText()}</span>
    </button>
  );
}
