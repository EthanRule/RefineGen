// TODO: Slowly read through this file and make sure it works as intended.

import ImageGenerator from '../../../lib/services/ImageGenerator';

// Mock OpenAI
jest.mock('openai', () => {
  const mockGenerate = jest.fn();
  return {
    __esModule: true,
    default: jest.fn(() => ({
      images: {
        generate: mockGenerate,
      },
    })),
    mockGenerate, // Export the mock for use in tests
  };
});

describe('ImageGenerator', () => {
  let imageGenerator: ImageGenerator;
  let mockGenerate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';

    imageGenerator = new ImageGenerator();

    const openai = require('openai');
    mockGenerate = openai.mockGenerate;
  });

  describe('generateImage', () => {
    it('should generate image successfully', async () => {
      const mockResponse = {
        data: [
          {
            url: 'https://example.com/generated-image.jpg',
          },
        ],
      };

      mockGenerate.mockResolvedValue(mockResponse);

      const result = await imageGenerator.generateImage({
        prompt: 'A beautiful sunset',
        model: 'dall-e-3',
      });

      expect(result).toEqual({
        imageUrl: 'https://example.com/generated-image.jpg',
        prompt: 'A beautiful sunset',
        timestamp: expect.any(String),
        model: 'dall-e-3',
        size: '1024x1024',
      });

      expect(mockGenerate).toHaveBeenCalledWith({
        model: 'dall-e-3',
        prompt: 'A beautiful sunset',
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      });
    });

    it('should handle content policy violations', async () => {
      const mockError = {
        code: 'content_policy_violation',
        message: 'Content policy violation',
      };
      mockGenerate.mockRejectedValue(mockError);

      await expect(
        imageGenerator.generateImage({
          prompt: 'Inappropriate content',
          model: 'dall-e-3',
        })
      ).rejects.toThrow(
        'Your prompt contains content that violates our content policy. Please try a different prompt.'
      );
    });

    it('should handle rate limit errors', async () => {
      const mockError = {
        code: 'rate_limit_exceeded',
        message: 'Rate limit exceeded',
      };
      mockGenerate.mockRejectedValue(mockError);

      await expect(
        imageGenerator.generateImage({
          prompt: 'Test prompt',
          model: 'dall-e-3',
        })
      ).rejects.toThrow('Too many requests. Please wait a moment and try again.');
    });

    it('should handle quota exceeded errors', async () => {
      const mockError = {
        code: 'insufficient_quota',
        message: 'Quota exceeded',
      };
      mockGenerate.mockRejectedValue(mockError);

      await expect(
        imageGenerator.generateImage({
          prompt: 'Test prompt',
          model: 'dall-e-3',
        })
      ).rejects.toThrow('Image generation quota exceeded. Please check your account limits.');
    });

    it('should handle network errors', async () => {
      const mockError = {
        code: 'network_error',
        message: 'Network error',
      };
      mockGenerate.mockRejectedValue(mockError);

      await expect(
        imageGenerator.generateImage({
          prompt: 'Test prompt',
          model: 'dall-e-3',
        })
      ).rejects.toThrow(
        'Network connection error. Please check your internet connection and try again.'
      );
    });

    it('should handle invalid prompt errors', async () => {
      const mockError = {
        code: 'invalid_request_error',
        message: 'Invalid prompt',
      };
      mockGenerate.mockRejectedValue(mockError);

      await expect(
        imageGenerator.generateImage({
          prompt: 'Test prompt',
          model: 'dall-e-3',
        })
      ).rejects.toThrow('Please provide a more descriptive prompt for image generation.');
    });

    it('should handle missing image URL', async () => {
      const mockResponse = {
        data: [
          {
            url: null,
          },
        ],
      };

      mockGenerate.mockResolvedValue(mockResponse);

      await expect(
        imageGenerator.generateImage({
          prompt: 'A beautiful sunset',
          model: 'dall-e-3',
        })
      ).rejects.toThrow('An unexpected error occurred. Please try again.');
    });

    it('should handle empty data array', async () => {
      const mockResponse = {
        data: [],
      };

      mockGenerate.mockResolvedValue(mockResponse);

      await expect(
        imageGenerator.generateImage({
          prompt: 'A beautiful sunset',
          model: 'dall-e-3',
        })
      ).rejects.toThrow('An unexpected error occurred. Please try again.');
    });

    it('should handle missing prompt', async () => {
      await expect(
        imageGenerator.generateImage({
          prompt: '',
          model: 'dall-e-3',
        })
      ).rejects.toThrow('An unexpected error occurred. Please try again.');
    });

    it('should handle null prompt', async () => {
      await expect(
        imageGenerator.generateImage({
          prompt: null as any,
          model: 'dall-e-3',
        })
      ).rejects.toThrow('An unexpected error occurred. Please try again.');
    });

    it('should handle unknown errors', async () => {
      const mockError = new Error('Unknown error');
      mockGenerate.mockRejectedValue(mockError);

      await expect(
        imageGenerator.generateImage({
          prompt: 'Test prompt',
          model: 'dall-e-3',
        })
      ).rejects.toThrow('An unexpected error occurred. Please try again.');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API key during generation', async () => {
      delete process.env.OPENAI_API_KEY;

      const newGenerator = new ImageGenerator();

      await expect(
        newGenerator.generateImage({
          prompt: 'Test prompt',
          model: 'dall-e-3',
        })
      ).rejects.toThrow('An unexpected error occurred. Please try again.');
    });
  });

  describe('Error Context', () => {
    it('should include error context in thrown errors', async () => {
      const mockError = {
        code: 'content_policy_violation',
        message: 'Content policy violation',
      };
      mockGenerate.mockRejectedValue(mockError);

      try {
        await imageGenerator.generateImage({
          prompt: 'Inappropriate content',
          model: 'dall-e-3',
        });
      } catch (error: any) {
        expect(error.errorType).toBe('content_policy');
        expect(error.retryable).toBe(false);
        expect(error.originalMessage).toBe('Content policy violation');
      }
    });

    it('should mark rate limit errors as retryable', async () => {
      const mockError = {
        code: 'rate_limit_exceeded',
        message: 'Rate limit exceeded',
      };
      mockGenerate.mockRejectedValue(mockError);

      try {
        await imageGenerator.generateImage({
          prompt: 'Test prompt',
          model: 'dall-e-3',
        });
      } catch (error: any) {
        expect(error.errorType).toBe('rate_limit');
        expect(error.retryable).toBe(true);
      }
    });
  });
});
