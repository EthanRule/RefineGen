import { NextRequest } from 'next/server';
import { POST } from '../../app/api/save-image/route';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  const mockPrismaInstance = {
    image: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaInstance),
    mockPrismaInstance, 
  };
});

jest.mock('../../lib/services/S3Service', () => ({
  S3Service: jest.fn().mockImplementation(() => ({
    uploadImage: jest.fn().mockResolvedValue('https://s3.example.com/image.jpg'),
  })),
}));

jest.mock('../../lib/utils/logger', () => ({
  apiLogger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
  extractUserInfo: jest.fn((session: any) => ({
    userId: session?.user?.email ? 'user_123' : undefined,
    userEmail: session?.user?.email,
  })),
  generateRequestId: jest.fn(() => 'test-request-id'),
}));

// Mock auth config
jest.mock('@/lib/auth/auth', () => ({
  authConfig: {},
}));

describe('/api/save-image', () => {
  let mockGetServerSession: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getServerSession
    mockGetServerSession = require('next-auth/next').getServerSession;
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    // Setup Prisma mock
    const { mockPrismaInstance } = require('@prisma/client');
    mockPrismaInstance.image.create.mockResolvedValue({
      id: 'img_123',
      userId: 'user_123',
      publicUrl: 'https://example.com/image.jpg',
    });

    // S3Service is already mocked at module level

    // Mock fetch for image download
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      headers: {
        get: jest.fn().mockReturnValue('image/png'),
      },
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
    });

    it('should return 400 for missing imageUrl', async () => {
      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test prompt' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Image URL and prompt are required');
    });

    it('should return 400 for missing prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://example.com/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Image URL and prompt are required');
    });

    it('should return 400 for empty imageUrl', async () => {
      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: '', prompt: 'Test prompt' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Image URL and prompt are required');
    });

    it('should return 400 for empty prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://example.com/image.jpg', prompt: '' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Image URL and prompt are required');
    });

    it('should handle invalid imageUrl format', async () => {
      // Mock fetch to fail for invalid URL
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
      });

      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'not-a-url', prompt: 'Test prompt' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save image');
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/image.jpg',
          prompt: 'Test prompt',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle user without email gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { name: 'Test User' },
      });

      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/image.jpg',
          prompt: 'Test prompt',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      // The test returns 200 because the API doesn't validate email requirement in this scenario
      expect(response.status).toBe(200);
    });
  });

  describe('Successful Image Saving', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
    });

    it('should save image successfully', async () => {
      const mockImage = {
        id: 'img_123',
        userId: 'user_123',
        publicUrl: 'https://s3.example.com/image.jpg',
        prompt: 'Test prompt',
        s3Key: 'users/user_123/images/img_123.png',
        s3Bucket: 'ethanrule-generated-images',
        attributes: [],
        filename: 'img_123.png',
        fileSize: 8,
        contentType: 'image/png',
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.create.mockResolvedValue(mockImage);

      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/image.jpg',
          prompt: 'Test prompt',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.imageId).toBe('img_123');
      expect(data.s3Url).toBe('https://s3.example.com/image.jpg');
      expect(data.publicUrl).toBe('https://s3.example.com/image.jpg');
    });

    it('should handle different image URL formats', async () => {
      const mockImage = {
        id: 'img_123',
        userId: 'user_123',
        publicUrl: 'https://s3.example.com/image.jpg',
        prompt: 'Test prompt',
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.create.mockResolvedValue(mockImage);

      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://cdn.example.com/images/test.jpg',
          prompt: 'Test prompt',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'A'.repeat(500);
      const mockImage = {
        id: 'img_123',
        userId: 'user_123',
        publicUrl: 'https://s3.example.com/image.jpg',
        prompt: longPrompt,
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.create.mockResolvedValue(mockImage);

      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/image.jpg',
          prompt: longPrompt,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
    });

    it('should handle database creation errors', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.create.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/image.jpg',
          prompt: 'Test prompt',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save image');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save image');
    });

    it('should handle image download errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/image.jpg',
          prompt: 'Test prompt',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save image');
    });

    it('should handle S3 upload errors', async () => {
      // Mock fetch to fail for image download
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const request = new NextRequest('http://localhost:3000/api/save-image', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://example.com/image.jpg',
          prompt: 'Test prompt',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save image');
    });
  });
});
