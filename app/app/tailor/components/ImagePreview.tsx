"use client";

import { useState, useEffect } from "react";

interface ImagePreviewProps {
  imageUrl?: string;
  error?: string;
  errorType?: string;
  isRetryable?: boolean;
  onRetry?: () => void;
}

export default function ImagePreview({
  imageUrl,
  error,
  errorType,
  isRetryable,
  onRetry,
}: ImagePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset loading state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [imageUrl]);
  const getErrorIcon = () => {
    switch (errorType) {
      case "content_policy":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        );
      case "rate_limit":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
      case "quota_exceeded":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        );
      case "network_error":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        );
      default:
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case "content_policy":
        return "text-yellow-400";
      case "rate_limit":
        return "text-blue-400";
      case "quota_exceeded":
        return "text-red-400";
      case "network_error":
        return "text-orange-400";
      default:
        return "text-red-400";
    }
  };

  return (
    <div
      className={`rounded-lg h-[40rem] min-h-[600px] max-h-[800px] w-full relative ${
        imageUrl
          ? "bg-transparent border-none p-0"
          : "bg-zinc-900 p-6 border-2 border-dashed border-zinc-700"
      }`}
    >
      <div className="h-full flex items-center justify-center">
        {error ? (
          <div className="text-center bg-zinc-900 p-6 rounded-lg border-2 border-dashed border-zinc-700">
            <svg
              className={`mx-auto h-16 w-16 mb-4 ${getErrorColor()}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {getErrorIcon()}
            </svg>
            <p className={`text-lg font-medium mb-2 ${getErrorColor()}`}>
              {errorType === "content_policy"
                ? "Content Policy Violation"
                : errorType === "rate_limit"
                ? "Rate Limit Exceeded"
                : errorType === "quota_exceeded"
                ? "Quota Exceeded"
                : errorType === "network_error"
                ? "Network Error"
                : "Error"}
            </p>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            {isRetryable && onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        ) : imageUrl ? (
          <>
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-zinc-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-stone-400">
                  <svg
                    className="mx-auto h-16 w-16 mb-4 animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Loading image...</p>
                </div>
              </div>
            )}
            <img
              src={imageUrl}
              alt="Generated image"
              className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="eager"
              decoding="sync"
              style={{
                imageRendering: "auto",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="text-center text-stone-400">
            <svg
              className="mx-auto h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-medium">Image Preview</p>
            <p className="text-sm">Generated image will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
