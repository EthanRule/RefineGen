import { NextRequest } from 'next/server';
import { POST } from '../../app/api/webhook/route';

jest.mock('stripe', () => {
  const mockWebhooks = {
    constructEvent: jest.fn(),
  };

  const mockCheckoutSessions = {
    retrieve: jest.fn(),
  };

  return jest.fn(() => ({
    webhooks: mockWebhooks,
    checkout: {
      sessions: mockCheckoutSessions,
    },
  }));
});

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
    mockPrismaInstance,
  };
});

describe('/api/webhook', () => {
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStripe = require('stripe');

    // Set up environment variable
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

    // Setup default Stripe mock
    const stripeInstance = mockStripe();
    stripeInstance.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer_details: {
            email: 'test@example.com',
          },
        },
      },
    });

    stripeInstance.checkout.sessions.retrieve.mockResolvedValue({
      id: 'cs_test_123',
      line_items: {
        data: [
          {
            price: {
              id: 'price_1SHri4JxtYYSN7hpm2fkuQzO',
            },
          },
        ],
      },
    });

    const { mockPrismaInstance } = require('@prisma/client');
    mockPrismaInstance.user.findUnique.mockResolvedValue({
      id: 'user_123',
      email: 'test@example.com',
      tokens_remaining: 100,
    });
    mockPrismaInstance.user.update.mockResolvedValue({});
  });

  describe('Webhook Signature Validation', () => {
    it('should return 500 for missing signature', async () => {
      const stripeInstance = mockStripe();
      stripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Missing Stripe signature');
      });

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
        body: 'test payload',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook failed');
    });

    it('should return 500 for invalid signature', async () => {
      const stripeInstance = mockStripe();
      stripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
        body: 'test payload',
        headers: { 'Stripe-Signature': 'invalid_signature' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook failed');
    });
  });

  describe('Checkout Session Completed', () => {
    beforeEach(() => {
      const stripeInstance = mockStripe();
      stripeInstance.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer_details: {
              email: 'test@example.com',
            },
          },
        },
      });

      stripeInstance.checkout.sessions.retrieve.mockResolvedValue({
        id: 'cs_test_123',
        line_items: {
          data: [
            {
              price: {
                id: 'price_1SHri4JxtYYSN7hpm2fkuQzO',
              },
            },
          ],
        },
      });
    });

    it('should process 400 gem purchase successfully', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        tokens_remaining: 100,
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaInstance.user.update.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
        body: 'test payload',
        headers: { 'Stripe-Signature': 'valid_signature' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: { tokens_remaining: 500 }, // 100 + 400
      });
    });

    it('should process 1800 gem purchase successfully', async () => {
      const stripeInstance = mockStripe();
      stripeInstance.checkout.sessions.retrieve.mockResolvedValue({
        id: 'cs_test_123',
        line_items: {
          data: [
            {
              price: {
                id: 'price_1SHrjQJxtYYSN7hp1ojYFsUC',
              },
            },
          ],
        },
      });

      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        tokens_remaining: 200,
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaInstance.user.update.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
        body: 'test payload',
        headers: { 'Stripe-Signature': 'valid_signature' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: { tokens_remaining: 2000 }, // 200 + 1800
      });
    });

    it('should process 4000 gem purchase successfully', async () => {
      const stripeInstance = mockStripe();
      stripeInstance.checkout.sessions.retrieve.mockResolvedValue({
        id: 'cs_test_123',
        line_items: {
          data: [
            {
              price: {
                id: 'price_1SHrjxJxtYYSN7hpz32GDuzP',
              },
            },
          ],
        },
      });

      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        tokens_remaining: 0,
      };

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaInstance.user.update.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
        body: 'test payload',
        headers: { 'Stripe-Signature': 'valid_signature' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: { tokens_remaining: 4000 }, // 0 + 4000
      });
    });

    it('should handle unknown price ID', async () => {
      const stripeInstance = mockStripe();
      stripeInstance.checkout.sessions.retrieve.mockResolvedValue({
        id: 'cs_test_123',
        line_items: {
          data: [
            {
              price: {
                id: 'price_unknown',
              },
            },
          ],
        },
      });

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
        body: 'test payload',
        headers: { 'Stripe-Signature': 'valid_signature' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should handle user not found', async () => {
      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
        body: 'test payload',
        headers: { 'Stripe-Signature': 'valid_signature' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(mockPrismaInstance.user.update).not.toHaveBeenCalled();
    });

    it('should handle missing email', async () => {
      const stripeInstance = mockStripe();
      stripeInstance.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer_details: null,
          },
        },
      });

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
        body: 'test payload',
        headers: { 'Stripe-Signature': 'valid_signature' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      const { mockPrismaInstance } = require('@prisma/client');
      expect(mockPrismaInstance.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('Other Event Types', () => {
    it('should handle non-checkout events', async () => {
      const stripeInstance = mockStripe();
      stripeInstance.webhooks.constructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: {} },
      });

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
        body: 'test payload',
        headers: { 'Stripe-Signature': 'valid_signature' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      const stripeInstance = mockStripe();
      stripeInstance.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer_details: {
              email: 'test@example.com',
            },
          },
        },
      });

      stripeInstance.checkout.sessions.retrieve.mockResolvedValue({
        id: 'cs_test_123',
        line_items: {
          data: [
            {
              price: {
                id: 'price_1SHri4JxtYYSN7hpm2fkuQzO',
              },
            },
          ],
        },
      });

      const { mockPrismaInstance } = require('@prisma/client');
      mockPrismaInstance.user.findUnique.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
        body: 'test payload',
        headers: { 'Stripe-Signature': 'valid_signature' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook failed');
    });
  });
});
