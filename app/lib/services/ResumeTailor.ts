import GapAnalyzer, { SkillGaps } from "./GapAnalyzer";
import GapFillerSearch, { GapFiller } from "./GapFillerSearch";
import DocxGenerator from "./DocxGenerator";

interface TailorRequest {
  resumeFilePath: string;
  jobDescription: string;
  userId: string;
  githubAccessToken?: string;
}

interface TailorResponse {
  tailoredResume: string;
  gaps: SkillGaps;
  gapFillers: GapFiller[];
  recommendations: string[];
}

export default class ResumeTailor {
  private gapAnalyzer: GapAnalyzer;
  private gapFillerSearch: GapFillerSearch;
  private docxGenerator: DocxGenerator;

  constructor() {
    this.gapAnalyzer = new GapAnalyzer();
    this.gapFillerSearch = new GapFillerSearch();
    this.docxGenerator = new DocxGenerator();
  }

  async tailorResume(data: TailorRequest): Promise<TailorResponse> {
    try {
      // Step 1: Analyze gaps between DOCX resume and job description
      const gaps = await this.gapAnalyzer.gapAnalysis(
        data.resumeFilePath,
        data.jobDescription
      );

      console.log("gaps", gaps);

      // Step 2: Find GitHub projects to fill the gaps (commented for now)
      const gapFillers: GapFiller[] = [];

      // Step 3: Generate tailored resume content (simplified for now)
      const tailoredResume = `Tailored Resume for: ${
        data.jobDescription
      }\n\nGaps identified: ${gaps.missingSkills.join(", ")}`;

      return {
        tailoredResume,
        gaps,
        gapFillers,
        recommendations: [
          `Found ${gaps.missingSkills.length} missing skills`,
          "Resume successfully analyzed",
        ],
      };
    } catch (error) {
      throw new Error(
        `Resume tailoring failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
