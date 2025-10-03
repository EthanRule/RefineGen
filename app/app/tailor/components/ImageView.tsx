import ImagePreview from "./ImagePreview";
import ActionButtons from "./ActionButtons";

interface ImageViewProps {
  generatedImage?: {
    imageUrl: string;
    prompt: string;
    timestamp: string;
    model: string;
    size: string;
  } | null;
  error?: string;
  errorType?: string;
  isRetryable?: boolean;
  onRetry?: () => void;
}

export default function ImageView({
  generatedImage,
  error,
  errorType,
  isRetryable,
  onRetry,
}: ImageViewProps) {
  return (
    <div className="lg:col-span-2 flex flex-col">
      <ImagePreview
        imageUrl={generatedImage?.imageUrl}
        error={error}
        errorType={errorType}
        isRetryable={isRetryable}
        onRetry={onRetry}
      />
      <ActionButtons
        imageUrl={generatedImage?.imageUrl}
        prompt={generatedImage?.prompt}
      />
    </div>
  );
}
