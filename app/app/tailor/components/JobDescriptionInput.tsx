"use client";

interface JobDescriptionInputProps {
  onJobDescriptionChange?: (value: string) => void;
}

export default function JobDescriptionInput({
  onJobDescriptionChange,
}: JobDescriptionInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onJobDescriptionChange?.(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Job Description
      </label>
      <textarea
        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
        placeholder="Paste the job description here..."
        onChange={handleChange}
      />
    </div>
  );
}
