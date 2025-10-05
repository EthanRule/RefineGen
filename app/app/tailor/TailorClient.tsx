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
import TailorHeader from './components/panels/TailorHeader';
import ImageGallery from './components/panels/ImageGallery';

interface ImageGenerationResults {
  imageUrl: string;
  prompt: string;
  timestamp: string;
  model: string;
  size: string;
}

export default function TailorClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for image generation
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResults | null>(null);
  const [error, setError] = useState<string>('');
  const [errorType, setErrorType] = useState<string>('');
  const [isRetryable, setIsRetryable] = useState<boolean>(false);

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

  const handleRefine = async () => {
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

    // Increment refinement count
    setRefinementCount(prev => prev + 1);
  };

  const handleGenerateImage = async () => {
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
    setIsGalleryOpen(prev => !prev);
  };

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
          className={`bg-stone-950 rounded-lg shadow-lg border border-stone-700 flex flex-col min-h-[calc(100vh-1rem)] lg:max-h-[calc(100vh-1rem)] transition-all duration-300 ease-in-out ${
            isGalleryOpen ? 'w-4/5 mr-2' : 'w-full'
          }`}
        >
          <TailorHeader onToggleGallery={handleToggleGallery} isGalleryOpen={isGalleryOpen} />
          <div className="flex flex-1 justify-center min-h-0 py-[5vh] lg:py-[10vh]">
            <div className="w-full lg:w-3/5 h-full px-4 lg:px-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch h-full max-h-full">
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
                />
                <ImageView
                  generatedImage={generatedImage}
                  error={error}
                  errorType={errorType}
                  isRetryable={isRetryable}
                  onRetry={handleGenerateImage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery Panel */}
        {isGalleryOpen && (
          <ImageGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
        )}
      </main>
    </div>
  );
}
