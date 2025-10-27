// TODO: Slowly read through this file and make sure it works as intended.

import { NextRequest } from 'next/server';
import { POST } from '../../app/api/download-image/route';

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth config
jest.mock('@/lib/auth', () => ({
  authConfig: {},
}));

// Mock global fetch
global.fetch = jest.fn();

describe('/api/download-image', () => {
  let mockGetServerSession: jest.Mock;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getServerSession
    mockGetServerSession = require('next-auth/next').getServerSession;
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    // Mock fetch
    mockFetch = global.fetch as jest.Mock;
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://example.com/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for missing imageUrl', async () => {
      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Image URL is required');
    });

    it('should return 400 for non-string imageUrl', async () => {
      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 123 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Image URL is required');
    });

    it('should return 400 for invalid URL format', async () => {
      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'not-a-valid-url' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid URL format');
    });
  });

  describe('URL Security Validation', () => {
    it('should block file protocol', async () => {
      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'file:///etc/passwd' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unsupported URL protocol');
    });

    it('should block ftp protocol', async () => {
      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'ftp://example.com/file.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unsupported URL protocol');
    });

    it('should block data protocol', async () => {
      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unsupported URL protocol');
    });

    it('should block HTTP URLs (only allow HTTPS)', async () => {
      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'http://example.com/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Only HTTPS URLs are allowed');
    });

    it('should block private IP addresses', async () => {
      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://192.168.1.1/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Private URLs are not allowed');
    });

    it('should block localhost', async () => {
      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://localhost/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Private URLs are not allowed');
    });
  });

  describe('Image Download', () => {
    it('should successfully download image', async () => {
      const mockImageBuffer = new ArrayBuffer(1024);
      const mockResponse = new Response(mockImageBuffer, {
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': '1024',
        },
      });

      mockFetch.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://example.com/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('image/jpeg');
      expect(response.headers.get('content-disposition')).toBe('attachment');
      expect(response.headers.get('cache-control')).toBe('no-cache');

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/image.jpg', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageDownloader/1.0)',
          Accept: 'image/*',
        },
        signal: expect.any(AbortSignal),
      });
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://example.com/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to download image');
    });

    it('should handle non-ok response', async () => {
      const mockResponse = new Response('Not Found', { status: 404 });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://example.com/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Failed to fetch image: 404');
    });

    it('should handle invalid content type', async () => {
      const mockResponse = new Response('text content', {
        status: 200,
        headers: {
          'content-type': 'text/html',
        },
      });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://example.com/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid content type. Only image files are allowed.');
    });

    it('should handle file too large (content-length)', async () => {
      const mockResponse = new Response('large content', {
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': '15000000', // 15MB
        },
      });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://example.com/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('File too large. Maximum size is 10MB.');
    });

    it('should handle file too large (after download)', async () => {
      const largeBuffer = new ArrayBuffer(15 * 1024 * 1024); // 15MB
      const mockResponse = new Response(largeBuffer, {
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
        },
      });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://example.com/image.jpg' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('File too large. Maximum size is 10MB.');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/download-image', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to download image');
    });
  });
});
