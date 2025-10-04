'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/footer/Footer';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (status === 'authenticated') {
      router.push('/tailor');
    } else {
      router.push('/auth?callbackUrl=/tailor');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header props={{ status, session }} />

      <main className="flex-1 flex justify-center mx-2 my-2 mt-4">
        <div className="bg-stone-950 rounded-lg shadow-lg border border-stone-700 w-full flex flex-col min-h-[calc(100vh-1rem)]">
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                AI-Powered
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Image Generation
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Create stunning images with AI. Describe your vision, refine with precision,
                and generate beautiful artwork in seconds.
              </p>

              {/* CTA Button */}
              <button
                onClick={handleGetStarted}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
              >
                {status === 'authenticated' ? 'Start Creating' : 'Get Started'}
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="px-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
                <p className="text-gray-400">
                  Generate high-quality images in seconds with our advanced AI technology.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Precise Control</h3>
                <p className="text-gray-400">
                  Refine your images with detailed attributes and style options.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">High Quality</h3>
                <p className="text-gray-400">
                  Get professional-grade images with stunning detail and clarity.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="px-6 pb-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Describe Your Vision
                  </h3>
                  <p className="text-gray-400">
                    Enter a detailed prompt describing the image you want to create.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Refine & Customize</h3>
                  <p className="text-gray-400">
                    Use our AI-powered refinement options to perfect your image.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Generate & Download
                  </h3>
                  <p className="text-gray-400">
                    Get your high-quality image and download it instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer props={{ status, session }} />
    </div>
  );
}
