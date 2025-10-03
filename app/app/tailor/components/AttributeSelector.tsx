"use client";

import { useState } from "react";

interface AttributeSelectorProps {
  attributes: string[];
  selectedAttributes: string[];
  onAttributeToggle: (attribute: string) => void;
  isLoading?: boolean;
}

export default function AttributeSelector({
  attributes,
  selectedAttributes,
  onAttributeToggle,
  isLoading = false,
}: AttributeSelectorProps) {
  if (isLoading) {
    return (
      <div>
        <label className="flex justify-center text-sm font-bold text-white mb-3">
          Refine Your Image
        </label>
        <div className="flex flex-wrap gap-2 justify-center">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="px-4 py-2 bg-gray-600 rounded-full animate-pulse"
            >
              <div className="w-16 h-4 bg-gray-500 rounded"></div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-400 text-sm mt-2">
          Generating suggestions...
        </p>
      </div>
    );
  }

  if (attributes.length === 0) {
    return null;
  }

  return (
    <div>
      <label className="flex justify-center text-sm font-bold text-white mb-3">
        Refine Your Image
      </label>
      <div className="flex flex-wrap gap-2 justify-center">
        {attributes.map((attribute) => {
          const isSelected = selectedAttributes.includes(attribute);
          return (
            <button
              key={attribute}
              onClick={() => onAttributeToggle(attribute)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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
  );
}
