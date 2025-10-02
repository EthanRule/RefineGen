import { NextRequest, NextResponse } from "next/server";
import { DocxGenerator } from "@/lib/services/DocxGenerator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalContent, tailoredContent, gaps, gapFillers } = body;

    if (!originalContent || !tailoredContent) {
      return NextResponse.json(
        { error: "Missing required data for DOCX generation" },
        { status: 400 }
      );
    }

    const docxGenerator = new DocxGenerator();

    const buffer = await docxGenerator.generateTailoredResume({
      originalContent,
      tailoredContent,
      gaps: gaps || {
        missingSkills: [],
        experienceGaps: [],
        keywordGaps: [],
        priority: "low",
      },
      gapFillers: gapFillers || [],
    });

    // Return the DOCX file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="tailored-resume.docx"',
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("DOCX generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate tailored DOCX resume. Please try again.",
      },
      { status: 500 }
    );
  }
}
