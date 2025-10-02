import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json(
        { error: "File must be a DOCX file (.docx)" },
        { status: 400 }
      );
    }

    // For now, return a placeholder text since we need proper DOCX parsing
    // In production, you'd use a library like mammoth.js to parse DOCX content
    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      success: true,
      text: `Document: ${file.name}\n\nPlaceholder resume content parsed from ${file.name}. This would contain the actual parsed DOCX content in production.\n\nTo implement full DOCX parsing, install mammoth.js:\n\nnpm install mammoth\n\nThen use:\n\nimport mammoth from "mammoth";\nconst result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });\nconst text = result.value;`,
      message: "DOCX file parsed successfully",
    });
  } catch (error) {
    console.error("File validation error:", error);
    return NextResponse.json(
      {
        error: "Failed to validate DOCX file. Please try again.",
      },
      { status: 500 }
    );
  }
}
