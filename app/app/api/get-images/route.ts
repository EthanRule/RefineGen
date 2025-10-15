import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { apiLogger, extractUserInfo, generateRequestId } from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      apiLogger.warn('Unauthorized get images attempt', { requestId });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userInfo = extractUserInfo(session);
    apiLogger.info('Get images request started', {
      requestId,
      userId: userInfo.userId,
    });

    // Get user's images from database
    const images = await prisma.image.findMany({
      where: {
        userId: userInfo.userId,
      },
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
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

    apiLogger.info('Images retrieved successfully', {
      requestId,
      userId: userInfo.userId,
      totalImageCount: images.length,
    });

    // Debug: Log the actual images data
    console.log('🔍 DEBUG - Retrieved images:', JSON.stringify(images, null, 2));

    // Identify and delete expired images from database
    const expiredImageIds: string[] = [];
    const validImages = images.filter(image => {
      console.log('🔍 Checking image:', image.id, 'URL:', image.publicUrl);

      // Check if URL contains expiration parameters (presigned URLs)
      const hasExpiration =
        image.publicUrl.includes('X-Amz-Expires') ||
        image.publicUrl.includes('X-Amz-Date') ||
        image.publicUrl.includes('X-Amz-Signature');

      if (!hasExpiration) {
        console.log('✅ Public URL (no expiration):', image.id);
        return true; // Public URL, not expired
      }

      console.log('🔍 Presigned URL detected:', image.id);

      // For presigned URLs, check if they're expired
      try {
        const url = new URL(image.publicUrl);
        const expiresParam = url.searchParams.get('X-Amz-Expires');
        const dateParam = url.searchParams.get('X-Amz-Date');

        console.log('📅 URL params for', image.id, ':', {
          expires: expiresParam,
          date: dateParam,
          fullUrl: image.publicUrl,
        });

        if (expiresParam && dateParam) {
          // Parse the date parameter (format: 20251008T172000Z) - UTC timezone
          const year = parseInt(dateParam.substring(0, 4));
          const month = parseInt(dateParam.substring(4, 6)) - 1; // Month is 0-indexed
          const day = parseInt(dateParam.substring(6, 8));
          const hour = parseInt(dateParam.substring(9, 11));
          const minute = parseInt(dateParam.substring(11, 13));
          const second = parseInt(dateParam.substring(13, 15));

          // Create UTC date to avoid timezone issues
          const expirationTime =
            Date.UTC(year, month, day, hour, minute, second) + parseInt(expiresParam) * 1000;
          const now = Date.now();

          console.log('⏰ Expiration check for', image.id, ':', {
            parsedDate: `${year}-${month + 1}-${day} ${hour}:${minute}:${second} UTC`,
            expirationTime: new Date(expirationTime).toISOString(),
            currentTime: new Date(now).toISOString(),
            isExpired: now > expirationTime,
            timeDiff: (now - expirationTime) / 1000 / 60, // minutes
          });

          if (now > expirationTime) {
            console.log('🗑️ Marking expired image for deletion:', image.id);
            expiredImageIds.push(image.id);
            return false; // Expired
          }
        } else {
          console.log('⚠️ Missing expiration params for:', image.id);
          // If it's a presigned URL but missing params, consider it expired
          expiredImageIds.push(image.id);
          return false;
        }

        console.log('✅ Valid presigned URL:', image.id);
        return true; // Not expired
      } catch (error) {
        console.log('❌ Error parsing URL for image:', image.id, error);
        expiredImageIds.push(image.id);
        return false; // Invalid URL
      }
    });

    // Delete expired images from database
    if (expiredImageIds.length > 0) {
      try {
        const deleteResult = await prisma.image.deleteMany({
          where: {
            id: { in: expiredImageIds },
            userId: userInfo.userId, // Extra safety check
          },
        });

        console.log('🗑️ Deleted expired images:', deleteResult.count);
        apiLogger.info('Expired images cleaned up', {
          requestId,
          userId: userInfo.userId,
          deletedCount: deleteResult.count,
          deletedIds: expiredImageIds,
        });
      } catch (deleteError) {
        console.error('❌ Error deleting expired images:', deleteError);
        apiLogger.error('Failed to delete expired images', deleteError as Error, {
          requestId,
          userId: userInfo.userId,
          expiredIds: expiredImageIds,
        });
        // Continue with valid images even if cleanup failed
      }
    }

    apiLogger.info('Images request completed', {
      requestId,
      userId: userInfo.userId,
      validImageCount: validImages.length,
      expiredImageCount: expiredImageIds.length,
    });

    return NextResponse.json({
      success: true,
      images: validImages,
      count: validImages.length,
    });
  } catch (error) {
    const session = await getServerSession(authConfig);
    const userInfo = extractUserInfo(session);
    apiLogger.error('Get images error', error as Error, {
      requestId,
      userId: userInfo.userId,
    });

    return NextResponse.json(
      {
        error: 'Failed to retrieve images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
