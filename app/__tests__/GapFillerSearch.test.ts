import GapFillerSearch from "../lib/services/GapFillerSearch";
import { GapAnalysis } from "../lib/services/GapAnalyzer";

describe("GapFillerSearch", () => {
  let gapFillerSearch: GapFillerSearch;

  beforeEach(() => {
    gapFillerSearch = new GapFillerSearch();
  });

  test("should return empty array when no GitHub token provided", async () => {
    const gaps: GapAnalysis = {
      missingSkills: ["Python", "Docker"],
      experienceGaps: ["Leadership"],
      keywordGaps: ["microservices"],
      priority: "medium",
    };
    const userId = "test-user";

    const result = await gapFillerSearch.findGapFillers(gaps, userId);

    expect(result).toEqual([]);
  });

  test("should extract skills from repository data", async () => {
    const mockRepos = [
      {
        name: "react-app",
        description: "A React application with TypeScript and Docker setup",
        language: "TypeScript",
        topics: ["react", "docker"],
        size: 1000,
        html_url: "https://github.com/user/react-app",
      },
      {
        name: "python-api",
        description: "FastAPI backend with PostgreSQL",
        language: "Python",
        topics: ["api", "postgresql", "fastapi"],
        size: 5000,
        html_url: "https://github.com/user/python-api",
      },
    ];

    const gaps: GapAnalysis = {
      missingSkills: ["python", "docker"],
      experienceGaps: [],
      keywordGaps: ["api"],
      priority: "high",
    };

    const result = await (gapFillerSearch as any).analyzeReposForGaps(
      mockRepos,
      gaps
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("projectName");
    expect(result[0]).toHaveProperty("skills");
    expect(result[0]).toHaveProperty("relevance");
    expect(result[0]).toHaveProperty("githubUrl");

    expect(result[0].skills).toContain("typescript");
    expect(result[0].skills).toContain("docker");
    expect(result[1].skills).toContain("python");
    expect(result[1].skills).toContain("api");
  });
});
