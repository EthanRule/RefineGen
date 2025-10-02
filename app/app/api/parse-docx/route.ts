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

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Parse DOCX to HTML/structured text
    const mammoth = await import("mammoth");
    const result = await mammoth.convertToHtml({ buffer: uint8Array });
    const text = await mammoth.extractRawText({ buffer: uint8Array });

    return NextResponse.json({
      text: text.value,
      html: result.value,
      messages: result.messages,
      fileName: file.name,
      success: true,
    });
  } catch (error) {
    console.error("DOCX parsing error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to parse DOCX file. Please try again or upload a different file.",
      },
      { status: 500 }
    );
  }
}
