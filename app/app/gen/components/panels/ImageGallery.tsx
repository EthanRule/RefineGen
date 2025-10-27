'use client';

import { useState, useEffect } from 'react';

interface SavedImage {
  id: string;
  s3Key: string;
  s3Bucket: string;
  publicUrl: string;
  prompt: string;
  attributes: string[];
  filename: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  images: SavedImage[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ImageGallery({
  isOpen,
  onClose,
  images,
  isLoading,
  onRefresh,
}: ImageGalleryProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState<{ [key: string]: boolean }>({});

  // When isopened is passed, delay 300ms. Then fade in the component. Otherwise
  // show an empty component.

  useEffect(() => {
    if (isOpen) {
      const delayTimer = setTimeout(() => {
        setShouldRender(true);

        setTimeout(() => setIsVisible(true), 10);
      }, 300);

      return () => clearTimeout(delayTimer);
    } else {
      setIsVisible(false);
      const cleanupTimer = setTimeout(() => {
        setShouldRender(false);
      }, 300);

      return () => clearTimeout(cleanupTimer);
    }
  }, [isOpen]);

  const handleImageLoad = (imageId: string) => {
    setImageLoadStates(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageError = (imageId: string) => {
    setImageLoadStates(prev => ({ ...prev, [imageId]: false }));
  };

  if (!shouldRender) return null;

  return (
    <div className="w-full h-full">
      <div
        className={`bg-stone-950 rounded-lg border border-stone-700 h-full transition-opacity duration-300 ease-in-out w-full ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-6 w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-center mb-4 w-full min-w-0">
            <h2 className="text-xl font-semibold text-white truncate">Image Gallery</h2>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-[calc(100vh-300px)] min-h-[300px]">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 w-12 h-12 border border-white rounded-full animate-expand-1"></div>
                </div>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center text-stone-400 py-8">
                No images yet. Generate some images to see them here! Note: Images expire after
                7 days.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 w-full min-w-0">
                {images.map(image => (
                  <div key={image.id}>
                    <div className="aspect-square w-full mb-1 relative">
                      {!imageLoadStates[image.id] && (
                        <div className="absolute inset-0 bg-zinc-900 rounded flex items-center justify-center">
                          <svg
                            className="h-8 w-8 animate-pulse text-stone-400"
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
                        </div>
                      )}
                      <img
                        src={image.publicUrl}
                        alt={image.prompt}
                        className={`w-full h-full object-cover rounded transition-opacity duration-300 ${
                          imageLoadStates[image.id] ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        onLoad={() => handleImageLoad(image.id)}
                        onError={() => handleImageError(image.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
