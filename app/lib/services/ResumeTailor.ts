import GapAnalyzer, { GapAnalysis } from "./GapAnalyzer";
import GapFillerSearch, { GapFiller } from "./GapFillerSearch";
import DocxGenerator from "./DocxGenerator";

interface TailorRequest {
  resume: string;
  jobDescription: string;
  userId: string;
  githubAccessToken?: string;
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
  private docxGenerator: DocxGenerator;

  constructor() {
    this.gapAnalyzer = new GapAnalyzer();
    this.gapFillerSearch = new GapFillerSearch();
    this.docxGenerator = new DocxGenerator();
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

      // Step 3: Generate tailored resume content
      const tailoredContent = `${data.resume}\n\n--- GPT TAILORING ANALYSIS ---\n${data.jobDescription}\n\nFor more detailed analysis with DOCX, please upload your DOCX file.`;

      return {
        tailoredResume: tailoredContent,
        gaps,
        gapFillers,
        recommendations: [
          `Identified ${gaps.missingSkills.length} missing skills`,
          `Found ${gapFillers.length} relevant GitHub projects`,
          `Priority level: ${gaps.priority}`,
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
