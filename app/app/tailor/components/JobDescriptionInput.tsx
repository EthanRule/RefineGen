"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface JobDescriptionInputProps {
  onJobDescriptionChange?: (value: string) => void;
}

export default function JobDescriptionInput({
  onJobDescriptionChange,
}: JobDescriptionInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentHeightRef = useRef<number>(0);

  const animateHeight = useCallback((targetHeight: number) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const startHeight = currentHeightRef.current; // Use tracked height, not DOM height
    const startTime = performance.now();
    const duration = 300; // milliseconds

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      const currentHeight =
        startHeight + (targetHeight - startHeight) * easeOutCubic;

      // Fix height and scroll behavior to keep text stable
      textarea.style.height = `${currentHeight}px`;
      textarea.scrollTop = 0; // Prevent text from jumping

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        textarea.style.height = `${targetHeight}px`;
        textarea.scrollTop = 0;
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onJobDescriptionChange?.(newValue);

    // Calculate target height
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";

      const maxHeight = 125; // 5 lines * ~25px per line
      const targetHeight = Math.min(textarea.scrollHeight, maxHeight);

      // Disable animation to prevent cursor jumping, just set height directly
      textarea.style.height = `${targetHeight}px`;
      currentHeightRef.current = targetHeight;
    }
  };

  // Set initial height on mount
  const setInitialHeight = () => {
    if (textareaRef.current && !value) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      const initialHeight = Math.max(textarea.scrollHeight, 40); // Ensure at least 40px
      textarea.style.height = `${initialHeight}px`;
      currentHeightRef.current = initialHeight; // Track initial height
    }
  };

  // Set initial height after mount
  useEffect(() => {
    setInitialHeight();
  }, []);

  return (
    <div>
      <label className="flex justify-center text-sm font-bold text-white mb-2">
        Job Description
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
        placeholder="Paste the job description here..."
        onChange={handleChange}
        rows={1}
      />
    </div>
  );
}
