import GapAnalyzer, { GapAnalysis } from "./GapAnalyzer";
import GapFillerSearch, { GapFiller } from "./GapFillerSearch";

interface TailorRequest {
  resume: string;
  jobDescription: string;
  userId: string;
  githubAccessToken?: string;
  prompt?: string;
}

interface TailorResponse {
  tailoredResume: string;
  gaps: GapAnalysis;
  gapFillers: GapFiller[];
  recommendations: string[];
}

export default class ResumeTailor {
  private gapAnalyzer: GapAnalyzer;
  private gapFillerSearch: GapFillerSearch;

  constructor() {
    this.gapAnalyzer = new GapAnalyzer();
    this.gapFillerSearch = new GapFillerSearch();
  }

  async tailorResume(data: TailorRequest): Promise<TailorResponse> {
    try {
      // Step 1: Analyze gaps between resume and job description
      const gaps = await this.gapAnalyzer.analyzeGaps(
        data.resume,
        data.jobDescription
      );

      // Step 2: Find GitHub projects to fill the gaps
      const gapFillers = await this.gapFillerSearch.findGapFillers(
        gaps,
        data.userId,
        data.githubAccessToken
      );

      console.log("gaps", gaps);

      console.log("gapFillers", gapFillers);

      // Step 3: Generate tailored resume with recommendations
      const result = await this.generateTailoredResume({
        originalResume: data.resume,
        gaps,
        gapFillers,
        prompt: data.prompt,
        jobDescription: data.jobDescription,
      });

      return result;
    } catch (error) {
      throw new Error(
        `Resume tailoring failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async generateTailoredResume(data: {
    originalResume: string;
    gaps: GapAnalysis;
    gapFillers: GapFiller[];
    prompt?: string;
    jobDescription: string;
  }): Promise<TailorResponse> {
    // Give OpenAI the resume, gaps, and gap fillers
    // Output tailored resume recommendations
    // Generate final tailored resume content

    // TODO: Implement final OpenAI call
    return {
      tailoredResume: data.originalResume,
      gaps: data.gaps,
      gapFillers: data.gapFillers,
      recommendations: [],
    };
  }
}
