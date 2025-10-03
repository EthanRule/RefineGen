import fs from "fs";
import OpenAI from "openai";
import { File } from "node:buffer";

if (!globalThis.File) {
  globalThis.File = File as any;
}

export interface SkillGaps {
  missingSkills: string[];
}

export default class GapAnalyzer {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI();
  }

  async gapAnalysis(
    filePath: string,
    jobDescription: string
  ): Promise<SkillGaps> {
    try {
      // Upload file to OpenAI
      const file = await this.client.files.create({
        file: fs.createReadStream(filePath),
        purpose: "user_data",
      });

      // Use the correct OpenAI responses API
      const response = await this.client.responses.create({
        model: "gpt-5",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                file_id: file.id,
              },
              {
                type: "input_text",
                text: `Job Description: ${jobDescription}\n\nAnalyze this DOCX resume and identify missing skills compared to the job requirements. Return missing skills as a JSON array.`,
              },
            ],
          },
        ],
      });

      console.log("OpenAI response:", response.output_text);

      // Parse the JSON response
      const result = JSON.parse(response.output_text || "{}");

      // Clean up uploaded file
      await this.client.files.delete(file.id);

      return result as SkillGaps;
    } catch (error) {
      console.error("GapAnalyzer error:", error);
      throw new Error(
        `Failed to analyze DOCX gaps: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
