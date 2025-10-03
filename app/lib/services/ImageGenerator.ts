import OpenAI from "openai";

export interface ImageGenerationRequest {
  prompt: string;
  userId?: string;
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
    | "content_policy"
    | "rate_limit"
    | "quota_exceeded"
    | "network_error"
    | "invalid_prompt"
    | "unknown";
  message: string;
  userMessage: string;
  retryable: boolean;
}

export default class ImageGenerator {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private handleOpenAIError(error: any): ImageGenerationError {
    // Content policy violations
    if (
      error.code === "content_policy_violation" ||
      error.message?.toLowerCase().includes("content policy") ||
      error.message?.toLowerCase().includes("inappropriate content")
    ) {
      return {
        type: "content_policy",
        message: error.message || "Content policy violation",
        userMessage:
          "Your prompt contains content that violates our content policy. Please try a different prompt.",
        retryable: false,
      };
    }

    // Rate limiting
    if (
      error.code === "rate_limit_exceeded" ||
      error.status === 429 ||
      error.message?.toLowerCase().includes("rate limit")
    ) {
      return {
        type: "rate_limit",
        message: error.message || "Rate limit exceeded",
        userMessage: "Too many requests. Please wait a moment and try again.",
        retryable: true,
      };
    }

    // Quota exceeded
    if (
      error.code === "insufficient_quota" ||
      error.message?.toLowerCase().includes("quota") ||
      error.message?.toLowerCase().includes("billing")
    ) {
      return {
        type: "quota_exceeded",
        message: error.message || "Quota exceeded",
        userMessage:
          "Image generation quota exceeded. Please check your account limits.",
        retryable: false,
      };
    }

    // Network/connection errors
    if (
      error.code === "network_error" ||
      error.message?.toLowerCase().includes("network") ||
      error.message?.toLowerCase().includes("connection") ||
      error.message?.toLowerCase().includes("timeout")
    ) {
      return {
        type: "network_error",
        message: error.message || "Network error",
        userMessage:
          "Network connection error. Please check your internet connection and try again.",
        retryable: true,
      };
    }

    // Invalid prompt
    if (
      error.code === "invalid_request_error" &&
      error.message?.toLowerCase().includes("prompt")
    ) {
      return {
        type: "invalid_prompt",
        message: error.message || "Invalid prompt",
        userMessage:
          "Please provide a more descriptive prompt for image generation.",
        retryable: false,
      };
    }

    // Unknown error
    return {
      type: "unknown",
      message: error.message || "Unknown error occurred",
      userMessage: "An unexpected error occurred. Please try again.",
      retryable: true,
    };
  }

  async generateImage(
    data: ImageGenerationRequest
  ): Promise<ImageGenerationResult> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }

      if (!data.prompt || typeof data.prompt !== "string") {
        throw new Error("Prompt is required and must be a string");
      }

      // Generate image using OpenAI DALL-E 3
      console.log("🎨 Generating image with prompt:", data.prompt);

      const response = await this.client.images.generate({
        model: "dall-e-3",
        prompt: data.prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      });

      const imageUrl = response.data?.[0]?.url;

      if (!imageUrl) {
        throw new Error("Failed to generate image - no URL returned");
      }

      return {
        imageUrl,
        prompt: data.prompt,
        timestamp: new Date().toISOString(),
        model: "dall-e-3",
        size: "1024x1024",
      };
    } catch (error) {
      console.error("ImageGenerator error:", error);

      // Handle specific OpenAI errors gracefully
      const handledError = this.handleOpenAIError(error);

      // Create a custom error with additional context
      const customError = new Error(handledError.userMessage);
      (customError as any).errorType = handledError.type;
      (customError as any).retryable = handledError.retryable;
      (customError as any).originalMessage = handledError.message;

      throw customError;
    }
  }

  // Optional: Method to generate multiple images
  async generateMultipleImages(
    data: ImageGenerationRequest,
    count: number = 2
  ): Promise<ImageGenerationResult[]> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }

      if (!data.prompt || typeof data.prompt !== "string") {
        throw new Error("Prompt is required and must be a string");
      }

      if (count < 1 || count > 4) {
        throw new Error("Count must be between 1 and 4");
      }

      const response = await this.client.images.generate({
        model: "dall-e-3",
        prompt: data.prompt,
        n: count,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      });

      const results: ImageGenerationResult[] =
        response.data?.map((image) => ({
          imageUrl: image.url!,
          prompt: data.prompt,
          timestamp: new Date().toISOString(),
          model: "dall-e-3",
          size: "1024x1024",
        })) || [];

      return results;
    } catch (error) {
      console.error("ImageGenerator multiple images error:", error);
      throw new Error(
        `Failed to generate multiple images: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
