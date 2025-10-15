'use client';

import { ImagePrompt } from '../inputs';
import { DynamicSectionSelector } from '../selectors';
import { RefineButton, GenerateButton, ResetButton } from '../buttons';
import { SelectedAttributesCard } from '../cards';

interface ControlPanelProps {
  onPromptChange?: (value: string) => void;
  onRefine?: () => void;
  onGenerate?: () => void;
  onReset?: () => void;
  sections?: Array<{
    name: string;
    options: string[];
  }>;
  selectedAttributes?: string[];
  onAttributeToggle?: (attribute: string) => void;
  isLoadingAttributes?: boolean;
  refineButtonState?: 'refine' | 'refining';
  generateButtonState?: 'generate' | 'generating';
  refinementCount?: number;
  tokenCount?: number;
  isLoadingTokens?: boolean;
}

export default function ControlPanel({
  onPromptChange,
  onRefine,
  onGenerate,
  onReset,
  sections = [],
  selectedAttributes = [],
  onAttributeToggle,
  isLoadingAttributes = false,
  refineButtonState = 'refine',
  generateButtonState = 'generate',
  refinementCount = 0,
  tokenCount = 0,
  isLoadingTokens = false,
}: ControlPanelProps) {
  return (
    <div className="lg:col-span-1 flex flex-col h-full">
      {/* Top Section: Prompt and Selectors */}
      <div className="flex-1 flex flex-col space-y-8 pr-2 min-h-0">
        <div className="flex-shrink-0">
          <ImagePrompt onPromptChange={onPromptChange} />
        </div>
        <div className="flex-1 min-h-0">
          <DynamicSectionSelector
            sections={sections}
            selectedAttributes={selectedAttributes}
            onAttributeToggle={onAttributeToggle || (() => {})}
            isLoading={isLoadingAttributes}
          />
        </div>
      </div>

      {/* Bottom Section: Buttons and Selected Attributes */}
      <div className="flex-shrink-0 pr-2 pt-8">
        <div className="flex gap-3">
          <ResetButton onReset={onReset} />
          <RefineButton
            onRefine={onRefine}
            refineButtonState={refineButtonState}
            refinementCount={refinementCount}
            disabled={tokenCount < 3}
            tokenCount={tokenCount}
          />
          <GenerateButton
            onGenerate={onGenerate}
            generateButtonState={generateButtonState}
            disabled={tokenCount < 10}
            tokenCount={tokenCount}
          />
        </div>
      </div>
    </div>
  );
}
