'use client';

interface RefineButtonProps {
  onRefine?: () => void;
  refineButtonState?: 'refine' | 'refining';
  disabled?: boolean;
  refinementCount?: number;
  tokenCount?: number;
  isGalleryOpen?: boolean;
}

export default function RefineButton({
  onRefine,
  refineButtonState = 'refine',
  disabled = false,
  refinementCount = 0,
  tokenCount = 0,
  isGalleryOpen,
}: RefineButtonProps) {
  const handleRefine = async () => {
    if (refineButtonState === 'refining' || refinementCount >= 10) return;
    await onRefine?.();
  };

  const isAtLimit = refinementCount >= 10;
  const isDisabled = disabled || isAtLimit;
  const isInsufficientTokens = tokenCount < 3;

  const getTooltipText = () => {
    if (isAtLimit) {
      return 'Maximum 10 refinements reached. Generate an image to reset.';
    }
    if (isInsufficientTokens) {
      return `Insufficient gems. You need 3 gems to refine. You have ${tokenCount} gems.`;
    }
    return '';
  };

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

    if (isDisabled) {
      return `${baseClass} bg-cyan-400 cursor-not-allowed`;
    }

    if (isProcessing) {
      return `${baseClass} bg-cyan-600 cursor-not-allowed`;
    }

    return `${baseClass} bg-cyan-400 hover:bg-cyan-200`;
  };
  // TODO: Make this smoother right now when the gallery closes it snaps back open.
  return (
    <div className="flex flex-1 group" title={getTooltipText()}>
      {/* Main Refine Button */}
      <button
        onClick={handleRefine}
        disabled={isDisabled || refineButtonState === 'refining'}
        className={`flex-1 rounded-l-lg ${
          isGalleryOpen ? 'md-rounded-r-lg' : 'rounded-r-none'
        } ${
          isDisabled || refineButtonState === 'refining'
            ? getButtonClass(true)
            : `group-hover:bg-cyan-200 ${getButtonClass(false)}`
        }`}
      >
        <span className="text-sm">{getRefineButtonText()}</span>
      </button>

      {/* Gem Cost Button */}
      {!isGalleryOpen && (
        <button
          onClick={handleRefine}
          disabled={isDisabled || refineButtonState === 'refining'}
          className={`px-2 py-2 rounded-r-lg transition-colors ${
            refineButtonState === 'refining'
              ? 'bg-stone-900 cursor-not-allowed'
              : 'bg-stone-800 group-hover:bg-stone-700'
          }`}
        >
          <div className="flex items-center space-x-1">
            <svg
              className={`w-4 h-4 transition-colors ${
                refineButtonState === 'refining'
                  ? 'text-red-400'
                  : 'text-green-400 group-hover:text-yellow-400'
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ transform: 'scaleY(-1)' }}
            >
              <path d="M12 2L6 8L12 14L18 8L12 2ZM6 8L12 14L6 20L6 8ZM18 8L12 14L18 20L18 8Z" />
            </svg>
            <span
              className={`text-xs font-semibold transition-colors ${
                refineButtonState === 'refining'
                  ? 'text-red-400'
                  : 'text-green-400 group-hover:text-yellow-400'
              }`}
            >
              3
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
