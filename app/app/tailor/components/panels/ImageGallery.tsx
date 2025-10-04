'use client';

import { useState } from 'react';

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GalleryImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
  attributes: string[];
  filename: string;
}

// Mock data for now - in a real app this would come from your backend/database
const mockImages: GalleryImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    prompt: 'A serene mountain landscape at sunset',
    timestamp: '2024-01-15T10:30:00Z',
    attributes: ['landscape', 'sunset', 'mountains'],
    filename: 'mountain-sunset.png',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300&h=300&fit=crop',
    prompt: 'Abstract geometric patterns in blue and purple',
    timestamp: '2024-01-15T09:15:00Z',
    attributes: ['abstract', 'geometric', 'blue'],
    filename: 'abstract-blue.png',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    prompt: 'Cyberpunk cityscape with neon lights',
    timestamp: '2024-01-14T16:45:00Z',
    attributes: ['cyberpunk', 'city', 'neon'],
    filename: 'cyberpunk-city.png',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300&h=300&fit=crop',
    prompt: 'Minimalist portrait with dramatic lighting',
    timestamp: '2024-01-14T14:20:00Z',
    attributes: ['portrait', 'minimalist', 'dramatic'],
    filename: 'portrait-minimal.png',
  },
];

export default function ImageGallery({ isOpen, onClose }: ImageGalleryProps) {
  const [selectedFilter, setSelectedFilter] = useState('Recent');
  const [favorites, setFavorites] = useState<string[]>([]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const toggleFavorite = (imageId: string) => {
    setFavorites(prev =>
      prev.includes(imageId) ? prev.filter(id => id !== imageId) : [...prev, imageId]
    );
  };

  const handleDownload = (image: GalleryImage) => {
    // Create download link
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.filename;
    link.click();
  };

  const handleViewDetails = (image: GalleryImage) => {
    // In a real app, this might open a modal or navigate to a details page
    console.log('View details for:', image);
  };

  return (
    <div
      className={`bg-stone-950 rounded-lg border border-stone-700 h-full flex flex-col shadow-xl w-1/5 transition-opacity duration-300 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        transitionDelay: isOpen ? '300ms' : '0ms',
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-stone-700">
        <div className="flex items-center justify-center mb-4">
          <h2 className="text-xl font-semibold text-white">Image Gallery</h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-4">
          {['Recent', 'Favorites'].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === filter
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Today', 'This Week', 'Landscape'].map(filter => (
            <button
              key={filter}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'All'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {mockImages.map(image => (
            <div
              key={image.id}
              className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors"
            >
              <div className="flex items-start space-x-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{image.prompt}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {image.attributes.join(', ').toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(image.timestamp)} • {image.filename}
                  </p>
                </div>

                {/* Action Icons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorite(image.id)}
                    className={`p-1 rounded transition-colors ${
                      favorites.includes(image.id)
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleViewDetails(image)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDownload(image)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-stone-700">
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors">
          Generate New Image
        </button>
      </div>
    </div>
  );
}
