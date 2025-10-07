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
    const baseClass = 'px-2 py-2 rounded-lg font-semibold transition-colors text-stone-950';

    if (isDisabled) {
      return `${baseClass} bg-cyan-400 cursor-not-allowed`;
    }

    if (isProcessing) {
      return `${baseClass} bg-cyan-600 cursor-not-allowed`;
    }

    return `${baseClass} bg-cyan-400 hover:bg-cyan-200`;
  };

  return (
    <button
      onClick={handleRefine}
      disabled={isDisabled || refineButtonState === 'refining'}
      className={`flex-1 group ${getButtonClass(
        refineButtonState === 'refining'
      )} relative overflow-hidden`}
    >
      {/* Stone-800 background with proper slanted mask */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 bg-stone-800"
        style={{
          clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      ></div>

      <div className="flex items-center justify-between w-full px-0 relative z-10">
        <span className="text-sm">{getRefineButtonText()}</span>
        <div className="flex items-center space-x-1">
          <svg
            className="w-4 h-4 text-green-400 group-hover:text-yellow-400 transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ transform: 'scaleY(-1)' }}
          >
            <path d="M12 2L6 8L12 14L18 8L12 2ZM6 8L12 14L6 20L6 8ZM18 8L12 14L18 20L18 8Z" />
          </svg>
          <span className="text-xs text-green-400 group-hover:text-yellow-400 font-semibold transition-colors">
            3
          </span>
        </div>
      </div>
    </button>
  );
}
