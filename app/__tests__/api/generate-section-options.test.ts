// TODO: Slowly read through this file and make sure it works as intended.
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/generate-section-options/route';

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaInstance = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaInstance),
    mockPrismaInstance, // Export for use in tests
  };
});

// Mock the entire OpenAI module
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

describe('/api/generate-section-options', () => {
  let mockCreate: jest.Mock;
  let mockGetServerSession: jest.Mock;

  beforeEach(() => {
    // Get the mock function
    const openai = require('openai');
    mockCreate = openai.mockCreate;
    mockCreate.mockClear();

    // Mock getServerSession
    mockGetServerSession = require('next-auth/next').getServerSession;
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    // Setup Prisma mock
    const { mockPrismaInstance } = require('@prisma/client');
    mockPrismaInstance.user.findUnique.mockResolvedValue({
      id: 'user_123',
      email: 'test@example.com',
      tokens_remaining: 1000,
    });
    mockPrismaInstance.user.update.mockResolvedValue({});

    // Set up environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 400 for user without email', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {}, // No email
      });

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User email not found');
    });

    it('should return 404 for user not found in database', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return 400 for insufficient tokens', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        tokens_remaining: 2, // Less than required 3
      });

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        'Insufficient gems. You need 3 gems to refine. Please purchase more gems.'
      );
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for missing prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required and must be a string');
    });

    it('should return 400 for prompt longer than 200 characters', async () => {
      const longPrompt = 'a'.repeat(201);
      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt: longPrompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt must be 200 characters or less');
    });

    it('should return 400 for prompt with only repeated characters', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'aaaaaaaaaaaaaaaaaaaa' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please provide a more descriptive prompt');
    });

    it('should return 400 for prompt without vowels', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'bcdfghjklmnpqrstvwxyz' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please provide a more descriptive prompt with actual words');
    });

    it('should return 400 for prompt without consonants', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'aeiouaeiouaeiou' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please provide a more descriptive prompt with actual words');
    });

    it('should return 500 for missing OpenAI API key', async () => {
      delete process.env.OPENAI_API_KEY;

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A cat' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('OpenAI API key not configured');
    });
  });

  describe('Successful Section Generation', () => {
    it('should generate sections successfully with valid prompt', async () => {
      const prompt = 'A beautiful sunset over mountains';
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                sections: [
                  {
                    name: 'Lighting',
                    options: [
                      'golden hour',
                      'blue hour',
                      'dramatic',
                      'soft',
                      'harsh',
                      'natural',
                      'artificial',
                      'warm',
                      'cool',
                      'moody',
                    ],
                  },
                  {
                    name: 'Atmosphere',
                    options: [
                      'peaceful',
                      'dramatic',
                      'serene',
                      'mysterious',
                      'romantic',
                      'melancholic',
                      'energetic',
                      'calm',
                      'ethereal',
                      'nostalgic',
                    ],
                  },
                  {
                    name: 'Composition',
                    options: [
                      'wide shot',
                      'panoramic',
                      'rule of thirds',
                      'centered',
                      'symmetrical',
                      'diagonal',
                      'foreground focus',
                      'background focus',
                      'layered',
                      'minimalist',
                    ],
                  },
                ],
              }),
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sections).toHaveLength(3);
      expect(data.sections[0].name).toBe('Lighting');
      expect(data.sections[0].options).toHaveLength(10);
      expect(data.sections[0].options[0]).toBe('golden hour');
      expect(data.prompt).toBe(prompt);
    });

    it('should handle selected attributes context', async () => {
      const prompt = 'A cat';
      const selectedAttributes = ['bright', 'close-up'];
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                sections: [
                  {
                    name: 'Style',
                    options: [
                      'realistic',
                      'cartoon',
                      'abstract',
                      'minimalist',
                      'detailed',
                      'artistic',
                      'photographic',
                      'painterly',
                      'sketch',
                      'digital',
                    ],
                  },
                  {
                    name: 'Color',
                    options: [
                      'vibrant',
                      'muted',
                      'monochrome',
                      'pastel',
                      'bold',
                      'subtle',
                      'warm',
                      'cool',
                      'neutral',
                      'contrasting',
                    ],
                  },
                  {
                    name: 'Background',
                    options: [
                      'simple',
                      'complex',
                      'blurred',
                      'detailed',
                      'solid',
                      'textured',
                      'gradient',
                      'patterned',
                      'minimal',
                      'busy',
                    ],
                  },
                ],
              }),
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt, selectedAttributes }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining(
                'The user has already selected these attributes: bright, close-up'
              ),
            }),
          ]),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API errors', async () => {
      const prompt = 'A cat';
      mockCreate.mockRejectedValue(new Error('OpenAI API error'));

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate section options');
      expect(data.details).toBe('OpenAI API error');
    });

    it('should handle empty response from OpenAI', async () => {
      const prompt = 'A cat';
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

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate section options');
      expect(data.details).toBe('No response generated');
    });

    it('should handle invalid JSON response from OpenAI', async () => {
      const prompt = 'A cat';
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is not valid JSON',
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate section options');
      expect(data.details).toBe('Invalid section format - no JSON found in response');
    });

    it('should handle sections with insufficient options', async () => {
      const prompt = 'A cat';
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                sections: [
                  {
                    name: 'Lighting',
                    options: ['bright', 'dim'], // Only 2 options, need at least 5
                  },
                ],
              }),
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/generate-section-options', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate section options');
      expect(data.details).toBe('Section 1 must have at least 5 options');
    });
  });
});
