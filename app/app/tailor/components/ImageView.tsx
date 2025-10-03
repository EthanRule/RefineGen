import ImagePreview from "./ImagePreview";
import ActionButtons from "./ActionButtons";

interface ImageViewProps {
  generatedImage?: {
    imageUrl: string;
    prompt: string;
    timestamp: string;
  } | null;
  error?: string;
}

export default function ImageView({ generatedImage, error }: ImageViewProps) {
  return (
    <div className="lg:col-span-2 flex flex-col">
      <ImagePreview imageUrl={generatedImage?.imageUrl} error={error} />
      <ActionButtons
        imageUrl={generatedImage?.imageUrl}
        prompt={generatedImage?.prompt}
      />
    </div>
  );
}
