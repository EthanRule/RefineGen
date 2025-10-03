"use client";

import { useState } from "react";

interface StartButtonProps {
  onStart?: () => void;
  buttonState?: "begin" | "processing" | "generate" | "generating";
  disabled?: boolean;
}

export default function StartButton({
  onStart,
  buttonState = "begin",
  disabled = false,
}: StartButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    if (buttonState === "generating") return;

    setIsGenerating(true);
    try {
      await onStart?.();
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonText = () => {
    switch (buttonState) {
      case "begin":
        return "Begin";
      case "processing":
        return "Processing...";
      case "generate":
        return "Generate Image";
      case "generating":
        return "Generating...";
      default:
        return "Begin";
    }
  };

  const getButtonClass = () => {
    const baseClass =
      "w-full px-6 py-3 rounded-lg font-semibold transition-colors text-white";

    if (
      disabled ||
      buttonState === "processing" ||
      buttonState === "generating"
    ) {
      return `${baseClass} bg-purple-600 cursor-not-allowed`;
    }

    return `${baseClass} bg-purple-800 hover:bg-purple-900`;
  };

  const showSpinner =
    buttonState === "processing" ||
    buttonState === "generating" ||
    isGenerating;

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={
          disabled ||
          buttonState === "processing" ||
          buttonState === "generating"
        }
        className={getButtonClass()}
      >
        {showSpinner ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>{getButtonText()}</span>
          </div>
        ) : (
          getButtonText()
        )}
      </button>
    </div>
  );
}
