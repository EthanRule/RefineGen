import { NextRequest } from 'next/server';
import { POST } from '../../app/api/generate-section-options/route';

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

  beforeEach(() => {
    // Get the mock function
    const openai = require('openai');
    mockCreate = openai.mockCreate;
    mockCreate.mockClear();

    // Set up environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
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
      expect(data.details).toBe('Invalid section format');
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
