"use client";

import { useState } from "react";

interface CategorizedAttributeSelectorProps {
  categorizedAttributes: {
    "Art Style": string[];
    "Mood & Atmosphere": string[];
    "Technical Details": string[];
  };
  selectedAttributes: string[];
  onAttributeToggle: (attribute: string) => void;
  isLoading?: boolean;
}

export default function CategorizedAttributeSelector({
  categorizedAttributes,
  selectedAttributes,
  onAttributeToggle,
  isLoading = false,
}: CategorizedAttributeSelectorProps) {
  if (isLoading) {
    return (
      <div>
        <label className="flex justify-center text-sm font-bold text-white mb-3">
          Refine Your Image
        </label>
        <div className="space-y-4">
          {["Art Style", "Mood & Atmosphere", "Technical Details"].map(
            (category) => (
              <div key={category}>
                <h4 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-gray-600 rounded-full animate-pulse"
                    >
                      <div className="w-12 h-3 bg-gray-500 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
        <p className="text-center text-gray-400 text-sm mt-3">
          Generating suggestions...
        </p>
      </div>
    );
  }

  if (
    !categorizedAttributes ||
    Object.keys(categorizedAttributes).length === 0
  ) {
    return null;
  }

  return (
    <div>
      <label className="flex justify-center text-sm font-bold text-white mb-3">
        Refine Your Image
      </label>
      <div className="space-y-4">
        {Object.entries(categorizedAttributes).map(([category, attributes]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              {category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {attributes.map((attribute) => {
                const isSelected = selectedAttributes.includes(attribute);
                return (
                  <button
                    key={attribute}
                    onClick={() => onAttributeToggle(attribute)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-lg transform scale-105"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white"
                    }`}
                  >
                    {attribute}
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
