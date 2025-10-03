"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/footer/Footer";
import LoadingCard from "../components/ui/LoadingCard";
import ControlPanel from "./components/ControlPanel";
import ImageView from "./components/ImageView";

interface ImageGenerationResults {
  imageUrl: string;
  prompt: string;
  timestamp: string;
}

export default function Tailor() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for image generation
  const [imagePrompt, setImagePrompt] = useState<string>("");
  const [generatedImage, setGeneratedImage] =
    useState<ImageGenerationResults | null>(null);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?callbackUrl=/tailor");
    }
  }, [status, router]);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setError("Please enter an image prompt");
      return;
    }

    setError("");
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: imagePrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedImage(data);
    } catch (error) {
      console.error("Image generation failed:", error);
      setError(
        error instanceof Error ? error.message : "Image generation failed"
      );
    }
  };

  const handlePromptChange = (value: string) => {
    setImagePrompt(value);
  };

  // Show loading state while checking authentication
  if (status === "loading") {
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
  if (status === "unauthenticated") {
    return null;
  }

  // Show the tailor page for authenticated users
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <main className="flex-1 flex justify-center mx-2 my-2">
        {/* Main Content Area */}
        <div className="bg-stone-950 rounded-lg shadow-lg border border-stone-700 w-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => router.push("/")}
              className="text-white hover:bg-zinc-800 active:bg-zinc-700 rounded-lg hover:text-gray-300 transition-colors p-1"
              title="Go to Homepage"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </button>

            {/* Placeholder for future header icons */}
            <div className="flex items-center space-x-4">
              {/* Future icons can go here */}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 justify-center">
            <div className="w-3/5 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <ControlPanel
                  onPromptChange={handlePromptChange}
                  onStart={handleGenerateImage}
                />

                {/* Image Display */}
                <div className="lg:col-span-2 flex flex-col min-h-0">
                  <ImageView generatedImage={generatedImage} error={error} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
