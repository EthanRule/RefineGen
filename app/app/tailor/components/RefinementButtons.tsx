"use client";

import { useState } from "react";

interface RefinementButtonsProps {
  onRefine?: () => void;
  onGenerate?: () => void;
  refineButtonState?: "refine" | "refining";
  generateButtonState?: "generate" | "generating";
  disabled?: boolean;
}

export default function RefinementButtons({
  onRefine,
  onGenerate,
  refineButtonState = "refine",
  generateButtonState = "generate",
  disabled = false,
}: RefinementButtonsProps) {
  const [isRefining, setIsRefining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRefine = async () => {
    if (refineButtonState === "refining") return;

    setIsRefining(true);
    try {
      await onRefine?.();
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerate = async () => {
    if (generateButtonState === "generating") return;

    setIsGenerating(true);
    try {
      await onGenerate?.();
    } finally {
      setIsGenerating(false);
    }
  };

  const getRefineButtonText = () => {
    switch (refineButtonState) {
      case "refine":
        return "Refine";
      case "refining":
        return "Refining...";
      default:
        return "Refine";
    }
  };

  const getGenerateButtonText = () => {
    switch (generateButtonState) {
      case "generate":
        return "Generate Image";
      case "generating":
        return "Generating...";
      default:
        return "Generate Image";
    }
  };

  const getButtonClass = (isProcessing: boolean) => {
    const baseClass =
      "px-4 py-2 rounded-lg font-semibold transition-colors text-white";

    if (disabled || isProcessing) {
      return `${baseClass} bg-purple-600 cursor-not-allowed`;
    }

    return `${baseClass} bg-purple-800 hover:bg-purple-900`;
  };

  const showRefineSpinner = refineButtonState === "refining" || isRefining;
  const showGenerateSpinner =
    generateButtonState === "generating" || isGenerating;

  return (
    <div className="flex gap-3">
      <button
        onClick={handleRefine}
        disabled={disabled || refineButtonState === "refining"}
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

      <button
        onClick={handleGenerate}
        disabled={disabled || generateButtonState === "generating"}
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
    </div>
  );
}
