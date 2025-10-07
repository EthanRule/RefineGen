'use client';

import { ImagePrompt } from '../inputs';
import { DynamicSectionSelector } from '../selectors';
import { RefineButton, GenerateButton } from '../buttons';
import { SelectedAttributesCard } from '../cards';

interface ControlPanelProps {
  onPromptChange?: (value: string) => void;
  onRefine?: () => void;
  onGenerate?: () => void;
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
}

export default function ControlPanel({
  onPromptChange,
  onRefine,
  onGenerate,
  sections = [],
  selectedAttributes = [],
  onAttributeToggle,
  isLoadingAttributes = false,
  refineButtonState = 'refine',
  generateButtonState = 'generate',
  refinementCount = 0,
}: ControlPanelProps) {
  return (
    <div className="lg:col-span-1 flex flex-col h-full max-h-[calc(100vh-20vh)]">
      {/* Top Section: Prompt and Selectors */}
      <div className="flex-1 flex flex-col space-y-8 pr-2 min-h-0">
        <div className="flex-shrink-0">
          <ImagePrompt onPromptChange={onPromptChange} />
        </div>
        <div className="flex-1 min-h-0 max-h-[50vh] overflow-y-auto">
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
          <RefineButton
            onRefine={onRefine}
            refineButtonState={refineButtonState}
            refinementCount={refinementCount}
          />
          <GenerateButton onGenerate={onGenerate} generateButtonState={generateButtonState} />
        </div>
      </div>
    </div>
  );
}
