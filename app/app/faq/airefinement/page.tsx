'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/footer/Footer';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);

  // Step visibility states
  const [visibleSteps, setVisibleSteps] = useState<number[]>([1]);
  const [previewSteps, setPreviewSteps] = useState<number[]>([]);

  const handleStepClick = (stepNumber: number) => {
    if (visibleSteps.includes(stepNumber)) return; // Already visible

    setVisibleSteps(prev => [...prev, stepNumber]);
    setPreviewSteps(prev => prev.filter(step => step !== stepNumber));

    // Add next step to preview if it exists
    const nextStep = stepNumber + 1;
    if (nextStep <= 6 && !visibleSteps.includes(nextStep)) {
      setPreviewSteps(prev => [...prev, nextStep]);
    }
  };

  const handleGetStarted = () => {
    if (status === 'authenticated') {
      router.push('/gen');
    } else {
      router.push('/auth?callbackUrl=/gen');
    }
  };

  const handleToggleFooter = () => {
    if (!isFooterOpen) {
      // Opening footer: start the transition
      setIsFooterOpen(true);
      // Wait 500ms for START box to finish transitioning, then give footer space
      setTimeout(() => {
        setFooterVisible(true); // Give footer space first
        // Wait a bit more for space to be allocated, then fade in
        setTimeout(() => {
          setShowFooter(true); // Show footer after space is allocated
        }, 100);
      }, 500);
    } else {
      // Closing footer: fade out first, then deallocate space
      setShowFooter(false);
      // Wait 500ms for footer to fade out, then deallocate space
      setTimeout(() => {
        setFooterVisible(false); // Remove footer space after fade
        setIsFooterOpen(false);
      }, 500);
    }
  };

  // Reset showFooter when isFooterOpen changes to false
  useEffect(() => {
    if (!isFooterOpen) {
      setShowFooter(false);
    }
  }, [isFooterOpen]);

  // Handle background image loading and fade-in
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      // Wait for image to render, then start fade-in
      setTimeout(() => {
        setIsBackgroundLoaded(true);
      }, 100);
    };
    img.src = '/background.png';
  }, []);

  // Initialize preview for step 2
  useEffect(() => {
    setPreviewSteps([2]);
  }, []);

  return (
    <div className="bg-black flex flex-col h-screen overflow-hidden">
      <Header props={{ status, session }} />
      <main className="flex justify-center mx-2 mt-2 flex-1">
        <div
          className={`bg-stone-950 rounded-lg border border-stone-700 w-full flex flex-col transition-all duration-500 ease-in-out relative overflow-hidden ${
            isFooterOpen ? 'h-[55vh]' : 'h-full'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div
              className={`w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-[10000ms] ease-out ${
                isBackgroundLoaded ? 'opacity-100 scale-105' : 'opacity-0 scale-100 rotate-1'
              }`}
              style={{
                backgroundImage: `url('/background.png')`,
                filter: ' brightness(0.8)',
                transform: 'scale(1.0)',
              }}
            />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-8">
              AI Image Refinement Pipeline
            </h2>

            {/* Pipeline Steps Grid - 3x2 Layout */}
            <div className="flex gap-8 justify-center items-start max-w-7xl">
              {/* Column 1: Input Processing & User Selection */}
              <div className="flex flex-col items-center gap-8">
                {/* Step 1 */}
                <div
                  className={`flex flex-col items-center max-w-xs transition-all duration-500 ${
                    visibleSteps.includes(1) ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="w-full p-4 border-2 rounded-2xl border-zinc-700 bg-zinc-900 text-left mb-4">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                      Step 1: Input Processing
                    </h3>
                    <p className="text-sm">
                      Your input prompt is bundled within the default prompt.
                    </p>
                  </div>
                  <div className="w-full h-32 bg-zinc-800 rounded-lg border border-zinc-600 flex items-center justify-center">
                    <span className="text-zinc-300 text-sm">
                      <div>
                        <span className="font-bold">default_prompt:</span> "Create me an image
                        of [<span className="text-cyan-400">user_prompt</span>
                        ]"
                      </div>
                    </span>
                  </div>
                </div>

                {/* Step 4 */}
                <div
                  className={`flex flex-col items-center max-w-xs transition-all duration-500 cursor-pointer ${
                    visibleSteps.includes(4)
                      ? 'opacity-100'
                      : previewSteps.includes(4)
                      ? 'opacity-30 hover:opacity-50'
                      : 'opacity-0'
                  }`}
                  onClick={() => handleStepClick(4)}
                >
                  <div className="w-full p-4 border-2 rounded-2xl border-zinc-700 bg-zinc-900 text-left mb-4">
                    <h3
                      className={`text-lg font-semibold text-cyan-400 mb-2 transition-opacity duration-300 ${
                        visibleSteps.includes(4) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      Step 4: User Selection
                    </h3>
                    <p
                      className={`text-sm transition-opacity duration-300 ${
                        visibleSteps.includes(4) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      You select specific attributes from each section to refine your image.
                    </p>
                  </div>
                  <div className="w-full h-32 bg-zinc-800 rounded-lg border border-zinc-600 flex items-center justify-center">
                    <span
                      className={`text-zinc-300 text-sm transition-opacity duration-300 ${
                        visibleSteps.includes(4) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="text-left px-2">
                        <div className="text-sm leading-relaxed">
                          <span className="text-cyan-400">✓ Lighting:</span> bright, soft
                          <br />
                          <span className="text-cyan-400">✓ Style:</span> realistic
                          <br />
                          <span className="text-cyan-400">✓ Background:</span> simple
                        </div>
                      </div>
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: LLM Enhancement & Iteration */}
              <div className="flex flex-col items-center gap-8">
                {/* Step 2 */}
                <div
                  className={`flex flex-col items-center max-w-xs transition-all duration-500 cursor-pointer ${
                    visibleSteps.includes(2)
                      ? 'opacity-100'
                      : previewSteps.includes(2)
                      ? 'opacity-30 hover:opacity-50'
                      : 'opacity-0'
                  }`}
                  onClick={() => handleStepClick(2)}
                >
                  <div className="w-full p-4 border-2 rounded-2xl border-zinc-700 bg-zinc-900 text-left mb-4">
                    <h3
                      className={`text-lg font-semibold text-cyan-400 mb-2 transition-opacity duration-300 ${
                        visibleSteps.includes(2) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      Step 2: LLM Enhancement
                    </h3>
                    <p
                      className={`text-sm transition-opacity duration-300 ${
                        visibleSteps.includes(2) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      GPT-4 analyzes your prompt and generates 3 new attribute sections with 5
                      options each.
                    </p>
                  </div>
                  <div className="w-full h-32 bg-zinc-800 rounded-lg border border-zinc-600 flex items-center justify-center">
                    <span
                      className={`text-zinc-300 text-sm transition-opacity duration-300 ${
                        visibleSteps.includes(2) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="text-left px-2">
                        <div className="text-sm leading-relaxed">
                          "Create 3 new attribute sections for:{' '}
                          <span className="text-cyan-400 font-medium">cat</span>"
                        </div>
                      </div>
                    </span>
                  </div>
                </div>

                {/* Step 5 */}
                <div
                  className={`flex flex-col items-center max-w-xs transition-all duration-500 cursor-pointer ${
                    visibleSteps.includes(5)
                      ? 'opacity-100'
                      : previewSteps.includes(5)
                      ? 'opacity-30 hover:opacity-50'
                      : 'opacity-0'
                  }`}
                  onClick={() => handleStepClick(5)}
                >
                  <div className="w-full p-4 border-2 rounded-2xl border-zinc-700 bg-zinc-900 text-left mb-4">
                    <h3
                      className={`text-lg font-semibold text-cyan-400 mb-2 transition-opacity duration-300 ${
                        visibleSteps.includes(5) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      Step 5: Iteration
                    </h3>
                    <p
                      className={`text-sm transition-opacity duration-300 ${
                        visibleSteps.includes(5) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      You can repeat steps 2-4 up to 10 times to further refine your image.
                    </p>
                  </div>
                  <div className="w-full h-32 bg-zinc-800 rounded-lg border border-zinc-600 flex items-center justify-center">
                    <span
                      className={`text-zinc-300 text-sm transition-opacity duration-300 ${
                        visibleSteps.includes(5) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="text-center px-2">
                        <div className="text-sm leading-relaxed">
                          <div className="text-zinc-300">🔄 Steps 2-4 repeat</div>
                          <div className="text-cyan-400 mt-1">Max 10 iterations</div>
                          <div className="text-zinc-300 mt-1">3 gems per cycle</div>
                        </div>
                      </div>
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 3: Attribute Generation & Generation */}
              <div className="flex flex-col items-center gap-8">
                {/* Step 3 */}
                <div
                  className={`flex flex-col items-center max-w-xs transition-all duration-500 cursor-pointer ${
                    visibleSteps.includes(3)
                      ? 'opacity-100'
                      : previewSteps.includes(3)
                      ? 'opacity-30 hover:opacity-50'
                      : 'opacity-0'
                  }`}
                  onClick={() => handleStepClick(3)}
                >
                  <div className="w-full p-4 border-2 rounded-2xl border-zinc-700 bg-zinc-900 text-left mb-4">
                    <h3
                      className={`text-lg font-semibold text-cyan-400 mb-2 transition-opacity duration-300 ${
                        visibleSteps.includes(3) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      Step 3: Attribute Generation
                    </h3>
                    <p
                      className={`text-sm transition-opacity duration-300 ${
                        visibleSteps.includes(3) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      GPT-4 returns structured JSON with section names and attribute options.
                    </p>
                  </div>
                  <div className="w-full h-32 bg-zinc-800 rounded-lg border border-zinc-600 flex items-center justify-center">
                    <span
                      className={`text-zinc-300 text-sm transition-opacity duration-300 ${
                        visibleSteps.includes(3) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="text-left px-2">
                        <div className="text-sm leading-relaxed">
                          <span className="text-cyan-400">Lighting:</span> bright, soft,
                          dramatic
                          <br />
                          <span className="text-cyan-400">Style:</span> realistic, artistic,
                          cartoon
                          <br />
                          <span className="text-cyan-400">Background:</span> simple, complex,
                          blurred
                        </div>
                      </div>
                    </span>
                  </div>
                </div>

                {/* Step 6 */}
                <div
                  className={`flex flex-col items-center max-w-xs transition-all duration-500 cursor-pointer ${
                    visibleSteps.includes(6)
                      ? 'opacity-100'
                      : previewSteps.includes(6)
                      ? 'opacity-30 hover:opacity-50'
                      : 'opacity-0'
                  }`}
                  onClick={() => handleStepClick(6)}
                >
                  <div className="w-full p-4 border-2 rounded-2xl border-zinc-700 bg-zinc-900 text-left mb-4">
                    <h3
                      className={`text-lg font-semibold text-cyan-400 mb-2 transition-opacity duration-300 ${
                        visibleSteps.includes(6) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      Step 6: Generation
                    </h3>
                    <p
                      className={`text-sm transition-opacity duration-300 ${
                        visibleSteps.includes(6) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      Your selections are combined into a detailed prompt and sent to DALL-E 3.
                    </p>
                  </div>
                  <div className="w-full h-32 bg-zinc-800 rounded-lg border border-zinc-600 flex items-center justify-center">
                    <span
                      className={`text-zinc-300 text-sm transition-opacity duration-300 ${
                        visibleSteps.includes(6) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="text-left px-2">
                        <div className="text-sm leading-relaxed">
                          "Generate me an image of{' '}
                          <span className="text-cyan-400 font-medium">cat</span> with:
                          <br />
                          <span className="text-cyan-400">• Lighting:</span> bright, soft
                          <br />
                          <span className="text-cyan-400">• Style:</span> realistic
                          <br />
                          <span className="text-cyan-400">• Background:</span> simple"
                        </div>
                        <div className="text-sm mt-2 text-zinc-300 font-medium">
                          🎨 → DALL-E 3 API (10 gems)
                        </div>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Toggle Button - Inside the stone-950 box */}
          <div className="absolute bottom-6 right-6 z-20">
            <button
              onClick={handleToggleFooter}
              className={`p-2 rounded-full transition-all duration-300 ease-in-out ${
                isFooterOpen
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-400/50'
                  : 'bg-stone-700 text-gray-300 hover:bg-stone-600 hover:text-white'
              }`}
              title={isFooterOpen ? 'Close Footer' : 'Open Footer'}
            >
              <svg
                className="w-6 h-6 transition-all duration-300"
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
          </div>
        </div>
      </main>

      {/* Footer with smooth transitions */}
      <div
        className={`mt-2 mb-2 ${
          showFooter ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${
          footerVisible ? 'flex-1' : 'h-0 overflow-hidden'
        } overflow-x-auto transition-opacity duration-500 ease-in-out`}
      >
        <Footer props={{ status, session }} />
      </div>
    </div>
  );
}
