import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's most recent image
    const recentImage = await prisma.image.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        publicUrl: true,
        prompt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      recentImage: recentImage || null,
    });
  } catch (error) {
    console.error('Error fetching recent image:', error);
    return NextResponse.json({ error: 'Failed to fetch recent image' }, { status: 500 });
  }
}
