import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (in production, use Redis or similar)
const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export function createRateLimit(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest): NextResponse | null {
    // Try to get IP from x-forwarded-for, then from request headers, else 'unknown'
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create rate limit entry
    if (!store[ip] || store[ip].resetTime < now) {
      store[ip] = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    // Increment count
    store[ip].count++;

    // Check if limit exceeded
    if (store[ip].count > config.maxRequests) {
      const resetTime = Math.ceil((store[ip].resetTime - now) / 1000);
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: resetTime,
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetTime.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': store[ip].resetTime.toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const remaining = Math.max(0, config.maxRequests - store[ip].count);
    const resetTime = Math.ceil((store[ip].resetTime - now) / 1000);

    // We'll need to add these headers in the API route response
    return null; // Allow request to proceed
  };
}

// Predefined rate limiters for different endpoints
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const imageGenerationRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 image generations per minute
});

export const downloadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 downloads per minute
});

// Helper function to add rate limit headers to responses
export function addRateLimitHeaders(
  response: NextResponse,
  ip: string,
  config: RateLimitConfig
): NextResponse {
  const entry = store[ip];
  if (entry) {
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetTime = Math.ceil((entry.resetTime - Date.now()) / 1000);

    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());
  }

  return response;
}
