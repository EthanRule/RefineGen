"use client";

import ImagePrompt from "./ImagePrompt";
import StartButton from "./StartButton";
import TokensDisplay from "./TokensDisplay";

interface ControlPanelProps {
  onPromptChange?: (value: string) => void;
  onStart?: () => void;
}

export default function ControlPanel({
  onPromptChange,
  onStart,
}: ControlPanelProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      <ImagePrompt onPromptChange={onPromptChange} />
      <StartButton onStart={onStart} />
      <TokensDisplay />
    </div>
  );
}
