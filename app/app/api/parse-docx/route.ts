import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

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

    // Store the DOCX file temporarily for OpenAI to process
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temp directory if it doesn't exist
    const tempDir = "/tmp";
    const fileName = `resume_${Date.now()}_${file.name}`;
    const filePath = join(tempDir, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      success: true,
      filePath: filePath,
      message: "DOCX file stored successfully for OpenAI processing",
    });
  } catch (error) {
    console.error("File storage error:", error);
    return NextResponse.json(
      {
        error: "Failed to store DOCX file. Please try again.",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
