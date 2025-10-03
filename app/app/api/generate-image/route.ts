import { NextRequest, NextResponse } from "next/server";
import ImageGenerator from "../../../lib/services/ImageGenerator";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          error: "Prompt is required and must be a string",
          errorType: "invalid_prompt",
          retryable: false,
        },
        { status: 400 }
      );
    }

    const imageGenerator = new ImageGenerator();
    const result = await imageGenerator.generateImage({ prompt });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Image generation API error:", error);

    // Check if it's our custom error with additional context
    if (error instanceof Error && (error as any).errorType) {
      const errorType = (error as any).errorType;
      const retryable = (error as any).retryable;
      const originalMessage = (error as any).originalMessage;

      return NextResponse.json(
        {
          error: error.message,
          errorType,
          retryable,
          originalMessage,
        },
        {
          status:
            errorType === "content_policy"
              ? 400
              : errorType === "rate_limit"
              ? 429
              : errorType === "quota_exceeded"
              ? 402
              : 500,
        }
      );
    }

    // Fallback for unexpected errors
    return NextResponse.json(
      {
        error: "Failed to generate image",
        errorType: "unknown",
        retryable: true,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
