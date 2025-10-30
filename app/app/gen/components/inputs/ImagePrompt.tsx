'use client';

import { useState, useRef, useEffect } from 'react';

interface ImagePromptProps {
  value?: string;
  onPromptChange?: (value: string) => void;
}

export default function ImagePrompt({ value = '', onPromptChange }: ImagePromptProps) {
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Client-side validation
    if (newValue.length > 200) {
      setError('Prompt must be 200 characters or less');
      return;
    } else {
      setError('');
    }

    onPromptChange?.(newValue);

    // Calculate target height
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';

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
      textarea.style.height = 'auto';
      const initialHeight = Math.max(textarea.scrollHeight, 40); // Ensure at least 40px
      textarea.style.height = `${initialHeight}px`;
    }
  }, [value]);

  const getCharacterCountColor = () => {
    const remaining = 200 - value.length;
    if (remaining <= 20) return 'text-red-400';
    if (remaining <= 50) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div>
      <textarea
        ref={textareaRef}
        value={value}
        style={{
          boxSizing: 'border-box',
          padding: 'var(--padding-y, 8px) var(--padding-x, 12px)',
          transition: 'height 300ms ease-out',
        }}
        className={`w-full bg-zinc-800 border-zinc-700 text-white rounded-lg focus:outline-none resize-none placeholder-gray-400 overflow-hidden ${
          error ? 'border-red-500 focus:border-red-400' : 'focus:border-zinc-500'
        }`}
        placeholder="Describe your image here..."
        onChange={handleChange}
        rows={1}
        maxLength={200}
      />
      <div className="flex justify-between items-center mt-1">
        <div className="flex-1">
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
        <p className={`text-xs ${getCharacterCountColor()}`}>{200 - value.length} remaining</p>
      </div>
    </div>
  );
}
