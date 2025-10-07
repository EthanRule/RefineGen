'use client';

interface RefineButtonProps {
  onRefine?: () => void;
  refineButtonState?: 'refine' | 'refining';
  disabled?: boolean;
  refinementCount?: number;
}

export default function RefineButton({
  onRefine,
  refineButtonState = 'refine',
  disabled = false,
  refinementCount = 0,
}: RefineButtonProps) {
  const handleRefine = async () => {
    if (refineButtonState === 'refining' || refinementCount >= 10) return;
    await onRefine?.();
  };

  const isAtLimit = refinementCount >= 10;
  const isDisabled = disabled || isAtLimit;

  const getRefineButtonText = () => {
    if (isAtLimit) {
      return 'Refine';
    }

    if (refinementCount >= 7) {
      switch (refineButtonState) {
        case 'refine':
          return `Refine (${refinementCount}/10)`;
        case 'refining':
          return 'Refining...';
        default:
          return `Refine (${refinementCount}/10)`;
      }
    }

    switch (refineButtonState) {
      case 'refine':
        return 'Refine';
      case 'refining':
        return 'Refining...';
      default:
        return 'Refine';
    }
  };

  const getButtonClass = (isProcessing: boolean) => {
    const baseClass = 'px-4 py-2 rounded-lg font-semibold transition-colors text-stone-950';

    if (isDisabled || isProcessing) {
      return `${baseClass} bg-cyan-400 cursor-not-allowed`;
    }

    return `${baseClass} bg-cyan-400 hover:bg-cyan-200`;
  };

  const showRefineSpinner = refineButtonState === 'refining';

  return (
    <button
      onClick={handleRefine}
      disabled={isDisabled || refineButtonState === 'refining'}
      className={`flex-1 ${getButtonClass(showRefineSpinner)}`}
    >
      {showRefineSpinner ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">{getRefineButtonText()}</span>
        </div>
      ) : (
        <span className="text-sm">{getRefineButtonText()}</span>
      )}
    </button>
  );
}
