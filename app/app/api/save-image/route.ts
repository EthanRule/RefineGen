import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { S3Service } from '@/lib/services/S3Service';
import { PrismaClient } from '@prisma/client';
import { apiLogger, extractUserInfo, generateRequestId } from '@/lib/logger';

const prisma = new PrismaClient();
const s3Service = new S3Service();

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      apiLogger.warn('Unauthorized image save attempt', { requestId });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userInfo = extractUserInfo(session);
    apiLogger.info('Image save request started', {
      requestId,
      userId: userInfo.userId,
      userEmail: userInfo.userEmail,
    });

    // Parse request body
    const { imageUrl, prompt, attributes, filename } = await request.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Image URL and prompt are required' },
        { status: 400 }
      );
    }

    // 1. Download image from OpenAI
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/png';

    // 2. Generate unique image ID
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // 3. Upload to S3
    const s3Url = await s3Service.uploadImage(
      userInfo.userId!,
      imageId,
      imageBuffer,
      contentType
    );

    // 4. Save metadata to database
    const imageRecord = await prisma.image.create({
      data: {
        userId: userInfo.userId!,
        s3Key: `users/${userInfo.userId}/images/${imageId}.png`,
        s3Bucket: 'ethanrule-generated-images',
        publicUrl: s3Url,
        prompt: prompt,
        attributes: attributes || [],
        filename: filename || `${imageId}.png`,
        fileSize: imageBuffer.length,
        contentType: contentType,
      },
    });

    apiLogger.info('Image saved successfully', {
      requestId,
      userId: userInfo.userId,
      imageId: imageRecord.id,
      fileSize: imageBuffer.length,
    });

    return NextResponse.json({
      success: true,
      imageId: imageRecord.id,
      s3Url: s3Url,
      publicUrl: s3Url,
    });
  } catch (error) {
    const session = await getServerSession(authConfig);
    const userInfo = extractUserInfo(session);
    apiLogger.error('Image save error', error as Error, {
      requestId,
      userId: userInfo.userId,
    });

    return NextResponse.json(
      {
        error: 'Failed to save image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
