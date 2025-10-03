"use client";

import { useState } from "react";

interface DynamicSectionSelectorProps {
  sections?: Array<{
    name: string;
    options: string[];
  }>;
  selectedAttributes: string[];
  onAttributeToggle: (attribute: string) => void;
  isLoading?: boolean;
}

export default function DynamicSectionSelector({
  sections = [],
  selectedAttributes,
  onAttributeToggle,
  isLoading = false,
}: DynamicSectionSelectorProps) {
  if (isLoading) {
    return (
      <div>
        <label className="flex justify-center text-sm font-bold text-white mb-3">
          Refine Your Image
        </label>
        <div className="space-y-4">
          {[...Array(3)].map((_, sectionIndex) => (
            <div key={sectionIndex}>
              <h4 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Loading...
              </h4>
              <div className="flex flex-wrap gap-2">
                {[...Array(10)].map((_, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-gray-600 rounded-full animate-pulse"
                  >
                    <div className="w-12 h-3 bg-gray-500 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-400 text-sm mt-3">
          Generating options...
        </p>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div>
        <label className="flex justify-center text-sm font-bold text-white mb-3">
          Refine Your Image
        </label>
      </div>
    );
  }

  return (
    <div>
      <label className="flex justify-center text-sm font-bold text-white mb-3">
        Refine Your Image
      </label>
      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h4 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              {section.name}
            </h4>
            <div className="flex flex-wrap gap-2">
              {section.options.map((option) => {
                const isSelected = selectedAttributes.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => onAttributeToggle(option)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-lg transform scale-105"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-400 text-xs mt-3">
        Select attributes to refine your image (optional)
      </p>
    </div>
  );
}
