"use client";

import { useState, useRef, useEffect } from "react";

interface ImagePromptProps {
  onPromptChange?: (value: string) => void;
}

export default function ImagePrompt({ onPromptChange }: ImagePromptProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onPromptChange?.(newValue);

    // Calculate target height
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";

      const maxHeight = 125; // 5 lines * ~25px per line
      const targetHeight = Math.min(textarea.scrollHeight, maxHeight);

      // Set height directly for smooth expansion
      textarea.style.height = `${targetHeight}px`;
    }
  };

  // Set initial height on mount
  useEffect(() => {
    if (textareaRef.current && !value) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      const initialHeight = Math.max(textarea.scrollHeight, 40); // Ensure at least 40px
      textarea.style.height = `${initialHeight}px`;
    }
  }, []);

  return (
    <div>
      <label className="flex justify-center text-sm font-bold text-white mb-2">
        Image Prompt
      </label>
      <textarea
        ref={textareaRef}
        value={value}
        style={{
          boxSizing: "border-box",
          padding: "var(--padding-y, 8px) var(--padding-x, 12px)",
          transition: "height 300ms ease-out",
        }}
        className="w-full bg-zinc-700 text-white rounded-lg focus:outline-none resize-none placeholder-gray-400 overflow-hidden"
        placeholder="Enter your image prompt here..."
        onChange={handleChange}
        rows={1}
      />
    </div>
  );
}
