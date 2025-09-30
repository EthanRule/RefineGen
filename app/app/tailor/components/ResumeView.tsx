import ResumePreview from "./ResumePreview";
import ActionButtons from "./ActionButtons";

export default function ResumeView() {
  return (
    <div className="lg:col-span-2 flex flex-col">
      <ResumePreview />
      <ActionButtons />
    </div>
  );
}
