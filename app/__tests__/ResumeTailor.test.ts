import ResumeTailor from "../lib/services/ResumeTailor";

describe("ResumeTailor", () => {
  let resumeTailor: ResumeTailor;

  beforeEach(() => {
    resumeTailor = new ResumeTailor();
  });

  test("should analyze gaps between resume and job description", async () => {
    // Sample data
    const resume = `
      John Doe
      Software Engineer
      
      Experience:
      - 2 years React development
      - 1 year Node.js
      - JavaScript, HTML, CSS
    `;

    const jobDescription = `
      Looking for Senior Frontend Developer
      Requirements:
      - 5+ years React experience
      - TypeScript proficiency
      - Python knowledge preferred
      - Docker experience
      - Team leadership skills
    `;

    // Test the private analyzeGaps method using type assertion
    const gaps = await (resumeTailor as any).analyzeGaps(
      resume,
      jobDescription
    );

    // Verify the structure of the response
    expect(gaps).toHaveProperty("missingSkills");
    expect(gaps).toHaveProperty("experienceGaps");
    expect(gaps).toHaveProperty("keywordGaps");
    expect(gaps).toHaveProperty("priority");

    expect(Array.isArray(gaps.missingSkills)).toBe(true);
    expect(Array.isArray(gaps.experienceGaps)).toBe(true);
    expect(Array.isArray(gaps.keywordGaps)).toBe(true);
    expect(["high", "medium", "low"]).toContain(gaps.priority);

    // Check specific gaps should be identified
    expect(gaps.missingSkills).toContain("Typescript");
    expect(gaps.missingSkills).toContain("Python");
    expect(gaps.missingSkills).toContain("Docker");
  }, 10000); // 10 second timeout for API call

  test("should handle API errors gracefully", async () => {
    // This test will pass if the mock data is returned due to network issues
    const invalidResume = "";
    const invalidJobDescription = "";

    await expect(
      (resumeTailor as any).analyzeGaps(invalidResume, invalidJobDescription)
    ).resolves.toBeDefined();
  });
});
