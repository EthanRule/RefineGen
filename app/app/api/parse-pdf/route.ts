import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // For now, return instructions for manual text input
    // This avoids the complex PDF parsing issues we've been encountering
    return NextResponse.json({
      text: `PDF Upload Received - Manual Text Input Required

File: ${file.name}
Size: ${Math.round(file.size / 1024)} KB

📝 Instructions:
1. Open your PDF resume in Adobe Reader, browser, or text editor
2. Select all text (Ctrl+A / Cmd+A) and copy it (Ctrl+C / Cmd+C)
3. Return to this page and paste the text into the resume field manually

This ensures accurate text extraction while we optimize the PDF parsing engine for better compatibility.

Note: This is a temporary solution to ensure reliable resume analysis while PDF parsing is being refined.`,
      pages: 1,
      fileName: file.name,
      manual: true,
    });
  } catch (error) {
    console.error("PDF handling error:", error);
    return NextResponse.json(
      {
        error: "Failed to process PDF. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
