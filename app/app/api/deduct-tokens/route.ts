import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, tokensUsed } = await request.json();

    if (!action || !tokensUsed || tokensUsed <= 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has sufficient tokens
    if ((user.tokens_remaining || 0) < tokensUsed) {
      return NextResponse.json(
        {
          error: 'Insufficient tokens',
          tokens_remaining: user.tokens_remaining || 0,
          tokens_required: tokensUsed,
        },
        { status: 400 }
      );
    }

    // Deduct tokens and update usage
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        tokens_remaining: (user.tokens_remaining || 0) - tokensUsed,
        tokens_used_total: (user.tokens_used_total || 0) + tokensUsed,
      },
    });

    return NextResponse.json({
      success: true,
      tokens_remaining: updatedUser.tokens_remaining,
      tokens_used_total: updatedUser.tokens_used_total,
      action: action,
      tokens_deducted: tokensUsed,
    });
  } catch (error) {
    console.error('Error deducting tokens:', error);
    return NextResponse.json({ error: 'Failed to deduct tokens' }, { status: 500 });
  }
}
