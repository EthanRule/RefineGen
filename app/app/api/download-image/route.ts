import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { downloadRateLimit, addRateLimitHeaders } from '../../../lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Apply rate limiting
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResponse = downloadRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { imageUrl } = await request.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Enhanced URL validation to prevent SSRF attacks
    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Block dangerous protocols first
    if (
      parsedUrl.protocol === 'file:' ||
      parsedUrl.protocol === 'ftp:' ||
      parsedUrl.protocol === 'data:'
    ) {
      return NextResponse.json({ error: 'Unsupported URL protocol' }, { status: 400 });
    }

    // Only allow HTTPS URLs
    if (parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only HTTPS URLs are allowed' }, { status: 400 });
    }

    // Block private/internal IP addresses and localhost
    const hostname = parsedUrl.hostname;
    const privateIPRegex =
      /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|169\.254\.|::1|localhost)/;
    if (privateIPRegex.test(hostname)) {
      return NextResponse.json({ error: 'Private URLs are not allowed' }, { status: 400 });
    }

    // Fetch the image from the external URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const fetchResponse = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageDownloader/1.0)',
        Accept: 'image/*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!fetchResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${fetchResponse.status}` },
        { status: fetchResponse.status }
      );
    }

    // Validate content type
    const contentType = fetchResponse.headers.get('content-type') || '';
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.some(type => contentType.startsWith(type))) {
      return NextResponse.json(
        { error: 'Invalid content type. Only image files are allowed.' },
        { status: 400 }
      );
    }

    // Check content length before downloading
    const contentLength = fetchResponse.headers.get('content-length');
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Get the image data
    const imageBuffer = await fetchResponse.arrayBuffer();

    // Double-check size after download
    if (imageBuffer.byteLength > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Return the image as a blob
    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment',
        'Cache-Control': 'no-cache',
      },
    });

    return addRateLimitHeaders(response, ip, { windowMs: 60 * 1000, maxRequests: 10 });
  } catch (error) {
    console.error('Download proxy error:', error);
    return NextResponse.json(
      {
        error: 'Failed to download image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
