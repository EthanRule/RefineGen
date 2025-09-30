export default function PromptInput() {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Prompt
      </label>
      <textarea
        className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
        placeholder="Enter your prompt for tailoring the resume..."
        maxLength={1200}
      />
      <div className="text-xs text-gray-500 mt-1">Max 1200 characters</div>
    </div>
  );
}
