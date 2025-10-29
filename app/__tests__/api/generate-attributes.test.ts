// TODO: Slowly read through this file and make sure it works as intended.

import { NextRequest } from 'next/server';
import { POST } from '../../app/api/generate-attributes/route';

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth config
jest.mock('@/lib/auth/auth', () => ({
  authConfig: {},
}));

// Mock OpenAI
jest.mock('openai', () => {
  const mockCreate = jest.fn();
  return {
    __esModule: true,
    default: jest.fn(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
    mockCreate, // Export the mock for use in tests
  };
});

describe('/api/generate-attributes', () => {
  let mockGetServerSession: jest.Mock;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';

    // Mock getServerSession
    mockGetServerSession = require('next-auth/next').getServerSession;
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    // Mock OpenAI
    const openai = require('openai');
    mockCreate = openai.mockCreate;
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for missing prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required and must be a string');
    });

    it('should return 400 for non-string prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: 123 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required and must be a string');
    });

    it('should return 400 for empty prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: '' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required and must be a string');
    });
  });

  describe('API Configuration', () => {
    it('should return 500 for missing OpenAI API key', async () => {
      delete process.env.OPENAI_API_KEY;

      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('OpenAI API key not configured');
    });
  });

  describe('Successful Attribute Generation', () => {
    it('should generate attributes successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'cute, fluffy, playful, colorful, detailed',
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.attributes).toEqual(['cute', 'fluffy', 'playful', 'colorful', 'detailed']);
      expect(data.prompt).toBe('a cat');

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('You are an expert image generation assistant'),
          },
          {
            role: 'user',
            content: 'Generate 5 single-word attributes for this image prompt: "a cat"',
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      });
    });

    it('should handle attributes with extra whitespace', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: ' cute , fluffy , playful , colorful , detailed ',
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.attributes).toEqual(['cute', 'fluffy', 'playful', 'colorful', 'detailed']);
    });

    it('should filter out invalid attributes', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'cute, fluffy123, playful, color-ful, detailed',
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.attributes).toEqual(['cute', 'playful', 'detailed']);
    });

    it('should limit to 5 attributes', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'cute, fluffy, playful, colorful, detailed, extra, bonus',
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.attributes).toHaveLength(5);
      expect(data.attributes).toEqual(['cute', 'fluffy', 'playful', 'colorful', 'detailed']);
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API errors', async () => {
      mockCreate.mockRejectedValue(new Error('OpenAI API error'));

      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate attributes');
      expect(data.details).toBe('OpenAI API error');
    });

    it('should handle empty response from OpenAI', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '',
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate attributes');
    });

    it('should handle no valid attributes generated', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '123, 456, 789, !@#, $$$',
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate attributes');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-attributes', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate attributes');
    });
  });
});
