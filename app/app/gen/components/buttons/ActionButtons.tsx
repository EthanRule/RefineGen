'use client';

import { useState, useRef, useEffect } from 'react';

interface ActionButtonsProps {
  imageUrl?: string;
  prompt?: string;
  customFilename?: string;
}

export default function ActionButtons({
  imageUrl,
  prompt,
  customFilename,
}: ActionButtonsProps) {
  const [filename, setFilename] = useState<string>('');
  const filenameRef = useRef<HTMLInputElement>(null);

  // Set default filename when imageUrl changes
  useEffect(() => {
    if (imageUrl && !filename) {
      // Use custom filename if available, otherwise use simple "image.png"
      const defaultName = customFilename || 'image.png';
      setFilename(defaultName);
    }
  }, [imageUrl, prompt, filename, customFilename]);

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      // First try: Direct download with CORS handling
      try {
        const response = await fetch(imageUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            Accept: 'image/*',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        await downloadBlob(blob);
        return;
      } catch (corsError) {
        console.warn('CORS fetch failed, trying alternative method:', corsError);
      }

      // Fallback: Use a proxy endpoint to download the image
      const proxyResponse = await fetch('/api/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!proxyResponse.ok) {
        throw new Error(`Proxy download failed: ${proxyResponse.status}`);
      }

      const blob = await proxyResponse.blob();
      await downloadBlob(blob);
    } catch (error) {
      console.error('Download failed:', error);

      // Final fallback: Open image in new tab for manual download
      if (imageUrl) {
        const shouldOpenTab = confirm(
          'Automatic download failed. Would you like to open the image in a new tab where you can right-click to save it?'
        );
        if (shouldOpenTab) {
          window.open(imageUrl, '_blank');
        }
      } else {
        alert('Failed to download image. Please try again.');
      }
    }
  };

  const downloadBlob = async (blob: Blob) => {
    // Use the user's filename input
    const userFilename = filename.trim() || 'image.png';

    // Ensure filename has proper extension
    const finalFilename =
      userFilename.endsWith('.png') ||
      userFilename.endsWith('.jpg') ||
      userFilename.endsWith('.jpeg')
        ? userFilename
        : `${userFilename}.png`;

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    a.style.display = 'none';

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value);
  };

  return (
    <div className="mt-4 flex flex-row gap-2 sm:gap-3 w-full">
      <input
        ref={filenameRef}
        type="text"
        value={filename}
        onChange={handleFilenameChange}
        className="flex-1 px-2 sm:px-3 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-0 placeholder-gray-400 text-xs sm:text-sm min-w-0"
        placeholder="image.png"
      />
      <button
        onClick={handleDownload}
        disabled={!imageUrl}
        className="bg-cyan-400 hover:bg-cyan-200 text-black px-3 sm:px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex-shrink-0"
      >
        <svg
          className="w-3 h-3 sm:w-4 sm:h-4"
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
        <span className="hidden sm:inline font-bold">Download</span>
        <span className="sm:hidden">Download</span>
      </button>
    </div>
  );
}
