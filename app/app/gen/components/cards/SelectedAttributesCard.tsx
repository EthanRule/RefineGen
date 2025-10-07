"use client";

interface SelectedAttributesCardProps {
  selectedAttributes: string[];
  onAttributeRemove: (attribute: string) => void;
}

// Function to calculate dynamic width based on text content
const getButtonWidth = (text: string) => {
  const narrowChars = ["i", "l", "j", "t", "f", "r", "I", "J", "T", "F", "L"];
  const wideChars = ["m", "w", "M", "W"];

  let width = 60; // base width

  // Reduce width for narrow characters
  const narrowCount = text
    .split("")
    .filter((char) => narrowChars.includes(char)).length;
  width -= narrowCount * 3;

  // Increase width for wide characters
  const wideCount = text
    .split("")
    .filter((char) => wideChars.includes(char)).length;
  width += wideCount * 4;

  // Ensure minimum width
  return Math.max(width, 40);
};

export default function SelectedAttributesCard({
  selectedAttributes,
  onAttributeRemove,
}: SelectedAttributesCardProps) {
  if (selectedAttributes.length === 0) {
    return (
      <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"></div>
    );
  }

  return (
    <div className="bg-zinc-800 rounded-lg p-2 border border-zinc-700">
      <div className="flex flex-wrap gap-2">
        {selectedAttributes.map((attribute) => (
          <div
            key={attribute}
            className="group flex items-center justify-center bg-zinc-700 hover:bg-zinc-500 text-white px-3 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer"
            style={{ width: `${getButtonWidth(attribute)}px` }}
            onClick={() => onAttributeRemove(attribute)}
            title="Click to remove"
          >
            <span className="group-hover:hidden">{attribute}</span>
            <svg
              className="w-4 h-4 hidden group-hover:block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
