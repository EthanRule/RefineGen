import ImagePreview from './ImagePreview';
import { ActionButtons } from '../buttons';

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
    <div className="lg:col-span-2 flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <ImagePreview
          imageUrl={generatedImage?.imageUrl}
          error={error}
          errorType={errorType}
          isRetryable={isRetryable}
          onRetry={onRetry}
        />
      </div>
      <div className="flex-shrink-0">
        <ActionButtons imageUrl={generatedImage?.imageUrl} prompt={generatedImage?.prompt} />
      </div>
    </div>
  );
}
