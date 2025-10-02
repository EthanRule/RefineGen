"use client";

interface PromptInputProps {
  onPromptChange?: (value: string) => void;
}

export default function PromptInput({ onPromptChange }: PromptInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange?.(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Custom Prompt (Optional)
      </label>
      <textarea
        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
        placeholder="Any specific instructions for tailoring your resume..."
        onChange={handleChange}
      />
    </div>
  );
}
