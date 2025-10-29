import { NextRequest } from 'next/server';
import { GET } from '../../app/api/recent-image/route';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  const mockPrismaInstance = {
    image: {
      findFirst: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaInstance),
    mockPrismaInstance,
  };
});

jest.mock('@/lib/auth/auth', () => ({
  authConfig: {},
}));

describe('/api/recent-image', () => {
  let mockGetServerSession: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getServerSession
    mockGetServerSession = require('next-auth/next').getServerSession;
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user_123', email: 'test@example.com' },
    });

    // Setup Prisma mock
    const { mockPrismaInstance } = require('@prisma/client');
    mockPrismaInstance.image.findFirst.mockResolvedValue(null);
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/recent-image');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 for user without id', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }, // No id
      });

      const request = new NextRequest('http://localhost:3000/api/recent-image');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Successful Image Retrieval', () => {
    it('should return recent image successfully', async () => {
      const mockImage = {
        id: 'img_123',
        publicUrl: 'https://example.com/image.jpg',
        prompt: 'A beautiful sunset',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findFirst.mockResolvedValue(mockImage);

      const request = new NextRequest('http://localhost:3000/api/recent-image');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recentImage).toEqual(mockImage);

      expect(mockPrismaInstance.image.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user_123' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          publicUrl: true,
          prompt: true,
          createdAt: true,
        },
      });
    });

    it('should return null when no recent image exists', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/recent-image');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recentImage).toBeNull();
    });

    it('should return the most recent image when multiple exist', async () => {
      const mockImage = {
        id: 'img_latest',
        publicUrl: 'https://example.com/latest.jpg',
        prompt: 'Latest image',
        createdAt: '2024-01-02T00:00:00.000Z',
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findFirst.mockResolvedValue(mockImage);

      const request = new NextRequest('http://localhost:3000/api/recent-image');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recentImage).toEqual(mockImage);
      expect(data.recentImage.id).toBe('img_latest');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findFirst.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/recent-image');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch recent image');
    });

    it('should handle unexpected errors', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findFirst.mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/recent-image');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch recent image');
    });
  });

  describe('Data Validation', () => {
    it('should only return selected fields', async () => {
      const fullImageData = {
        id: 'img_123',
        publicUrl: 'https://example.com/image.jpg',
        prompt: 'A beautiful sunset',
        createdAt: '2024-01-01T00:00:00.000Z',
        userId: 'user_123',
        s3Key: 'users/user_123/images/img_123.png',
        s3Bucket: 'test-bucket',
        attributes: ['beautiful', 'sunset'],
        filename: 'image.jpg',
        fileSize: 1024,
        contentType: 'image/jpeg',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      // Mock returns only the selected fields
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.image.findFirst.mockImplementation((args: any) => {
        // Simulate Prisma select behavior
        const selectedFields: any = {};
        if (args.select) {
          Object.keys(args.select).forEach(key => {
            if (args.select[key]) {
              selectedFields[key] = (fullImageData as any)[key];
            }
          });
        }
        return Promise.resolve(selectedFields);
      });

      const request = new NextRequest('http://localhost:3000/api/recent-image');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recentImage).toEqual({
        id: 'img_123',
        publicUrl: 'https://example.com/image.jpg',
        prompt: 'A beautiful sunset',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      // Verify sensitive fields are not included
      expect(data.recentImage.userId).toBeUndefined();
      expect(data.recentImage.s3Key).toBeUndefined();
      expect(data.recentImage.s3Bucket).toBeUndefined();
      expect(data.recentImage.attributes).toBeUndefined();
      expect(data.recentImage.filename).toBeUndefined();
      expect(data.recentImage.fileSize).toBeUndefined();
      expect(data.recentImage.contentType).toBeUndefined();
      expect(data.recentImage.updatedAt).toBeUndefined();
    });
  });
});
