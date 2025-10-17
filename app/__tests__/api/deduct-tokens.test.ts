// TODO: Slowly read through this file and make sure it works as intended.

import { NextRequest } from 'next/server';
import { POST } from '../../app/api/deduct-tokens/route';

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

// Mock auth config
jest.mock('@/lib/auth', () => ({
  authConfig: {},
}));

describe('/api/deduct-tokens', () => {
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
      id: 'user_123',
      email: 'test@example.com',
      tokens_remaining: 1000,
      tokens_used_total: 0,
    });
    mockPrismaInstance.user.update.mockResolvedValue({
      id: 'user_123',
      tokens_remaining: 900,
      tokens_used_total: 100,
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ action: 'test', tokensUsed: 100 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 for user without email', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { name: 'Test User' }, // No email
      });

      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ action: 'test', tokensUsed: 100 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for missing action', async () => {
      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ tokensUsed: 100 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should return 400 for missing tokensUsed', async () => {
      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ action: 'test' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should return 400 for invalid tokensUsed (zero)', async () => {
      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ action: 'test', tokensUsed: 0 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should return 400 for invalid tokensUsed (negative)', async () => {
      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ action: 'test', tokensUsed: -10 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });
  });

  describe('User Management', () => {
    it('should return 404 for user not found', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ action: 'test', tokensUsed: 100 }),
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
        tokens_remaining: 50, // Less than requested
        tokens_used_total: 0,
      });

      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ action: 'test', tokensUsed: 100 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Insufficient tokens');
      expect(data.tokens_remaining).toBe(50);
      expect(data.tokens_required).toBe(100);
    });
  });

  describe('Successful Token Deduction', () => {
    it('should successfully deduct tokens', async () => {
      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ action: 'image_generation', tokensUsed: 100 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tokens_remaining).toBe(900);
      expect(data.tokens_used_total).toBe(100);
      expect(data.action).toBe('image_generation');
      expect(data.tokens_deducted).toBe(100);

      const { mockPrismaInstance } = require('@prisma/client');
      expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        data: {
          tokens_remaining: 900,
          tokens_used_total: 100,
        },
      });
    });

    it('should handle user with null tokens_remaining', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        tokens_remaining: null,
        tokens_used_total: null,
      });
      mockPrismaInstance.user.update.mockResolvedValue({
        id: 'user_123',
        tokens_remaining: 900,
        tokens_used_total: 100,
      });

      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ action: 'test', tokensUsed: 100 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        data: {
          tokens_remaining: 900,
          tokens_used_total: 100,
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: JSON.stringify({ action: 'test', tokensUsed: 100 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to deduct tokens');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/deduct-tokens', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to deduct tokens');
    });
  });
});
