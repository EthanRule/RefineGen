interface ImagePreviewProps {
  imageUrl?: string;
  error?: string;
}

export default function ImagePreview({ imageUrl, error }: ImagePreviewProps) {
  return (
    <div className="bg-zinc-900 rounded-lg p-6 border-2 border-dashed border-zinc-700 h-[40rem] min-h-[600px] max-h-[800px] w-full">
      <div className="h-full flex items-center justify-center">
        {error ? (
          <div className="text-center text-red-400">
            <svg
              className="mx-auto h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated image"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-center text-stone-400">
            <svg
              className="mx-auto h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-medium">Image Preview</p>
            <p className="text-sm">Generated image will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
