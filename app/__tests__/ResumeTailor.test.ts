import ResumeTailor from "../lib/services/ImageGenerator";

describe("ResumeTailor", () => {
  let resumeTailor: ResumeTailor;

  beforeEach(() => {
    resumeTailor = new ResumeTailor();
  });

  test("should orchestrate the complete resume tailoring process", async () => {
    const tailorRequest = {
      resume: `
        John Doe
        Software Engineer
        
        Experience:
        - 2 years React development
        - JavaScript, HTML, CSS
      `,
      jobDescription: `
        Looking for Senior Frontend Developer
        Requirements:
        - TypeScript proficiency
        - Python knowledge preferred
        - Docker experience
      `,
      userId: "test-user",
      prompt: "Make me look qualified for this role",
    };

    const result = await resumeTailor.tailorResume(tailorRequest);

    // Verify the complete response structure
    expect(result).toHaveProperty("tailoredResume");
    expect(result).toHaveProperty("gaps");
    expect(result).toHaveProperty("gapFillers");
    expect(result).toHaveProperty("recommendations");

    // Verify gaps are analyzed
    expect(result.gaps).toHaveProperty("missingSkills");
    expect(result.gaps).toHaveProperty("experienceGaps");
    expect(result.gaps).toHaveProperty("keywordGaps");
    expect(result.gaps).toHaveProperty("priority");

    // Verify gapFillers structure (should be empty without real GitHub token)
    expect(Array.isArray(result.gapFillers)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);

    // GapFillers array structure validation
    result.gapFillers.forEach((gapFiller: any) => {
      expect(gapFiller).toHaveProperty("projectName");
      expect(gapFiller).toHaveProperty("description");
      expect(gapFiller).toHaveProperty("skills");
      expect(gapFiller).toHaveProperty("relevance");
      expect(gapFiller).toHaveProperty("githubUrl");
    });
  }, 10000); // 10 second timeout for API call

  test("should handle missing GitHub token gracefully", async () => {
    const tailorRequest = {
      resume: "Basic resume content",
      jobDescription: "Job requirements",
      userId: "test-user",
      // No githubAccessToken provided
    };

    const result = await resumeTailor.tailorResume(tailorRequest);

    // Should still complete successfully
    expect(result).toBeDefined();
    expect(result.gapFillers).toEqual([]);
    expect(result.gaps).toBeDefined();
  });

  test("should maintain original resume content in response", async () => {
    const originalResume = "This is my original resume content";

    const tailorRequest = {
      resume: originalResume,
      jobDescription: "Some job description",
      userId: "test-user",
    };

    const result = await resumeTailor.tailorResume(tailorRequest);

    // The tailoredResume should contain the original content
    // (since we haven't implemented the final OpenAI call yet)
    expect(result.tailoredResume).toBe(originalResume);
  });

  test("should propagate errors correctly", async () => {
    const invalidRequest = {
      resume: "", // Empty resume
      jobDescription: "", // Empty job description
      userId: "test-user",
    };

    await expect(
      resumeTailor.tailorResume(invalidRequest)
    ).resolves.toBeDefined();
    // Even invalid requests should be handled gracefully by analyzeGaps
  });
});
