// TODO: Slowly read through this file and make sure it works as intended.

import { NextRequest } from 'next/server';
import { POST } from '../../app/api/purchase-gems/route';

// Mock Stripe
jest.mock('stripe', () => {
  const mockCheckoutSession = {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/test',
  };

  const mockCheckoutSessions = {
    create: jest.fn().mockResolvedValue(mockCheckoutSession),
  };

  return jest.fn(() => ({
    checkout: {
      sessions: mockCheckoutSessions,
    },
  }));
});

describe('/api/purchase-gems', () => {
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for tests (errors are expected in error handling tests)
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockStripe = require('stripe');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Input Validation', () => {
    it('should return 400 for missing amount', async () => {
      const request = new NextRequest('http://localhost:3000/api/purchase-gems', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid amount');
    });

    it('should return 400 for missing email', async () => {
      const request = new NextRequest('http://localhost:3000/api/purchase-gems', {
        method: 'POST',
        body: JSON.stringify({ amount: '400' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe('https://checkout.stripe.com/test');
    });

    it('should return 400 for invalid amount', async () => {
      const request = new NextRequest('http://localhost:3000/api/purchase-gems', {
        method: 'POST',
        body: JSON.stringify({ amount: '999', email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid amount');
    });

    it('should accept invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/purchase-gems', {
        method: 'POST',
        body: JSON.stringify({ amount: '400', email: 'invalid-email' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe('https://checkout.stripe.com/test');
    });
  });

  describe('Successful Purchase', () => {
    it('should create checkout session for 400 gems', async () => {
      const request = new NextRequest('http://localhost:3000/api/purchase-gems', {
        method: 'POST',
        body: JSON.stringify({ amount: '400', email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe('https://checkout.stripe.com/test');

      const stripeInstance = mockStripe();
      expect(stripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        line_items: [{ price: 'price_1SHri4JxtYYSN7hpm2fkuQzO', quantity: 1 }],
        success_url: expect.stringContaining('/gems?success=true'),
        cancel_url: expect.stringContaining('/gems?success=false'),
        customer_email: 'test@example.com',
        expand: ['line_items'],
      });
    });

    it('should create checkout session for 1800 gems', async () => {
      const request = new NextRequest('http://localhost:3000/api/purchase-gems', {
        method: 'POST',
        body: JSON.stringify({ amount: '1800', email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe('https://checkout.stripe.com/test');

      const stripeInstance = mockStripe();
      expect(stripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        line_items: [{ price: 'price_1SHrjQJxtYYSN7hp1ojYFsUC', quantity: 1 }],
        success_url: expect.stringContaining('/gems?success=true'),
        cancel_url: expect.stringContaining('/gems?success=false'),
        customer_email: 'test@example.com',
        expand: ['line_items'],
      });
    });

    it('should create checkout session for 4000 gems', async () => {
      const request = new NextRequest('http://localhost:3000/api/purchase-gems', {
        method: 'POST',
        body: JSON.stringify({ amount: '4000', email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe('https://checkout.stripe.com/test');

      const stripeInstance = mockStripe();
      expect(stripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        line_items: [{ price: 'price_1SHrjxJxtYYSN7hpz32GDuzP', quantity: 1 }],
        success_url: expect.stringContaining('/gems?success=true'),
        cancel_url: expect.stringContaining('/gems?success=false'),
        customer_email: 'test@example.com',
        expand: ['line_items'],
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors', async () => {
      const stripeInstance = mockStripe();
      stripeInstance.checkout.sessions.create.mockRejectedValueOnce(
        new Error('Stripe API error')
      );

      const request = new NextRequest('http://localhost:3000/api/purchase-gems', {
        method: 'POST',
        body: JSON.stringify({ amount: '400', email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to purchase gems');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/purchase-gems', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to purchase gems');
    });
  });

  describe('URL Generation', () => {
    it('should use correct success and cancel URLs', async () => {
      const originalEnv = process.env.NEXTAUTH_URL;
      process.env.NEXTAUTH_URL = 'https://test.example.com';

      const request = new NextRequest('http://localhost:3000/api/purchase-gems', {
        method: 'POST',
        body: JSON.stringify({ amount: '400', email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      });

      await POST(request);

      const stripeInstance = mockStripe();
      expect(stripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: 'https://test.example.com/gems?success=true',
          cancel_url: 'https://test.example.com/gems?success=false',
        })
      );

      process.env.NEXTAUTH_URL = originalEnv;
    });
  });
});
