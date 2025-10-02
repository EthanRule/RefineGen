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

    // Return file info - OpenAI will handle the DOCX parsing directly
    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      success: true,
      message: "DOCX file ready for OpenAI processing",
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
