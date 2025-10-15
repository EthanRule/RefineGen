'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

export default function MobileGalleryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

  // Function to fetch user's saved images
  const fetchImages = async () => {
    setIsLoadingImages(true);
    try {
      const response = await fetch('/api/get-images');
      if (response.ok) {
        const data = await response.json();
        setSavedImages(data.images || []);
      } else {
        //TODO: handle error
      }
    } catch (error) {
      throw new Error('❌ Error fetching images:', error as Error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex flex-1 justify-center items-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 w-12 h-12 border border-white rounded-full animate-expand-1"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0 bg-stone-950 border-b border-stone-700">
        <button
          onClick={() => router.push('/gen')}
          className="text-white hover:bg-zinc-800 active:bg-zinc-700 rounded-lg hover:text-gray-300 transition-colors p-2"
          title="Back to Generator"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h1 className="text-xl font-semibold text-white">Image Gallery</h1>

        <button
          onClick={fetchImages}
          className="text-white hover:bg-zinc-800 active:bg-zinc-700 rounded-lg hover:text-gray-300 transition-colors p-2"
          title="Refresh Gallery"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Gallery Content */}
      <div className="flex-1">
        {isLoadingImages ? (
          <div className="flex justify-center items-center h-full min-h-[calc(100vh-120px)]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 w-12 h-12 border border-white rounded-full animate-expand-1"></div>
            </div>
          </div>
        ) : savedImages.length === 0 ? (
          <div className="text-center text-stone-400 py-8 p-4">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-stone-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-lg mb-2">No images yet</p>
            <p className="text-sm">Generate some images to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4">
            {savedImages.map(image => (
              <div key={image.id} className="bg-stone-900 rounded-lg overflow-hidden">
                <div className="aspect-square w-full">
                  <img
                    src={image.publicUrl}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-stone-300 line-clamp-2 mb-1">{image.prompt}</p>
                  {image.attributes && image.attributes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {image.attributes.slice(0, 2).map((attr, index) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-600 text-white px-2 py-1 rounded"
                        >
                          {attr}
                        </span>
                      ))}
                      {image.attributes.length > 2 && (
                        <span className="text-xs text-stone-400">
                          +{image.attributes.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
