import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        tokens_remaining: true,
        tokens_used_total: true,
        tokens_purchased_total: true,
        is_premium: true,
        subscription_status: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      tokens_remaining: user.tokens_remaining || 0,
      tokens_used_total: user.tokens_used_total || 0,
      tokens_purchased_total: user.tokens_purchased_total || 0,
      is_premium: user.is_premium || false,
      subscription_status: user.subscription_status || 'inactive',
    });
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return NextResponse.json({ error: 'Failed to fetch user tokens' }, { status: 500 });
  }
}
