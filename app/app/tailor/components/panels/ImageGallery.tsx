'use client';

import { useState, useEffect } from 'react';

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageGallery({ isOpen, onClose }: ImageGalleryProps) {
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
        </div>
      </div>
    </div>
  );
}
