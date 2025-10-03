import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

interface TailoredResumeData {
  docxFile: Buffer; // Raw DOCX file buffer
  fileName: string;
  jobDescription: string;
  gaps: {
    missingSkills: string[];
    experienceGaps: string[];
    keywordGaps: string[];
    priority: string;
  };
  gapFillers: Array<{
    projectName: string;
    description: string;
    skills: string[];
    relevance: number;
    githubUrl: string;
  }>;
}

interface TailoredDocxResult {
  tailoredDocx: Buffer;
  summary: string;
  changes: string[];
}

export default class DocxGenerator {
  private openai: any;

  constructor() {
    const { OpenAI } = require("openai");
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateTailoredResume(
    data: TailoredResumeData
  ): Promise<TailoredDocxResult> {
    try {
      // Save DOCX file temporarily for OpenAI
      const tempFilePath = await this.saveTempDocx(
        data.docxFile,
        data.fileName
      );

      try {
        // Send DOCX file to OpenAI with instructions
        const response = await this.openai.files.create({
          file: fs.createReadStream(tempFilePath),
          purpose: "assistants",
        });

        const completion = await this.openai.chat.completions.create({
          model: "gpt-5", // Use vision-capable model for DOCX
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: this.createPrompt(
                    data.jobDescription,
                    data.gaps,
                    data.gapFillers
                  ),
                },
                {
                  type: "file_url",
                  file_url: {
                    url: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${data.docxFile.toString(
                      "base64"
                    )}`,
                    filename: data.fileName,
                  },
                },
              ],
            },
          ],
          max_tokens: 4000,
        });

        // For now, return the original file with instructions
        // In production, you'd need OpenAI's assistants API to modify files
        return {
          tailoredDocx: data.docxFile,
          summary:
            completion.choices[0]?.message?.content || "Analysis completed",
          changes: [
            `Identified ${data.gaps.missingSkills.length} missing skills`,
            `Found ${data.gapFillers.length} relevant GitHub projects`,
            `Priority level: ${data.gaps.priority}`,
          ],
        };
      } finally {
        // Clean up temp file
        await fsPromises.unlink(tempFilePath).catch(console.error);
      }
    } catch (error) {
      console.error("Error generating tailored DOCX:", error);
      throw new Error("Failed to generate tailored resume");
    }
  }

  private createPrompt(
    jobDescription: string,
    gaps: any,
    gapFillers: any[]
  ): string {
    return `
Please analyze this DOCX resume and provide tailored improvements for this job description:

JOB DESCRIPTION:
${jobDescription}

GAPS ANALYSIS:
- Missing Skills: ${gaps.missingSkills.join(", ")}
- Experience Gaps: ${gaps.experienceGaps.join(", ")}
- Keyword Gaps: ${gaps.keywordGaps.join(", ")}
- Priority: ${gaps.priority}

RELEVANT GITHUB PROJECTS:
${gapFillers
  .map(
    (project) =>
      `- ${project.projectName} (${Math.round(
        project.relevance * 100
      )}% relevant): ${project.description.substring(0, 100)}...`
  )
  .join("\n")}

Please provide:
1. Specific resume improvements tailored to this job
2. Skills/keywords to emphasize
3. Projects to highlight with descriptions
4. Any formatting or structure recommendations

Focus on making the resume explicitly match the job requirements while maintaining professionalism.
`;
  }

  private async saveTempDocx(
    buffer: Buffer,
    fileName: string
  ): Promise<string> {
    const tempDir = "/tmp";
    const fileExt = path.extname(fileName);
    const baseName = path.basename(fileName, fileExt);
    const tempFilePath = path.join(
      tempDir,
      `${baseName}_${Date.now()}${fileExt}`
    );

    await fsPromises.writeFile(tempFilePath, buffer);
    return tempFilePath;
  }
}
