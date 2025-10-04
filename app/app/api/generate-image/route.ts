import { NextRequest, NextResponse } from 'next/server';
import ImageGenerator from '../../../lib/services/ImageGenerator';

/**
 * Sanitizes a prompt by removing or escaping potentially problematic characters
 * while preserving the core meaning for image generation
 */
function sanitizePrompt(prompt: string): string {
  return (
    prompt
      // Remove or replace control characters (except newlines and tabs)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize whitespace (replace multiple spaces with single space)
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
      // Limit to reasonable length (additional safety check)
      .substring(0, 200)
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          errorType: 'invalid_request',
          retryable: false,
        },
        { status: 400 }
      );
    }

    const { prompt } = requestBody;

    // Validate prompt exists and is a string
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        {
          error: 'Prompt is required and must be a string',
          errorType: 'invalid_prompt',
          retryable: false,
        },
        { status: 400 }
      );
    }

    // Validate prompt length (max 200 characters)
    if (prompt.length > 200) {
      return NextResponse.json(
        {
          error: 'Prompt must be 200 characters or less',
          errorType: 'invalid_prompt',
          retryable: false,
        },
        { status: 400 }
      );
    }

    // Sanitize the prompt
    const sanitizedPrompt = sanitizePrompt(prompt);

    // Validate sanitized prompt is not empty
    if (!sanitizedPrompt.trim()) {
      return NextResponse.json(
        {
          error: 'Prompt contains only invalid characters',
          errorType: 'invalid_prompt',
          retryable: false,
        },
        { status: 400 }
      );
    }

    const imageGenerator = new ImageGenerator();
    const result = await imageGenerator.generateImage({
      prompt: sanitizedPrompt,
      model: 'dall-e-3',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Image generation API error:', error);

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
            errorType === 'content_policy'
              ? 400
              : errorType === 'rate_limit'
              ? 429
              : errorType === 'quota_exceeded'
              ? 402
              : 500,
        }
      );
    }

    // Fallback for unexpected errors
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        errorType: 'unknown',
        retryable: true,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
