"use client";

import { useState } from "react";

interface ResumeSelectorProps {
  onResumeChange?: (file: File | null, text: string) => void;
}

export default function ResumeSelector({
  onResumeChange,
}: ResumeSelectorProps) {
  const [resumeText, setResumeText] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    setIsParsing(true);

    try {
      // Parse PDF server-side
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to parse PDF: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.text;

      setResumeText(text);
      onResumeChange?.(file, text);
    } catch (error) {
      console.error("Error parsing PDF:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error parsing PDF. Please try again."
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveFile = () => {
    setResumeText("");
    onResumeChange?.(null, "");
    const fileInput = document.getElementById(
      "resume-pdf-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Resume Upload (PDF Only)
      </label>

      {!resumeText ? (
        <div className="relative">
          <input
            id="resume-pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isParsing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="w-full px-3 py-6 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50 text-center hover:border-gray-500 transition-colors">
            {isParsing ? (
              <div className="text-gray-600">
                <div className="w-8 h-8 mx-auto mb-2 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm">Parsing PDF...</p>
              </div>
            ) : (
              <div className="text-gray-600">
                <svg
                  className="mx-auto h-12 w-12 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 8.98M17 12l-4 4-4 4"
                  />
                </svg>
                <p className="text-sm font-medium">
                  Click to upload PDF resume
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF files only</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-black">
                  PDF Successfully Uploaded
                </p>
                <p className="text-xs text-gray-600">
                  {resumeText.length} characters extracted
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              disabled={isParsing}
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="text-xs text-gray-600">
            <span className="font-medium text-black">Status:</span> Ready for
            analysis
          </div>
        </div>
      )}
    </div>
  );
}
