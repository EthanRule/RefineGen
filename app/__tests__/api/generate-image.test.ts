import { NextRequest } from 'next/server';
import { POST } from '../../app/api/generate-image/route';
import ImageGenerator from '../../lib/services/ImageGenerator';

// Mock the ImageGenerator
jest.mock('../../lib/services/ImageGenerator');
const MockedImageGenerator = ImageGenerator as jest.MockedClass<typeof ImageGenerator>;

describe('/api/generate-image', () => {
  let mockImageGenerator: jest.Mocked<ImageGenerator>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockImageGenerator = { generateImage: jest.fn() } as any;
    MockedImageGenerator.mockImplementation(() => mockImageGenerator);
  });

  describe('Input Validation', () => {
    it('should return 400 for missing prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required and must be a string');
      expect(data.errorType).toBe('invalid_prompt');
      expect(data.retryable).toBe(false);
    });

    it('should return 400 for null prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: null }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required and must be a string');
    });

    it('should return 400 for non-string prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: 123 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required and must be a string');
    });

    it('should return 400 for empty string prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: '' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required and must be a string');
    });

    it('should return 400 for prompt longer than 200 characters', async () => {
      const longPrompt = 'a'.repeat(201);
      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: longPrompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt must be 200 characters or less');
      expect(data.errorType).toBe('invalid_prompt');
      expect(data.retryable).toBe(false);
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON in request body');
      expect(data.errorType).toBe('invalid_request');
      expect(data.retryable).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize prompt with control characters', async () => {
      const promptWithControlChars = 'A cat\x00\x01with\x02control\x03chars';
      const expectedSanitizedPrompt = 'A catwithcontrolchars';

      mockImageGenerator.generateImage.mockResolvedValue({
        imageUrl: 'https://example.com/image.png',
        prompt: expectedSanitizedPrompt,
        timestamp: '2023-01-01T00:00:00.000Z',
        model: 'dall-e-3',
        size: '1024x1024',
      });

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: promptWithControlChars }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockImageGenerator.generateImage).toHaveBeenCalledWith({
        prompt: expectedSanitizedPrompt,
        model: 'dall-e-3',
      });
      expect(data.imageUrl).toBe('https://example.com/image.png');
    });

    it('should normalize whitespace in prompt', async () => {
      const promptWithExtraSpaces = 'A   cat    with    extra     spaces';
      const expectedSanitizedPrompt = 'A cat with extra spaces';

      mockImageGenerator.generateImage.mockResolvedValue({
        imageUrl: 'https://example.com/image.png',
        prompt: expectedSanitizedPrompt,
        timestamp: '2023-01-01T00:00:00.000Z',
        model: 'dall-e-3',
        size: '1024x1024',
      });

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: promptWithExtraSpaces }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockImageGenerator.generateImage).toHaveBeenCalledWith({
        prompt: expectedSanitizedPrompt,
        model: 'dall-e-3',
      });
    });

    it('should return 400 for prompt with only invalid characters', async () => {
      const invalidPrompt = '\x00\x01\x02\x03\x04\x05';
      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: invalidPrompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt contains only invalid characters');
      expect(data.errorType).toBe('invalid_prompt');
      expect(data.retryable).toBe(false);
    });
  });

  describe('Successful Image Generation', () => {
    it('should generate image successfully with valid prompt', async () => {
      const prompt = 'A beautiful sunset over mountains';
      const mockResult = {
        imageUrl: 'https://example.com/image.png',
        prompt,
        timestamp: '2023-01-01T00:00:00.000Z',
        model: 'dall-e-3',
        size: '1024x1024',
      };

      mockImageGenerator.generateImage.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockImageGenerator.generateImage).toHaveBeenCalledWith({
        prompt,
        model: 'dall-e-3',
      });
    });

    it('should handle 200 character prompt correctly', async () => {
      const prompt = 'a'.repeat(200);
      const mockResult = {
        imageUrl: 'https://example.com/image.png',
        prompt,
        timestamp: '2023-01-01T00:00:00.000Z',
        model: 'dall-e-3',
        size: '1024x1024',
      };

      mockImageGenerator.generateImage.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockImageGenerator.generateImage).toHaveBeenCalledWith({
        prompt,
        model: 'dall-e-3',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle content policy violations', async () => {
      const prompt = 'inappropriate content';
      const customError = new Error('Content policy violation');
      (customError as any).errorType = 'content_policy';
      (customError as any).retryable = false;
      (customError as any).originalMessage = 'Content policy violation';

      mockImageGenerator.generateImage.mockRejectedValue(customError);

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Content policy violation');
      expect(data.errorType).toBe('content_policy');
      expect(data.retryable).toBe(false);
    });

    it('should handle rate limit errors', async () => {
      const prompt = 'A cat';
      const customError = new Error('Rate limit exceeded');
      (customError as any).errorType = 'rate_limit';
      (customError as any).retryable = true;
      (customError as any).originalMessage = 'Rate limit exceeded';

      mockImageGenerator.generateImage.mockRejectedValue(customError);

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
      expect(data.errorType).toBe('rate_limit');
      expect(data.retryable).toBe(true);
    });

    it('should handle quota exceeded errors', async () => {
      const prompt = 'A cat';
      const customError = new Error('Quota exceeded');
      (customError as any).errorType = 'quota_exceeded';
      (customError as any).retryable = false;
      (customError as any).originalMessage = 'Quota exceeded';

      mockImageGenerator.generateImage.mockRejectedValue(customError);

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(402);
      expect(data.error).toBe('Quota exceeded');
      expect(data.errorType).toBe('quota_exceeded');
      expect(data.retryable).toBe(false);
    });

    it('should handle unknown errors', async () => {
      const prompt = 'A cat';
      const unknownError = new Error('Something went wrong');

      mockImageGenerator.generateImage.mockRejectedValue(unknownError);

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate image');
      expect(data.errorType).toBe('unknown');
      expect(data.retryable).toBe(true);
      expect(data.details).toBe('Something went wrong');
    });
  });
});
