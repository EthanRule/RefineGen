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

  if (!shouldRender) return null;

  return (
    <div className="w-1/5">
      <div
        className={`bg-stone-950 rounded-lg border border-stone-700 h-full transition-opacity duration-300 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-4 w-full">
            <h2 className="text-xl font-semibold text-white">Image Gallery</h2>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {isLoading ? (
              <div className="text-center text-stone-400 py-8">
                <div className="animate-spin w-6 h-6 border-2 border-stone-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading images...
              </div>
            ) : images.length === 0 ? (
              <div className="text-center text-stone-400 py-8">
                No images yet. Generate some images to see them here!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {images.map(image => (
                  <div key={image.id}>
                    <div className="aspect-square w-full mb-1">
                      <img
                        src={image.publicUrl}
                        alt={image.prompt}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
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
