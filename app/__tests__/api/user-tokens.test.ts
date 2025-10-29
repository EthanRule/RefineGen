import { NextRequest } from 'next/server';
import { GET } from '../../app/api/user-tokens/route';

jest.mock('@prisma/client', () => {
  const mockPrismaInstance = {
    user: {
      findUnique: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaInstance),
    mockPrismaInstance,
  };
});

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth/auth', () => ({
  authConfig: {},
}));

describe('/api/user-tokens', () => {
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
    mockPrismaInstance.user.findUnique.mockResolvedValue({
      tokens_remaining: 1000,
      tokens_used_total: 200,
      tokens_purchased_total: 1200,
      is_premium: false,
      subscription_status: 'inactive',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 for user without email', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { name: 'Test User' },
      });

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Successful Token Retrieval', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
    });

    it('should return user token information', async () => {
      const mockUser = {
        tokens_remaining: 1500,
        tokens_used_total: 500,
        tokens_purchased_total: 2000,
        is_premium: false,
        subscription_status: 'inactive',
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        tokens_remaining: 1500,
        tokens_used_total: 500,
        tokens_purchased_total: 2000,
        is_premium: false,
        subscription_status: 'inactive',
      });
      expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: {
          tokens_remaining: true,
          tokens_used_total: true,
          tokens_purchased_total: true,
          is_premium: true,
          subscription_status: true,
        },
      });
    });

    it('should handle null token values', async () => {
      const mockUser = {
        tokens_remaining: null,
        tokens_used_total: null,
        tokens_purchased_total: null,
        is_premium: null,
        subscription_status: null,
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        tokens_remaining: 0,
        tokens_used_total: 0,
        tokens_purchased_total: 0,
        is_premium: false,
        subscription_status: 'inactive',
      });
    });

    it('should handle zero token values', async () => {
      const mockUser = {
        tokens_remaining: 0,
        tokens_used_total: 0,
        tokens_purchased_total: 0,
        is_premium: false,
        subscription_status: 'inactive',
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        tokens_remaining: 0,
        tokens_used_total: 0,
        tokens_purchased_total: 0,
        is_premium: false,
        subscription_status: 'inactive',
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
    });

    it('should handle user not found', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should handle database errors', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch user tokens');
    });

    it('should handle session errors', async () => {
      mockGetServerSession.mockRejectedValue(new Error('Session error'));

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch user tokens');
    });
  });

  describe('Data Validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
    });

    it('should handle large token values', async () => {
      const mockUser = {
        tokens_remaining: 999999,
        tokens_used_total: 1000000,
        tokens_purchased_total: 1999999,
        is_premium: true,
        subscription_status: 'active',
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tokens_remaining).toBe(999999);
      expect(data.tokens_used_total).toBe(1000000);
      expect(data.tokens_purchased_total).toBe(1999999);
      expect(data.is_premium).toBe(true);
      expect(data.subscription_status).toBe('active');
    });

    it('should handle negative token values', async () => {
      const mockUser = {
        tokens_remaining: -100,
        tokens_used_total: 500,
        tokens_purchased_total: 400,
        is_premium: false,
        subscription_status: 'inactive',
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tokens_remaining).toBe(-100);
      expect(data.tokens_used_total).toBe(500);
      expect(data.tokens_purchased_total).toBe(400);
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
    });

    it('should return correct response structure', async () => {
      const mockUser = {
        tokens_remaining: 1000,
        tokens_used_total: 200,
        tokens_purchased_total: 1200,
        is_premium: false,
        subscription_status: 'inactive',
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('tokens_remaining');
      expect(data).toHaveProperty('tokens_used_total');
      expect(data).toHaveProperty('tokens_purchased_total');
      expect(data).toHaveProperty('is_premium');
      expect(data).toHaveProperty('subscription_status');
      expect(Object.keys(data)).toHaveLength(5);
    });

    it('should not include sensitive user data', async () => {
      const mockUser = {
        tokens_remaining: 1000,
        tokens_used_total: 200,
        tokens_purchased_total: 1200,
        is_premium: false,
        subscription_status: 'inactive',
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user-tokens');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).not.toHaveProperty('id');
      expect(data).not.toHaveProperty('email');
      expect(data).not.toHaveProperty('password');
      expect(data).not.toHaveProperty('createdAt');
      expect(data).not.toHaveProperty('updatedAt');
    });
  });
});
