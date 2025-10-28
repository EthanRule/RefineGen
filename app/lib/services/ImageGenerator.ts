import OpenAI from 'openai';

export interface ImageGenerationRequest {
  prompt: string;
  userId?: string;
  model: 'dall-e-3';
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  timestamp: string;
  model: string;
  size: string;
}

export interface ImageGenerationError {
  type:
    | 'content_policy'
    | 'rate_limit'
    | 'quota_exceeded'
    | 'network_error'
    | 'invalid_prompt'
    | 'unknown';
  message: string;
  userMessage: string;
  retryable: boolean;
}

export default class ImageGenerator {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateImage(data: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      } else if (!data.prompt || typeof data.prompt !== 'string') {
        throw new Error('Prompt is required and must be a string');
      }

      const response = await this.client.images.generate({
        model: data.model,
        prompt: data.prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      });

      const imageUrl = response.data?.[0]?.url;

      if (!imageUrl) {
        throw new Error('Failed to generate image - no URL returned');
      }

      return {
        imageUrl,
        prompt: data.prompt,
        timestamp: new Date().toISOString(),
        model: 'dall-e-3',
        size: '1024x1024',
      };
    } catch (error) {
      console.error('ImageGenerator error:', error);
      const handledError = this.handleOpenAIError(error);
      const customError = new Error(handledError.userMessage);
      (customError as any).errorType = handledError.type;
      (customError as any).retryable = handledError.retryable;
      (customError as any).originalMessage = handledError.message;

      throw customError;
    }
  }

  private handleOpenAIError(error: any): ImageGenerationError {
    // Content policy violations
    if (
      error.code === 'content_policy_violation' ||
      error.message?.toLowerCase().includes('content policy') ||
      error.message?.toLowerCase().includes('inappropriate content')
    ) {
      return {
        type: 'content_policy',
        message: error.message || 'Content policy violation',
        userMessage:
          'Your prompt contains content that violates our content policy. Please try a different prompt.',
        retryable: false,
      };
    }

    // Rate limiting
    if (
      error.code === 'rate_limit_exceeded' ||
      error.status === 429 ||
      error.message?.toLowerCase().includes('rate limit')
    ) {
      return {
        type: 'rate_limit',
        message: error.message || 'Rate limit exceeded',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        retryable: true,
      };
    }

    // Quota exceeded
    if (
      error.code === 'insufficient_quota' ||
      error.message?.toLowerCase().includes('quota') ||
      error.message?.toLowerCase().includes('billing')
    ) {
      return {
        type: 'quota_exceeded',
        message: error.message || 'Quota exceeded',
        userMessage: 'Image generation quota exceeded. Please contact support.',
        retryable: false,
      };
    }

    // Network/connection errors
    if (
      error.code === 'network_error' ||
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('connection') ||
      error.message?.toLowerCase().includes('timeout')
    ) {
      return {
        type: 'network_error',
        message: error.message || 'Network error',
        userMessage:
          'Network connection error. RefineGen is experiencing network problems, please contact support.',
        retryable: true,
      };
    }

    // Invalid prompt
    if (
      error.code === 'invalid_request_error' &&
      error.message?.toLowerCase().includes('prompt')
    ) {
      return {
        type: 'invalid_prompt',
        message: error.message || 'Invalid prompt',
        userMessage: 'Please provide a more descriptive prompt for image generation.',
        retryable: false,
      };
    }

    // Unknown error
    return {
      type: 'unknown',
      message: error.message || 'Unknown error occurred',
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: true,
    };
  }
}
