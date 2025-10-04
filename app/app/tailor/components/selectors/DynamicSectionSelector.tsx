'use client';

import { useState } from 'react';

interface DynamicSectionSelectorProps {
  sections?: Array<{
    name: string;
    options: string[];
  }>;
  selectedAttributes: string[];
  onAttributeToggle: (attribute: string) => void;
  isLoading?: boolean;
}

// Predefined section titles
const PREDEFINED_SECTIONS = ['Style & Aesthetic', 'Mood & Atmosphere', 'Technical Details'];

export default function DynamicSectionSelector({
  sections = [],
  selectedAttributes,
  onAttributeToggle,
  isLoading = false,
}: DynamicSectionSelectorProps) {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {PREDEFINED_SECTIONS.map((title, sectionIndex) => (
            <div
              key={sectionIndex}
              className="bg-zinc-800 rounded-lg border border-zinc-700 flex flex-col flex-1 min-h-0 animate-pulse"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            >
              <div className="px-4 py-3 flex-shrink-0">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  {/* Blank title */}
                </h4>
              </div>
              <div className="p-4 flex-1 min-h-0 overflow-y-auto">
                {/* Empty content area */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {PREDEFINED_SECTIONS.map((title, sectionIndex) => (
            <div
              key={sectionIndex}
              className="bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center flex-1 min-h-0"
            >
              <p className="text-gray-500 text-sm text-center m-0">
                Click "Refine" to generate options
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {PREDEFINED_SECTIONS.map((title, sectionIndex) => {
          const section = sections[sectionIndex];
          return (
            <div
              key={sectionIndex}
              className="bg-zinc-800 rounded-lg border border-zinc-700 flex flex-col flex-1 min-h-0"
            >
              <div className="px-4 py-3 flex-shrink-0">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  {section?.name}
                </h4>
              </div>
              <div className="px-4 flex-1 min-h-0 overflow-y-auto">
                {section && section.options ? (
                  <div className="flex flex-wrap gap-2">
                    {section.options.map(option => {
                      const isSelected = selectedAttributes.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => onAttributeToggle(option)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 max-w-32 truncate ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white'
                          }`}
                          title={option}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center">No options available</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
