export default function ResumePreview() {
  return (
    <div className="bg-zinc-900 rounded-lg p-6 border-2 border-dashed border-zinc-700 h-[40rem] min-h-[600px] max-h-[800px] w-full">
      <div className="h-full flex items-center justify-center">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium">Resume Preview</p>
          <p className="text-sm">Generated resume will appear here</p>
        </div>
      </div>
    </div>
  );
}
