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
      // First try: Direct download with CORS handling
      try {
        const response = await fetch(imageUrl, {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "image/*",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        await downloadBlob(blob);
        return;
      } catch (corsError) {
        console.warn(
          "CORS fetch failed, trying alternative method:",
          corsError
        );
      }

      // Fallback: Use a proxy endpoint to download the image
      const proxyResponse = await fetch("/api/download-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!proxyResponse.ok) {
        throw new Error(`Proxy download failed: ${proxyResponse.status}`);
      }

      const blob = await proxyResponse.blob();
      await downloadBlob(blob);
    } catch (error) {
      console.error("Download failed:", error);

      // Final fallback: Open image in new tab for manual download
      if (imageUrl) {
        const shouldOpenTab = confirm(
          "Automatic download failed. Would you like to open the image in a new tab where you can right-click to save it?"
        );
        if (shouldOpenTab) {
          window.open(imageUrl, "_blank");
        }
      } else {
        alert("Failed to download image. Please try again.");
      }
    }
  };

  const downloadBlob = async (blob: Blob) => {
    // Create a more descriptive filename based on the prompt
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const promptSlug = prompt
      ? prompt
          .slice(0, 30)
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .replace(/\s+/g, "-")
      : "generated-image";
    const filename = `${promptSlug}-${timestamp}.png`;

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log(`Downloaded: ${filename}`);
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
      <div className="flex justify-end">
        <button
          onClick={handleDownload}
          disabled={!imageUrl}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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
          Download Image
        </button>
      </div>
    </div>
  );
}
