import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import ImageGenerator from '../../../lib/services/ImageGenerator';
import { imageGenerationRateLimit, addRateLimitHeaders } from '../../../lib/rateLimit';
import { apiLogger, extractUserInfo, generateRequestId } from '../../../lib/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  const requestId = generateRequestId();

  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      apiLogger.warn('Unauthorized image generation attempt', { requestId });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userInfo = extractUserInfo(session);
    apiLogger.info('Image generation request started', {
      requestId,
      userId: userInfo.userId,
      userEmail: userInfo.userEmail,
    });

    // Check user has sufficient tokens (10 gems for generation)
    if (!session.user.email) {
      apiLogger.warn('User email not found in session', { requestId });
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tokens_remaining: true, tokens_used_total: true },
    });

    if (!user) {
      apiLogger.warn('User not found in database', {
        requestId,
        userEmail: userInfo.userEmail,
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tokensRequired = 10;
    if ((user.tokens_remaining || 0) < tokensRequired) {
      apiLogger.warn('Insufficient tokens for image generation', {
        requestId,
        userId: userInfo.userId,
        tokens_remaining: user.tokens_remaining || 0,
        tokens_required: tokensRequired,
      });
      return NextResponse.json(
        {
          error:
            'Insufficient gems. You need 10 gems to generate an image. Please purchase more gems.',
          errorType: 'quota_exceeded',
          retryable: false,
        },
        { status: 400 }
      );
    }

    // Deduct tokens before generating image
    await prisma.user.update({
      where: { email: session.user.email! },
      data: {
        tokens_remaining: (user.tokens_remaining || 0) - tokensRequired,
        tokens_used_total: (user.tokens_used_total || 0) + tokensRequired,
      },
    });

    apiLogger.info('Tokens deducted for image generation', {
      requestId,
      userId: userInfo.userId,
      tokens_deducted: tokensRequired,
      tokens_remaining: (user.tokens_remaining || 0) - tokensRequired,
    });

    // Apply rate limiting
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResponse = imageGenerationRateLimit(request);
    if (rateLimitResponse) {
      apiLogger.warn('Rate limit exceeded for image generation', {
        requestId,
        userId: userInfo.userId,
        ip,
      });
      return rateLimitResponse;
    }

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

    const { prompt, originalPrompt } = requestBody;

    // Use originalPrompt for validation if provided, otherwise use prompt
    const promptToValidate = originalPrompt || prompt;

    // Validate prompt exists and is a string
    if (!promptToValidate || typeof promptToValidate !== 'string') {
      return NextResponse.json(
        {
          error: 'Prompt is required and must be a string',
          errorType: 'invalid_prompt',
          retryable: false,
        },
        { status: 400 }
      );
    }

    // Validate original prompt length (max 200 characters) - not the enhanced prompt
    if (promptToValidate.length > 200) {
      return NextResponse.json(
        {
          error: 'Prompt must be 200 characters or less',
          errorType: 'invalid_prompt',
          retryable: false,
        },
        { status: 400 }
      );
    }

    // Sanitize the enhanced prompt (the one actually used for generation)
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

    // Check if prompt is just repeated characters (e.g., "aaaaaaa" or "ddddddd")
    const uniqueChars = new Set(sanitizedPrompt.replace(/\s/g, '').toLowerCase());
    if (uniqueChars.size <= 2 && sanitizedPrompt.length > 10) {
      return NextResponse.json(
        {
          error: 'Please provide a more descriptive prompt',
          errorType: 'invalid_prompt',
          retryable: false,
        },
        { status: 400 }
      );
    }

    // Check if prompt has at least some meaningful content (has vowels and consonants)
    const hasVowels = /[aeiou]/i.test(sanitizedPrompt);
    const hasConsonants = /[bcdfghjklmnpqrstvwxyz]/i.test(sanitizedPrompt);
    if (!hasVowels || !hasConsonants) {
      return NextResponse.json(
        {
          error: 'Please provide a more descriptive prompt with actual words',
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

    const response = NextResponse.json(result);
    apiLogger.info('Image generation completed successfully', {
      requestId,
      userId: userInfo.userId,
      promptLength: sanitizedPrompt.length,
    });
    return addRateLimitHeaders(response, ip, { windowMs: 60 * 1000, maxRequests: 5 });
  } catch (error) {
    // Get session again for error logging (in case it wasn't available earlier)
    const session = await getServerSession(authConfig);
    const userInfo = extractUserInfo(session);
    apiLogger.error('Image generation API error', error as Error, {
      requestId,
      userId: userInfo.userId,
    });

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
