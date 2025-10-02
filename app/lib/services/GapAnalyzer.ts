interface GapAnalysis {
  missingSkills: string[];
  experienceGaps: string[];
  keywordGaps: string[];
  priority: "high" | "medium" | "low";
}

export default class GapAnalyzer {
  private openai: any;

  constructor() {
    const { OpenAI } = require("openai");
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_SECRET,
    });
  }

  async analyzeGaps(
    resume: string,
    jobDescription: string
  ): Promise<GapAnalysis> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Analyze gaps between a resume and job description. Return missing skills, experience gaps, and keyword gaps.",
          },
          {
            role: "user",
            content: `Resume: ${resume}\n\nJob Description: ${jobDescription}`,
          },
        ],
        temperature: 0.7,
      });

      // Parse the response and return structured data
      const content = response.choices[0].message.content;
      console.log("OpenAI Response:", content);

      // Use the actual OpenAI content (for now, parse it manually)
      // Later we can improve this with JSON format from OpenAI
      const parsedGaps = this.parseGapAnalysis(content, resume, jobDescription);

      return parsedGaps;
    } catch (error) {
      throw new Error(
        `Failed to analyze gaps: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // TODO: Improve this with JSON format from OpenAI
  private parseGapAnalysis(
    content: string,
    resume: string,
    jobDescription: string
  ): GapAnalysis {
    // Parse the OpenAI response content into structured data
    // This is a basic parser - we can improve this later with JSON format

    const missingSkills: string[] = [];
    const experienceGaps: string[] = [];
    const keywordGaps: string[] = [];

    // Simple keyword extraction logic
    const resumeLower = resume.toLowerCase();
    const jobLower = jobDescription.toLowerCase();

    // Check for common technical skills
    const techSkills = [
      "typescript",
      "python",
      "docker",
      "kubernetes",
      "react",
      "node.js",
      "aws",
      "azure",
    ];
    techSkills.forEach((skill) => {
      if (jobLower.includes(skill) && !resumeLower.includes(skill)) {
        missingSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });

    // Check for seniority indicators
    if (jobLower.includes("senior") && !resumeLower.includes("senior")) {
      experienceGaps.push("Senior-level experience");
    }

    if (jobLower.includes("lead") && !resumeLower.includes("lead")) {
      experienceGaps.push("Leadership experience");
    }

    // Extract keywords from job description
    const jobKeywords = jobDescription.toLowerCase().match(/\b[a-z]+\b/g) || [];
    jobKeywords.forEach((keyword) => {
      if (
        keyword.length > 3 &&
        !resumeLower.includes(keyword) &&
        !techSkills.includes(keyword)
      ) {
        keywordGaps.push(keyword);
      }
    });

    const priority =
      missingSkills.length > 3 || experienceGaps.length > 1
        ? "high"
        : missingSkills.length > 1
        ? "medium"
        : "low";

    return {
      missingSkills,
      experienceGaps,
      keywordGaps: keywordGaps.slice(0, 5), // Limit to top 5
      priority,
    };
  }
}

export type { GapAnalysis };
