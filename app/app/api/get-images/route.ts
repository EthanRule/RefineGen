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
      imageCount: images.length,
    });

    // Debug: Log the actual images data
    console.log('🔍 DEBUG - Retrieved images:', JSON.stringify(images, null, 2));

    return NextResponse.json({
      success: true,
      images: images,
      count: images.length,
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
