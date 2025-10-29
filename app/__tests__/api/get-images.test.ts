// TODO: Slowly read through this file and make sure it works as intended.

import { NextRequest } from 'next/server';
import { GET } from '../../app/api/get-images/route';

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaInstance = {
    image: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaInstance),
    mockPrismaInstance, // Export for use in tests
  };
});

// Mock logger
jest.mock('../../lib/utils/logger', () => ({
  apiLogger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock extractUserInfo
jest.mock('../../lib/utils/extractUserInfo', () => ({
  extractUserInfo: jest.fn((session: any) => ({
    userId: session?.user?.email ? 'user_123' : undefined,
    userEmail: session?.user?.email,
  })),
}));

// Mock generateRequestId
jest.mock('../../lib/utils/generateRequestId', () => ({
  generateRequestId: jest.fn(() => 'test-request-id'),
}));

describe('/api/get-images', () => {
  let mockGetServerSession: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getServerSession
    mockGetServerSession = require('next-auth/next').getServerSession;
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    // Reset extractUserInfo mock to default behavior
    const { extractUserInfo } = require('../../lib/utils/extractUserInfo');
    extractUserInfo.mockImplementation((session: any) => ({
      userId: session?.user?.email ? 'user_123' : undefined,
      userEmail: session?.user?.email,
    }));

    // Setup Prisma mock
    const { mockPrismaInstance } = require('@prisma/client');
    mockPrismaInstance.image.findMany.mockResolvedValue([]);
    mockPrismaInstance.image.deleteMany.mockResolvedValue({ count: 0 });
    mockPrismaInstance.user.findUnique.mockResolvedValue({
      id: 'user_123',
      email: 'test@example.com',
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/get-images');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return empty array for user without email', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { name: 'Test User' }, // No email
      });

      // Mock extractUserInfo to return undefined userId for user without email
      const { extractUserInfo } = require('../../lib/utils/extractUserInfo');
      extractUserInfo.mockImplementation(() => ({
        userId: undefined,
        userEmail: undefined,
      }));

      const request = new NextRequest('http://localhost:3000/api/get-images');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.images).toEqual([]);
      expect(data.count).toBe(0);
    });
  });

  describe('Successful Image Retrieval', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
    });

    it('should return user images successfully', async () => {
      const mockImages = [
        {
          id: 'img_1',
          publicUrl: 'https://example.com/image1.jpg',
          prompt: 'Test prompt 1',
          createdAt: '2024-01-01T00:00:00.000Z', // String format
        },
        {
          id: 'img_2',
          publicUrl: 'https://example.com/image2.jpg',
          prompt: 'Test prompt 2',
          createdAt: '2024-01-02T00:00:00.000Z', // String format
        },
      ];

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findMany.mockResolvedValue(mockImages);

      const request = new NextRequest('http://localhost:3000/api/get-images');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.images).toEqual(mockImages);
      expect(data.count).toBe(2);
      expect(mockPrismaInstance.image.findMany).toHaveBeenCalledWith({
        where: { userId: 'user_123' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          s3Key: true,
          s3Bucket: true,
          publicUrl: true,
          prompt: true,
          attributes: true,
          filename: true,
          fileSize: true,
          contentType: true,
          createdAt: true,
        },
      });
    });

    it('should return empty array when no images exist', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/get-images');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.images).toEqual([]);
      expect(data.count).toBe(0);
    });
  });

  describe('Expired URL Cleanup', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
    });

    it('should clean up expired presigned URLs', async () => {
      const mockImages = [
        {
          id: 'img_valid',
          publicUrl: 'https://example.com/image1.jpg', // Public URL
          prompt: 'Test prompt 1',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'img_expired',
          publicUrl:
            'https://bucket.s3.amazonaws.com/image2.jpg?X-Amz-Date=20240101T000000Z&X-Amz-Expires=604800&X-Amz-Signature=test', // Expired
          prompt: 'Test prompt 2',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'img_valid_presigned',
          publicUrl:
            'https://bucket.s3.amazonaws.com/image3.jpg?X-Amz-Date=20261201T000000Z&X-Amz-Expires=604800&X-Amz-Signature=test', // Valid (future date)
          prompt: 'Test prompt 3',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findMany.mockResolvedValue(mockImages);
      mockPrismaInstance.image.deleteMany.mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/get-images');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.images).toHaveLength(2); // Only valid images returned
      expect(data.images.map((img: any) => img.id)).toEqual([
        'img_valid',
        'img_valid_presigned',
      ]);
      expect(mockPrismaInstance.image.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['img_expired'] }, userId: 'user_123' },
      });
    });

    it('should handle cleanup errors gracefully', async () => {
      const mockImages = [
        {
          id: 'img_expired',
          publicUrl:
            'https://bucket.s3.amazonaws.com/image2.jpg?X-Amz-Date=20240101T000000Z&X-Amz-Expires=604800&X-Amz-Signature=test',
          prompt: 'Test prompt 2',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findMany.mockResolvedValue(mockImages);
      mockPrismaInstance.image.deleteMany.mockRejectedValue(new Error('Delete failed'));

      const request = new NextRequest('http://localhost:3000/api/get-images');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.images).toEqual([]); // Expired image filtered out
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/get-images');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to retrieve images');
    });
  });

  describe('URL Validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
    });

    it('should handle invalid URL formats', async () => {
      const mockImages = [
        {
          id: 'img_invalid_url',
          publicUrl: 'not-a-valid-url',
          prompt: 'Test prompt',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findMany.mockResolvedValue(mockImages);
      mockPrismaInstance.image.deleteMany.mockResolvedValue({ count: 0 });

      const request = new NextRequest('http://localhost:3000/api/get-images');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.images).toEqual(mockImages); // Invalid URL treated as public URL
    });

    it('should handle URLs with missing expiration parameters', async () => {
      const mockImages = [
        {
          id: 'img_missing_params',
          publicUrl: 'https://bucket.s3.amazonaws.com/image.jpg?X-Amz-Date=20240101T000000Z', // Missing X-Amz-Expires
          prompt: 'Test prompt',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findMany.mockResolvedValue(mockImages);
      mockPrismaInstance.image.deleteMany.mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/get-images');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.images).toEqual([]); // Missing params filtered out
    });
  });
});
