import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  Tab,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";

interface TailoredResumeData {
  originalContent: string;
  tailoredContent: string;
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

export class DocxGenerator {
  async generateTailoredResume(data: TailoredResumeData): Promise<Buffer> {
    try {
      // Create the document with proper formatting
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: await this.createResumeContent(data),
          },
        ],
      });

      // Generate the DOCX buffer
      const buffer = await Packer.toBuffer(doc);
      return buffer;
    } catch (error) {
      console.error("Error generating DOCX:", error);
      throw new Error("Failed to generate tailored resume");
    }
  }

  private async createResumeContent(
    data: TailoredResumeData
  ): Promise<Paragraph[]> {
    const content: Paragraph[] = [];

    // Try to extract and preserve the original structure
    const originalStructure = this.parseOriginalStructure(data.originalContent);

    // Generate the tailored content
    const tailoredStructure = this.generateTailoredStructure(
      data,
      originalStructure
    );

    // Convert structure to DOCX paragraphs
    content.push(...tailoredStructure);

    return content;
  }

  private parseOriginalStructure(originalContent: string): any {
    // Parse the original DOCX structure
    // This is a simplified version - you could enhance this with better parsing
    const lines = originalContent.split("\n");
    const structure = {
      contact: [] as string[],
      objective: [] as string[],
      experience: [] as string[],
      education: [] as string[],
      skills: [] as string[],
    };

    let currentSection = "contact";
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (this.isSectionHeader(trimmedLine)) {
        currentSection = this.identifySection(trimmedLine);
      } else {
        structure[currentSection as keyof typeof structure].push(trimmedLine);
      }
    }

    return structure;
  }

  private generateTailoredStructure(
    data: TailoredResumeData,
    originalStructure: any
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Add contact section
    if (originalStructure.contact.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: originalStructure.contact[0],
              bold: true,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );

      if (originalStructure.contact.length > 1) {
        for (let i = 1; i < originalStructure.contact.length; i++) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: originalStructure.contact[i],
                  size: 12,
                }),
              ],
              alignment: AlignmentType.CENTER,
            })
          );
        }
      }
    }

    // Add tailored content sections
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "TAILORED RESUME",
            bold: true,
            size: 20,
            underline: UnderlineType.SINGLE,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Key Improvements Made:",
            bold: true,
            size: 14,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    // Add missing skills that were addressed
    if (data.gaps.missingSkills.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Skills Added:",
              bold: true,
              size: 12,
            }),
          ],
        })
      );

      for (const skill of data.gaps.missingSkills.slice(0, 5)) {
        // Limit to 5 skills
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "• " + skill,
                size: 11,
              }),
            ],
            indent: { left: 400 },
          })
        );
      }
    }

    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

    // Add project recommendations
    if (data.gapFillers.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Recommended Projects to Highlight:",
              bold: true,
              size: 12,
            }),
          ],
        })
      );

      for (const project of data.gapFillers.slice(0, 3)) {
        // Limit to 3 projects
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text:
                  "• " +
                  project.projectName +
                  " (" +
                  Math.round(project.relevance * 100) +
                  "% relevant)",
                bold: true,
                size: 11,
              }),
            ],
            indent: { left: 400 },
          })
        );

        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "  " + project.description.substring(0, 100) + "...",
                size: 10,
                italics: true,
              }),
            ],
            indent: { left: 400 },
          })
        );
      }
    }

    // Add the original resume content (tailored)
    if (data.tailoredContent) {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "UPDATED RESUME CONTENT",
              bold: true,
              size: 14,
              underline: UnderlineType.SINGLE,
            }),
          ],
        })
      );

      // Add the tailored content
      const tailoredLines = data.tailoredContent.split("\n");
      for (const line of tailoredLines.slice(0, 50)) {
        // Limit content to stay on page
        if (line.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 10,
                }),
              ],
            })
          );
        }
      }
    }

    return paragraphs;
  }

  private isSectionHeader(text: string): boolean {
    const headers = [
      "EXPERIENCE",
      "WORK EXPERIENCE",
      "EDUCATION",
      "SKILLS",
      "TECHNICAL SKILLS",
      "PROJECTS",
      "SUMMARY",
      "OBJECTIVE",
    ];
    return headers.some(
      (header) =>
        text.toUpperCase().includes(header) || text.toUpperCase() === header
    );
  }

  private identifySection(text: string): string {
    const upperText = text.toUpperCase();
    if (upperText.includes("EXPERIENCE") || upperText.includes("WORK"))
      return "experience";
    if (upperText.includes("EDUCATION")) return "education";
    if (upperText.includes("SKILL")) return "skills";
    if (upperText.includes("PROJECT")) return "projects";
    if (upperText.includes("SUMMARY") || upperText.includes("OBJECTIVE"))
      return "objective";
    return "experience"; // default
  }
}
