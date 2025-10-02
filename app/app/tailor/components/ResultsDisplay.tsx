"use client";

import ResumeView from "./ResumeView";

interface ResultsDisplayProps {
  results: any;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results) {
    return (
      <div className="flex-1 bg-gray-700 rounded-lg p-4 overflow-auto">
        <ResumeView />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-auto">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Gap Analysis Results
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <span className="font-medium text-black">Missing Skills:</span>
            <ul className="list-disc list-inside text-sm text-black mt-1">
              {results.gaps?.missingSkills?.map(
                (skill: string, index: number) => (
                  <li key={index}>{skill}</li>
                )
              )}
            </ul>
          </div>
          <div>
            <span className="font-medium text-black">Experience Gaps:</span>
            <ul className="list-disc list-inside text-sm text-black mt-1">
              {results.gaps?.experienceGaps?.map(
                (gap: string, index: number) => (
                  <li key={index}>{gap}</li>
                )
              )}
            </ul>
          </div>
          <div>
            <span className="font-medium text-black">Priority:</span>
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
          {results.gapFillers?.map((project: any, index: number) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
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
                {project.skills?.map((skill: string, skillIndex: number) => (
                  <span
                    key={skillIndex}
                    className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
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
          ))}
        </div>
      </div>
    </div>
  );
}
