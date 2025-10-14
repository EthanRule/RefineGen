'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer/Footer';
import LoadingCard from '../components/ui/LoadingCard';
import ControlPanel from './components/panels/ControlPanel';
import ImageView from './components/panels/ImageView';
import GenHeader from './components/panels/GenHeader';
import ImageGallery from './components/panels/ImageGallery';

interface ImageGenerationResults {
  imageUrl: string;
  prompt: string;
  timestamp: string;
  model: string;
  size: string;
}

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

export default function GenClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for image generation
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResults | null>(null);
  const [error, setError] = useState<string>('');
  const [errorType, setErrorType] = useState<string>('');
  const [isRetryable, setIsRetryable] = useState<boolean>(false);

  // State for saved images gallery
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

  // State for dynamic section workflow
  const [sections, setSections] = useState<Array<{ name: string; options: string[] }>>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [attributeSections, setAttributeSections] = useState<{
    [key: string]: string;
  }>({});
  const [usedSections, setUsedSections] = useState<string[]>([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState<boolean>(false);
  const [refineButtonState, setRefineButtonState] = useState<'refine' | 'refining'>('refine');
  const [generateButtonState, setGenerateButtonState] = useState<'generate' | 'generating'>(
    'generate'
  );
  const [refinementCount, setRefinementCount] = useState<number>(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [tokenCount, setTokenCount] = useState<number>(0); // Start with 0, will be fetched
  const [isLoadingTokens, setIsLoadingTokens] = useState<boolean>(true); // Track token loading state
  const [recentImageUrl, setRecentImageUrl] = useState<string | null>(null); // Most recent image for background
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false); // Track if background image is loaded
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false); // Track if old image is fading out

  // Function to fetch user's most recent image for background
  const fetchRecentImage = async () => {
    try {
      const response = await fetch('/api/recent-image');
      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.recentImage?.publicUrl || null;

        if (imageUrl && imageUrl !== recentImageUrl) {
          // Start fade out of current image
          setIsFadingOut(true);

          // Wait for fade out to complete (5 seconds)
          setTimeout(() => {
            // Reset loaded state and set new image
            setIsImageLoaded(false);
            setRecentImageUrl(imageUrl);
            setIsFadingOut(false);

            // Preload the new image
            const img = new Image();
            img.onload = () => {
              setIsImageLoaded(true);
            };
            img.onerror = () => {
              console.error('Failed to load background image');
              setIsImageLoaded(false);
            };
            img.src = imageUrl;
          }, 5000); // Wait 5 seconds for fade out
        } else if (imageUrl === recentImageUrl) {
          // Same image, just ensure it's loaded
          if (!isImageLoaded) {
            const img = new Image();
            img.onload = () => {
              setIsImageLoaded(true);
            };
            img.onerror = () => {
              console.error('Failed to load background image');
              setIsImageLoaded(false);
            };
            img.src = imageUrl;
          }
        } else {
          // No image, fade out current one
          setIsFadingOut(true);
          setTimeout(() => {
            setRecentImageUrl(null);
            setIsImageLoaded(false);
            setIsFadingOut(false);
          }, 5000);
        }
      } else {
        console.error('Failed to fetch recent image:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching recent image:', error);
    }
  };

  // Function to refresh token count
  const refreshTokenCount = async () => {
    await fetchTokenCount();
  };

  // Function to fetch user's token count
  const fetchTokenCount = async () => {
    setIsLoadingTokens(true);
    try {
      const response = await fetch('/api/user-tokens');
      if (response.ok) {
        const data = await response.json();
        setTokenCount(data.tokens_remaining || 0);
      } else {
        console.error('Failed to fetch token count:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching token count:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Function to fetch user's saved images
  const fetchImages = async () => {
    setIsLoadingImages(true);
    try {
      const response = await fetch('/api/get-images');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG - Fetch images response:', JSON.stringify(data, null, 2));
        setSavedImages(data.images || []);
        console.log('✅ Images fetched successfully:', data.count);
      } else {
        console.error('❌ Failed to fetch images:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error fetching images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Fetch token count when component mounts and when session changes
  useEffect(() => {
    if (session?.user?.email) {
      fetchTokenCount();
      fetchRecentImage(); // Also fetch recent image
    }
  }, [session?.user?.email]);

  // Refresh token count when page becomes visible (user might have purchased gems)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.email) {
        fetchTokenCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session?.user?.email]);

  // Fetch images when gallery opens
  useEffect(() => {
    if (isGalleryOpen) {
      fetchImages();
    }
  }, [isGalleryOpen]);

  const handleRefine = async () => {
    // Check if user has sufficient tokens (3 gems for refinement)
    if (tokenCount < 3) {
      setError('Insufficient gems. You need 3 gems to refine. Please purchase more gems.');
      setErrorType('insufficient_tokens');
      return;
    }

    // Check refinement limit
    if (refinementCount >= 10) {
      setError('Maximum 10 refinements allowed. Please generate an image to reset.');
      setErrorType('invalid_prompt');
      return;
    }

    if (!imagePrompt.trim()) {
      setError('Please enter an image prompt');
      return;
    }

    setError('');
    setErrorType('');
    setIsRetryable(false);
    setRefineButtonState('refining');

    // Generate section options for the prompt
    await generateSectionOptions(imagePrompt.trim());

    // Deduct 3 tokens from database
    try {
      const deductResponse = await fetch('/api/deduct-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'refine',
          tokensUsed: 3,
        }),
      });

      if (deductResponse.ok) {
        const deductData = await deductResponse.json();
        setTokenCount(deductData.tokens_remaining);
      } else {
        const errorData = await deductResponse.json();
        console.error('Failed to deduct tokens:', errorData);

        // If insufficient tokens, show error and refresh count
        if (errorData.error === 'Insufficient tokens') {
          setError('Insufficient gems. You need 3 gems to refine. Please purchase more gems.');
          setErrorType('insufficient_tokens');
          setRefineButtonState('refine');
          await refreshTokenCount();
          return;
        }
      }
    } catch (error) {
      console.error('Error deducting tokens:', error);
      // Revert the local count if database deduction failed
      setTokenCount(prev => prev + 3);
    }

    // Increment refinement count
    setRefinementCount(prev => prev + 1);
  };

  const handleGenerateImage = async () => {
    // Check if user has sufficient tokens (10 gems for generation)
    if (tokenCount < 10) {
      setError(
        'Insufficient gems. You need 10 gems to generate an image. Please purchase more gems.'
      );
      setErrorType('insufficient_tokens');
      return;
    }

    if (!imagePrompt.trim()) {
      setError('Please enter an image prompt');
      return;
    }

    setError('');
    setErrorType('');
    setIsRetryable(false);
    setGeneratedImage(null);
    setGenerateButtonState('generating');

    try {
      // Build enhanced prompt with selected attributes and their sections
      let enhancedPrompt = imagePrompt.trim();

      if (selectedAttributes.length > 0) {
        // Group attributes by section
        const attributesBySection: { [key: string]: string[] } = {};
        selectedAttributes.forEach(attr => {
          const section = attributeSections[attr];
          if (section) {
            if (!attributesBySection[section]) {
              attributesBySection[section] = [];
            }
            attributesBySection[section].push(attr);
          }
        });

        // Build descriptive attribute text
        const attributeDescriptions = Object.entries(attributesBySection)
          .map(([section, attrs]) => `${section}: ${attrs.join(', ')}`)
          .join('; ');

        enhancedPrompt = `Generate me an image of ${enhancedPrompt} with the following specifications: ${attributeDescriptions}`;
      } else {
        enhancedPrompt = `Generate me an image of ${enhancedPrompt}`;
      }

      console.log('🚀 Sending enhanced prompt to API:', {
        originalPrompt: imagePrompt.trim(),
        selectedAttributes: selectedAttributes,
        enhancedPrompt: enhancedPrompt,
      });

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          originalPrompt: imagePrompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle structured error responses
        if (data.errorType) {
          setError(data.error);
          setErrorType(data.errorType);
          setIsRetryable(data.retryable || false);
        } else {
          setError(data.error || `HTTP ${response.status}: ${response.statusText}`);
          setErrorType('unknown');
          setIsRetryable(true);
        }
        setGenerateButtonState('generate');
        return;
      }

      setGeneratedImage(data);
      setGenerateButtonState('generate'); // Reset to generate for next image

      // Deduct 10 tokens from database after successful generation
      try {
        const deductResponse = await fetch('/api/deduct-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate',
            tokensUsed: 10,
          }),
        });

        if (deductResponse.ok) {
          const deductData = await deductResponse.json();
          setTokenCount(deductData.tokens_remaining);
        } else {
          const errorData = await deductResponse.json();
          console.error('Failed to deduct tokens:', errorData);

          // If insufficient tokens, show error and refresh count
          if (errorData.error === 'Insufficient tokens') {
            setError(
              'Insufficient gems. You need 10 gems to generate an image. Please purchase more gems.'
            );
            setErrorType('insufficient_tokens');
            setGenerateButtonState('generate');
            await refreshTokenCount();
            return;
          }
        }
      } catch (error) {
        console.error('Error deducting tokens:', error);
      }

      // Save image to S3 and database
      try {
        const saveResponse = await fetch('/api/save-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: data.imageUrl,
            prompt: imagePrompt.trim(),
            attributes: selectedAttributes,
            filename: `generated_${Date.now()}.png`,
          }),
        });

        if (saveResponse.ok) {
          const saveData = await saveResponse.json();
          console.log('✅ Image saved successfully:', saveData);

          // Update recent image for background with crossfade
          setIsFadingOut(true);

          // Wait for fade out to complete (5 seconds)
          setTimeout(() => {
            // Reset loaded state and set new image
            setIsImageLoaded(false);
            setRecentImageUrl(data.imageUrl);
            setIsFadingOut(false);

            // Preload the new image
            const img = new Image();
            img.onload = () => {
              setIsImageLoaded(true);
            };
            img.onerror = () => {
              console.error('Failed to load new background image');
              setIsImageLoaded(false);
            };
            img.src = data.imageUrl;
          }, 5000); // Wait 5 seconds for fade out

          // Refresh gallery if it's open
          if (isGalleryOpen) {
            fetchImages();
          }
        } else {
          console.error('❌ Failed to save image:', await saveResponse.text());
        }
      } catch (saveError) {
        console.error('❌ Error saving image:', saveError);
        // Don't show error to user - image still generated successfully
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      setError(error instanceof Error ? error.message : 'Image generation failed');
      setErrorType('network_error');
      setIsRetryable(true);
      setGenerateButtonState('generate');
    }
  };

  const handlePromptChange = (value: string) => {
    setImagePrompt(value);
    // Reset all state when prompt changes
    setSections([]);
    setSelectedAttributes([]);
    setAttributeSections({});
    setUsedSections([]);
    setGeneratedImage(null);
    setError('');
    setErrorType('');
    setIsRetryable(false);
    setRefinementCount(0);
  };

  const generateSectionOptions = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsLoadingAttributes(true);
    setError('');

    try {
      const response = await fetch('/api/generate-section-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          selectedAttributes: selectedAttributes.length > 0 ? selectedAttributes : undefined,
          usedSections: usedSections.length > 0 ? usedSections : undefined,
        }),
      });

      if (!response.ok) {
        // Try to get error details from response
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setSections(data.sections || []);

      // Add the new sections to used sections list
      const newSections = data.sections?.map((section: any) => section.name) || [];
      setUsedSections(prev => {
        const combined = [...prev, ...newSections];
        return [...new Set(combined)]; // Remove duplicates
      });
    } catch (error) {
      console.error('Section options generation failed:', error);

      // Show user-friendly error message for prompt validation issues
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate options';

      // Set error state to show to user
      setError(errorMessage);
      setErrorType('invalid_prompt');

      // Clear sections on error
      setSections([]);
    } finally {
      setIsLoadingAttributes(false);
      setRefineButtonState('refine');
    }
  };

  const handleAttributeToggle = (attribute: string) => {
    setSelectedAttributes(prev => {
      if (prev.includes(attribute)) {
        // Remove attribute and its section mapping
        const newAttributeSections = { ...attributeSections };
        delete newAttributeSections[attribute];
        setAttributeSections(newAttributeSections);
        return prev.filter(attr => attr !== attribute);
      } else {
        // Find which section this attribute belongs to
        const sectionName = sections.find(section =>
          section.options.includes(attribute)
        )?.name;

        if (sectionName) {
          // Add attribute and track its section
          setAttributeSections(prev => ({
            ...prev,
            [attribute]: sectionName,
          }));
        }
        return [...prev, attribute];
      }
    });
  };

  const handleToggleGallery = () => {
    if (!isGalleryOpen) {
      // Opening gallery: start the transition
      setIsGalleryOpen(true);
      // Wait 300ms for main content to adjust, then show gallery
      setTimeout(() => {
        setShowGallery(true);
      }, 300);
    } else {
      // Closing gallery: fade out first, then close
      setShowGallery(false);
      // Wait 500ms for gallery to fade out, then close
      setTimeout(() => {
        setIsGalleryOpen(false);
      }, 500);
    }
  };

  // Reset showGallery when isGalleryOpen changes to false
  useEffect(() => {
    if (!isGalleryOpen) {
      setShowGallery(false);
    }
  }, [isGalleryOpen]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <main className="flex-1 flex justify-center mx-2 my-2">
          <div className="bg-stone-950 rounded-lg shadow-lg border border-stone-700 w-full flex flex-col min-h-[calc(100vh-1rem)]">
            <div className="flex flex-1 justify-center items-center">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 w-12 h-12 border border-white rounded-full animate-expand-1"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show the tailor page for authenticated users
  return (
    <div className="min-h-screen bg-black flex flex-col overflow-y-auto lg:overflow-hidden lg:h-screen">
      <main className="flex-1 flex mx-2 my-2">
        <div
          className={`bg-stone-950 rounded-lg shadow-lg border border-stone-700 flex flex-col min-h-[calc(100vh-1rem)] lg:max-h-[calc(100vh-1rem)] transition-all duration-500 ease-in-out relative overflow-hidden ${
            isGalleryOpen ? 'w-4/5' : 'w-full'
          }`}
        >
          {/* Background Image */}
          {recentImageUrl && (
            <div className="absolute inset-0 z-0">
              <div
                className={`w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-[5000ms] ease-in-out ${
                  isFadingOut ? 'opacity-0' : isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${recentImageUrl})`,
                  filter: 'blur(20px) brightness(0.15)', // Made darker (0.15 instead of 0.3)
                  transform: 'scale(1.1)', // Slightly larger to avoid blur edges
                }}
              />
            </div>
          )}

          {/* Content with higher z-index */}
          <div className="relative z-10 flex flex-col h-full">
            <GenHeader
              onToggleGallery={handleToggleGallery}
              isGalleryOpen={isGalleryOpen}
              tokenCount={tokenCount}
              isLoadingTokens={isLoadingTokens}
            />
            <div className="flex flex-1 justify-center min-h-0 py-[5vh] lg:py-[10vh]">
              <div className="w-full lg:w-3/5 h-full px-4 lg:px-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start h-full max-h-full">
                  <ControlPanel
                    onPromptChange={handlePromptChange}
                    onRefine={handleRefine}
                    onGenerate={handleGenerateImage}
                    sections={sections}
                    selectedAttributes={selectedAttributes}
                    onAttributeToggle={handleAttributeToggle}
                    isLoadingAttributes={isLoadingAttributes}
                    refineButtonState={refineButtonState}
                    generateButtonState={generateButtonState}
                    refinementCount={refinementCount}
                    tokenCount={tokenCount}
                    isLoadingTokens={isLoadingTokens}
                  />
                  <ImageView
                    generatedImage={generatedImage}
                    error={error}
                    errorType={errorType}
                    isRetryable={isRetryable}
                    onRetry={handleGenerateImage}
                    isLoading={generateButtonState === 'generating'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery Panel */}
        <div
          className={`${
            isGalleryOpen ? 'w-1/5 ml-2' : 'w-0 overflow-hidden'
          } transition-all duration-500 ease-in-out`}
        >
          <ImageGallery
            isOpen={showGallery}
            onClose={() => {
              setShowGallery(false);
              setTimeout(() => setIsGalleryOpen(false), 500);
            }}
            images={savedImages}
            isLoading={isLoadingImages}
            onRefresh={fetchImages}
          />
        </div>
      </main>
    </div>
  );
}
