interface ActionButtonsProps {
  imageUrl?: string;
  prompt?: string;
}

export default function ActionButtons({
  imageUrl,
  prompt,
}: ActionButtonsProps) {
  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleSave = () => {
    // For now, just show an alert. In a real app, you'd save to user's gallery
    alert("Image saved to your gallery!");
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        className="flex-1 px-3 py-2 border border-gray-500 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400"
        placeholder="image.png"
        defaultValue={
          prompt ? `generated-image-${Date.now()}.png` : "image.png"
        }
        disabled
      />
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
        <button
          onClick={handleSave}
          disabled={!imageUrl}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
        <button
          onClick={handleDownload}
          disabled={!imageUrl}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download
        </button>
      </div>
    </div>
  );
}
