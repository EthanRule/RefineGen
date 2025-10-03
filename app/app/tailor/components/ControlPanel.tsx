"use client";

import ImagePrompt from "./ImagePrompt";
import DynamicSectionSelector from "./DynamicSectionSelector";
import RefinementButtons from "./RefinementButtons";
import SelectedAttributesCard from "./SelectedAttributesCard";

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
  refineButtonState?: "refine" | "refining";
  generateButtonState?: "generate" | "generating";
}

export default function ControlPanel({
  onPromptChange,
  onRefine,
  onGenerate,
  sections = [],
  selectedAttributes = [],
  onAttributeToggle,
  isLoadingAttributes = false,
  refineButtonState = "refine",
  generateButtonState = "generate",
}: ControlPanelProps) {
  return (
    <div className="lg:col-span-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        <ImagePrompt onPromptChange={onPromptChange} />
        <DynamicSectionSelector
          sections={sections}
          selectedAttributes={selectedAttributes}
          onAttributeToggle={onAttributeToggle || (() => {})}
          isLoading={isLoadingAttributes}
        />
        <RefinementButtons
          onRefine={onRefine}
          onGenerate={onGenerate}
          refineButtonState={refineButtonState}
          generateButtonState={generateButtonState}
        />
        <SelectedAttributesCard
          selectedAttributes={selectedAttributes}
          onAttributeRemove={onAttributeToggle || (() => {})}
        />
      </div>
    </div>
  );
}
