'use client';

// This is the main client for the application. This page is where all the magic happens.
// This is where users interact with the application, refine prompts, and generate images.
// TODO: Add a custom error handling API for errors.

// TODO: This css needs to be modularized and cleaned up, its so simple, yet so non extensible right now.

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
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
  isMeme?: boolean;
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

  // Description:
  // fetchRecentImage is a state machine that fetches the most recent image
  // under the user's account and updates the background.
  //
  // How it works:
  // First it fetches the recent image url, then it tells the old image to fade out and then
  // it waits 5 seconds. After 5 seconds it sets the new image url and tells the new image to load.
  // This state machine works with the css:
  //   className={`w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-[5000ms] ease-in-out ${
  //   isFadingOut ? 'opacity-0' : isImageLoaded ? 'opacity-100' : 'opacity-0'
  // }`}

  const [recentImageUrl, setRecentImageUrl] = useState<string | null>(null); // Background image
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false); // Track if background image is loaded
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false); // Track if old image is fading out
  const fetchRecentImage = async () => {
    try {
      const response = await fetch('/api/recent-image');
      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.recentImage?.publicUrl || null;

        if (imageUrl && imageUrl !== recentImageUrl) {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsImageLoaded(false);
            setRecentImageUrl(imageUrl);
            setIsFadingOut(false);
            const img = new Image();
            img.onload = () => {
              setIsImageLoaded(true);
            };
            img.onerror = () => {
              setIsImageLoaded(false);
              throw new Error('Failed to load background image');
            };
            img.src = imageUrl;
          }, 5000);
        } else if (imageUrl === recentImageUrl) {
          if (!isImageLoaded) {
            const img = new Image();
            img.onload = () => {
              setIsImageLoaded(true);
            };
            img.onerror = () => {
              setIsImageLoaded(false);
              throw new Error('Failed to load background image');
            };
            img.src = imageUrl;
          }
        } else {
          setIsFadingOut(true);
          setTimeout(() => {
            setRecentImageUrl(null);
            setIsImageLoaded(false);
            setIsFadingOut(false);
          }, 5000);
        }
      } else {
        throw new Error('Failed to fetch recent image');
      }
    } catch (error) {
      // TODO: Add a custom error handling API for errors.
    }
  };

  // fetchTokenCount fetches the user's token count from the server.
  const fetchTokenCount = async () => {
    setIsLoadingTokens(true);
    try {
      const response = await fetch('/api/user-tokens');
      if (response.ok) {
        const data = await response.json();
        setTokenCount(data.tokens_remaining || 0);
      } else {
        throw new Error('Failed to fetch token count');
      }
    } catch (error) {
      // TODO: Add a custom error handling API for errors.
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // fetchImages fetches the user's saved images from the server.
  const fetchImages = async () => {
    setIsLoadingImages(true);
    try {
      const response = await fetch('/api/get-images');
      console.log('🔍 DEBUG - Fetch images response:', JSON.stringify(response, null, 2));
      if (response.ok) {
        const data = await response.json();
        setSavedImages(data.images || []);
      } else {
        throw new Error('Failed to fetch images');
      }
    } catch (error) {
      // TODO: Add a custom error handling API for errors.
    } finally {
      setIsLoadingImages(false);
    }
  };

  // handleRefine send an API request to generate sections and section options.
  const handleRefine = async () => {
    if (tokenCount < 3) {
      setError('Insufficient gems. You need 3 gems to refine. Please purchase more gems.');
      setErrorType('insufficient_tokens');
      return;
    }

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
    setIsLoadingAttributes(true);

    try {
      const response = await fetch('/api/generate-section-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          selectedAttributes: selectedAttributes.length > 0 ? selectedAttributes : undefined,
          usedSections: usedSections.length > 0 ? usedSections : undefined,
        }),
      });

      if (!response.ok) {
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
      const newSections = data.sections?.map((section: any) => section.name) || [];
      setUsedSections(prev => {
        const combined = [...prev, ...newSections];
        return [...new Set(combined)];
      });

      // Refresh token count after successful refinement
      await fetchTokenCount();

      // Increment refinement count
      setRefinementCount(prev => prev + 1);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate options';

      setError(errorMessage);
      setErrorType('invalid_prompt');

      setSections([]);
    } finally {
      setIsLoadingAttributes(false);
      setRefineButtonState('refine');
    }
  };

  const handleAttributeToggle = (attribute: string) => {
    setSelectedAttributes(prev => {
      if (prev.includes(attribute)) {
        const newAttributeSections = { ...attributeSections };
        delete newAttributeSections[attribute];
        setAttributeSections(newAttributeSections);
        return prev.filter(attr => attr !== attribute);
      } else {
        const sectionName = sections.find(section =>
          section.options.includes(attribute)
        )?.name;

        if (sectionName) {
          setAttributeSections(prev => ({
            ...prev,
            [attribute]: sectionName,
          }));
        }
        return [...prev, attribute];
      }
    });
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
      let enhancedPrompt = imagePrompt.trim();

      if (selectedAttributes.length > 0) {
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

        const attributeDescriptions = Object.entries(attributesBySection)
          .map(([section, attrs]) => `${section}: ${attrs.join(', ')}`)
          .join('; ');

        enhancedPrompt = `Generate me an image of ${enhancedPrompt} with the following specifications: ${attributeDescriptions}`;
      } else {
        enhancedPrompt = `Generate me an image of ${enhancedPrompt}`;
      }

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
      setGenerateButtonState('generate');

      await fetchTokenCount();

      // Only save to S3 if it's not a meme
      if (!data.isMeme) {
        // Save image
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
            setIsFadingOut(true);
            setTimeout(() => {
              setIsImageLoaded(false);
              setRecentImageUrl(data.imageUrl);
              setIsFadingOut(false);
              const img = new Image();
              img.onload = () => {
                setIsImageLoaded(true);
              };
              img.onerror = () => {
                setIsImageLoaded(false);
                throw new Error('Failed to load new background image');
              };
              img.src = data.imageUrl;
            }, 5000);

            if (isGalleryOpen) {
              fetchImages();
            }
          } else {
            throw new Error('Failed to save image');
          }
        } catch (saveError) {
          throw new Error('Failed to save image');
        }
      } else {
        // For memes, just update the background image without saving to S3
        setIsFadingOut(true);
        setTimeout(() => {
          setIsImageLoaded(false);
          setRecentImageUrl(data.imageUrl);
          setIsFadingOut(false);
          const img = new Image();
          img.onload = () => {
            setIsImageLoaded(true);
          };
          img.onerror = () => {
            setIsImageLoaded(false);
            throw new Error('Failed to load new background image');
          };
          img.src = data.imageUrl;
        }, 5000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Image generation failed');
      setErrorType('network_error');
      setIsRetryable(true);
      setGenerateButtonState('generate');
    }
  };

  const handlePromptChange = (value: string) => {
    setImagePrompt(value);
  };

  const handleReset = () => {
    //Alert users refinements will be cleaered.

    setImagePrompt('');
    setSections([]);
    setSelectedAttributes([]);
    setAttributeSections({});
    setUsedSections([]);
    setError('');
    setErrorType('');
    setIsRetryable(false);
    setRefinementCount(0);
  };

  const handleToggleGallery = () => {
    if (!isGalleryOpen) {
      setIsGalleryOpen(true);
      setTimeout(() => {
        setShowGallery(true);
      }, 300);
    } else {
      setShowGallery(false);
      setTimeout(() => {
        setIsGalleryOpen(false);
      }, 500);
    }
  };

  // Update gem count and background image when session, user, or email changes.
  useEffect(() => {
    if (session?.user?.email) {
      fetchTokenCount();
      fetchRecentImage();
    }
  }, [session?.user?.email]);

  // Fetch images when gallery opens
  useEffect(() => {
    if (isGalleryOpen) {
      fetchImages();
    }
  }, [isGalleryOpen]);

  // Reset showGallery
  useEffect(() => {
    if (!isGalleryOpen) {
      setShowGallery(false);
    }
  }, [isGalleryOpen]);
  // Loading state
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

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-y-auto lg:overflow-hidden lg:h-screen">
      <main className="flex-1 flex mx-2 my-2">
        <div
          className={`bg-stone-950 rounded-lg shadow-lg border border-stone-700 flex flex-col min-h-[calc(100vh-1rem)] lg:max-h-[calc(100vh-1rem)] transition-all duration-500 ease-in-out relative overflow-hidden ${
            isGalleryOpen ? 'w-4/5' : 'w-full'
          }`}
        >
          {recentImageUrl && (
            <div className="absolute inset-0 z-0">
              <div
                className={`w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-[5000ms] ease-in-out ${
                  isFadingOut ? 'opacity-0' : isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${recentImageUrl})`,
                  filter: 'blur(20px) brightness(0.15)',
                  transform: 'scale(1.1)',
                }}
              />
            </div>
          )}
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
                    promptValue={imagePrompt}
                    onPromptChange={handlePromptChange}
                    onRefine={handleRefine}
                    onGenerate={handleGenerateImage}
                    onReset={handleReset}
                    sections={sections}
                    selectedAttributes={selectedAttributes}
                    onAttributeToggle={handleAttributeToggle}
                    isLoadingAttributes={isLoadingAttributes}
                    refineButtonState={refineButtonState}
                    generateButtonState={generateButtonState}
                    refinementCount={refinementCount}
                    tokenCount={tokenCount}
                    isLoadingTokens={isLoadingTokens}
                    isGalleryOpen={isGalleryOpen}
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
