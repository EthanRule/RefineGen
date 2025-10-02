"use client";

import { useState } from "react";
import JobDescriptionInput from "./JobDescriptionInput";
import PromptInput from "./PromptInput";
import ResumeSelector from "./ResumeSelector";
import StartButton from "./StartButton";
import TokensDisplay from "./TokensDisplay";

interface ControlPanelProps {
  onJobDescriptionChange?: (value: string) => void;
  onResumeChange?: (file: File | null, text: string) => void;
  onPromptChange?: (value: string) => void;
  onStart?: () => void;
}

export default function ControlPanel({
  onJobDescriptionChange,
  onResumeChange,
  onPromptChange,
  onStart,
}: ControlPanelProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      <JobDescriptionInput onJobDescriptionChange={onJobDescriptionChange} />
      <PromptInput onPromptChange={onPromptChange} />
      <ResumeSelector onResumeChange={onResumeChange} />
      <StartButton onStart={onStart} />
      <TokensDisplay />
    </div>
  );
}
