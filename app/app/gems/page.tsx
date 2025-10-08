'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function GemsPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle subscription creation
  const handleSubscribe = async (priceId: string) => {
    setIsLoading(priceId);
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error('Error creating subscription:', data.error);
        alert('Failed to create subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-y-auto lg:overflow-hidden lg:h-screen">
      <main className="flex-1 flex mx-2 my-2">
        <div className="bg-stone-950 rounded-lg shadow-lg border border-stone-700 flex flex-col min-h-[calc(100vh-1rem)] lg:max-h-[calc(100vh-1rem)] w-full">
          {/* Header with back button */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <button
              onClick={() => router.back()}
              className="text-white hover:bg-zinc-800 active:bg-zinc-700 rounded-lg hover:text-gray-300 transition-colors p-1"
              title="Go Back"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Title */}
            <h1 className="text-white text-xl font-semibold">Purchase Gems</h1>

            {/* Empty div for spacing */}
            <div className="w-8 h-8"></div>
          </div>

          {/* Content */}
          <div className="flex flex-1 justify-center min-h-0 py-[5vh] lg:py-[10vh] px-4">
            <div className="w-full lg:w-3/5 h-full">
              <div className="text-center">
                <div className="mb-8">
                  <div className="relative inline-block mb-4">
                    <svg
                      className={`w-16 h-16 text-green-400 mx-auto transition-all duration-500 ease-in-out ${
                        hoveredPackage === '100'
                          ? 'transform rotate-[30deg]'
                          : hoveredPackage === '500'
                          ? 'transform rotate-0'
                          : hoveredPackage === '1000'
                          ? 'transform rotate-[-30deg]'
                          : 'transform rotate-0'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      style={{ transform: 'scaleY(-1)' }}
                    >
                      <path d="M12 2L6 8L12 14L18 8L12 2ZM6 8L12 14L6 20L6 8ZM18 8L12 14L18 20L18 8Z" />
                    </svg>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-green-300 to-green-600 rounded-full transition-opacity duration-500 ${
                        hoveredPackage ? 'opacity-40' : 'opacity-20'
                      }`}
                    ></div>
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-2">Purchase Gems</h2>
                  <p className="text-gray-400 text-lg">
                    Get more gems to continue generating amazing images
                  </p>
                </div>

                {/* Gem packages */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {/* Small Package */}
                  <div
                    className="bg-zinc-800 rounded-lg p-6 border border-zinc-700 hover:border-green-500 transition-colors"
                    onMouseEnter={() => setHoveredPackage('100')}
                    onMouseLeave={() => setHoveredPackage(null)}
                  >
                    <div className="text-center">
                      <div className="text-green-400 text-3xl font-bold mb-2">400</div>
                      <div className="text-white text-lg font-semibold mb-4">Gems</div>
                      <div className="text-gray-400 text-sm mb-6">
                        Perfect for trying out new features
                      </div>
                      <button
                        onClick={() => handleSubscribe('price_400_gems')}
                        disabled={isLoading === 'price_400_gems'}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        {isLoading === 'price_400_gems' ? 'Loading...' : '$4.99/month'}
                      </button>
                    </div>
                  </div>

                  {/* Medium Package */}
                  <div
                    className="bg-zinc-800 rounded-lg p-6 border border-green-500 relative"
                    onMouseEnter={() => setHoveredPackage('500')}
                    onMouseLeave={() => setHoveredPackage(null)}
                  >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 text-3xl font-bold mb-2">1800</div>
                      <div className="text-white text-lg font-semibold mb-4">Gems</div>
                      <div className="text-gray-400 text-sm mb-6">
                        Great value for regular users
                      </div>
                      <button
                        onClick={() => handleSubscribe('price_1800_gems')}
                        disabled={isLoading === 'price_1800_gems'}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        {isLoading === 'price_1800_gems' ? 'Loading...' : '$19.99/month'}
                      </button>
                    </div>
                  </div>

                  {/* Large Package */}
                  <div
                    className="bg-zinc-800 rounded-lg p-6 border border-zinc-700 hover:border-green-500 transition-colors"
                    onMouseEnter={() => setHoveredPackage('1000')}
                    onMouseLeave={() => setHoveredPackage(null)}
                  >
                    <div className="text-center">
                      <div className="text-green-400 text-3xl font-bold mb-2">4000</div>
                      <div className="text-white text-lg font-semibold mb-4">Gems</div>
                      <div className="text-gray-400 text-sm mb-6">
                        Best value for power users
                      </div>
                      <button
                        onClick={() => handleSubscribe('price_4000_gems')}
                        disabled={isLoading === 'price_4000_gems'}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        {isLoading === 'price_4000_gems' ? 'Loading...' : '$39.99/month'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional info */}
                <div className="mt-12 text-center">
                  <p className="text-gray-400 text-sm mb-4">
                    Gems are used to generate images and access premium features
                  </p>
                  <div className="flex justify-center space-x-8 text-sm text-gray-500">
                    <span>• Secure payment processing</span>
                    <span>• Instant gem delivery</span>
                    <span>• No expiration date</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
