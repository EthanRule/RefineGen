"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/footer/Footer";
import LoadingCard from "../components/ui/LoadingCard";
import ControlPanel from "./components/ControlPanel";
import ResumeView from "./components/ResumeView";

interface AnalysisResults {
  gaps: any;
  gapFillers: any[];
  tailoredResume: string;
  recommendations: string[];
}

export default function Tailor() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for inputs
  const [jobDescription, setJobDescription] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?callbackUrl=/tailor");
    }
  }, [status, router]);

  const handleStartAnalysis = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    if (!resumeText.trim()) {
      setError("Please upload a resume");
      return;
    }

    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Analysis failed:", error);
      setError(error instanceof Error ? error.message : "Analysis failed");
    }
  };

  const handleResumeChange = (file: File | null, text: string) => {
    setResumeFile(file);
    setResumeText(text);
  };

  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-700">
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
      <Header props={{ status, session }} />
      <main className="flex-1 flex mx-3 my-3">
        {/* Main Content Area */}
        <div className="flex-1 bg-gray-600 rounded-lg shadow-lg p-6 flex border border-gray-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            <ControlPanel
              onJobDescriptionChange={handleJobDescriptionChange}
              onResumeChange={handleResumeChange}
              onStart={handleStartAnalysis}
            />

            {/* Results Display */}
            <div className="lg:col-span-2 flex flex-col min-h-0">
              {results ? (
                <div className="flex-1 flex flex-col gap-4 overflow-auto">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Gap Analysis Results
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="font-medium text-black">
                          Missing Skills:
                        </span>
                        <ul className="list-disc list-inside text-sm text-black mt-1">
                          {results.gaps?.missingSkills?.map(
                            (skill: string, index: number) => (
                              <li key={index}>{skill}</li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-black">
                          Experience Gaps:
                        </span>
                        <ul className="list-disc list-inside text-sm text-black mt-1">
                          {results.gaps?.experienceGaps?.map(
                            (gap: string, index: number) => (
                              <li key={index}>{gap}</li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-black">
                          Priority:
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            results.gaps?.priority === "high"
                              ? "bg-gray-200 text-gray-800"
                              : results.gaps?.priority === "medium"
                              ? "bg-gray-300 text-gray-800"
                              : "bg-gray-400 text-gray-800"
                          }`}
                        >
                          {results.gaps?.priority || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Relevant GitHub Projects
                    </h3>
                    <div className="space-y-3">
                      {results.gapFillers?.map(
                        (project: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">
                                {project.projectName}
                              </h4>
                              <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                                {Math.round(project.relevance * 100)}% relevant
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {project.skills?.map(
                                (skill: string, skillIndex: number) => (
                                  <span
                                    key={skillIndex}
                                    className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-700 text-sm hover:underline"
                            >
                              View on GitHub →
                            </a>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-gray-700 rounded-lg p-4 overflow-auto">
                  <ResumeView />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
