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

interface ImageGenerationResults {
  imageUrl: string;
  prompt: string;
  timestamp: string;
  model: string;
  size: string;
}

export default function Tailor() {
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
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth?callbackUrl=/tailor');
    }
  }, [status, router]);

  const handleRefine = async () => {
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
      // Don't show error to user for attribute generation failures
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

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-700">
        <Header props={{ status, session }} />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingCard />
            <p className="text-white mt-4">Checking authentication...</p>
          </div>
        </main>
        <Footer props={{ status, session }} />
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  // Show the tailor page for authenticated users
  return (
    <div className="min-h-screen bg-black flex flex-col overflow-y-auto lg:overflow-hidden lg:h-screen">
      <main className="flex-1 flex justify-center mx-2 my-2">
        <div className="bg-stone-950 rounded-lg shadow-lg border border-stone-700 w-full flex flex-col min-h-[calc(100vh-1rem)] lg:max-h-[calc(100vh-1rem)]">
          <TailorHeader />
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
                />
                <div className="lg:col-span-2 flex flex-col h-full">
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
        </div>
      </main>
    </div>
  );
}
