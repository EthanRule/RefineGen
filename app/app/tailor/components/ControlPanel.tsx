import JobDescriptionInput from "./JobDescriptionInput";
import PromptInput from "./PromptInput";
import ResumeSelector from "./ResumeSelector";
import StartButton from "./StartButton";
import TokensDisplay from "./TokensDisplay";

export default function ControlPanel() {
  return (
    <div className="lg:col-span-1 space-y-6">
      <JobDescriptionInput />
      <PromptInput />
      <ResumeSelector />
      <StartButton />
      <TokensDisplay />
    </div>
  );
}
