import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const prisma = new PrismaClient();

// Check if Stripe key is configured
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY environment variable is not set');
}

// Helper function to get Price ID from payment link
async function getPriceIdFromPaymentLink(paymentLinkUrl: string): Promise<string | null> {
  try {
    // Extract the payment link ID from the URL
    const paymentLinkId = paymentLinkUrl.split('/').pop();
    if (!paymentLinkId) return null;

    // Retrieve the payment link from Stripe
    const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);

    // Get the first line item's price ID
    if (paymentLink.line_items && paymentLink.line_items.data.length > 0) {
      const firstLineItem = paymentLink.line_items.data[0];
      if (firstLineItem && firstLineItem.price) {
        return firstLineItem.price.id;
      }
    }

    return null;
  } catch (error) {
    console.error('Error retrieving price ID from payment link:', error);
    return null;
  }
}

// Payment links from Stripe Dashboard
const PAYMENT_LINKS = {
  price_400_gems: 'https://buy.stripe.com/bJebJ2aS3a4W4cD58i2Ry00',
  price_1800_gems: 'https://buy.stripe.com/14A9AU6BN7WO4cDasC2Ry01',
  price_4000_gems: 'https://buy.stripe.com/6oU9AUaS3dh8gZpasC2Ry02',
} as const;

// Gem amounts and pricing for each plan
const SUBSCRIPTION_PLANS = {
  price_400_gems: {
    gems: 400,
    price: 4.99,
    name: '400 Gems Monthly',
  },
  price_1800_gems: {
    gems: 1800,
    price: 19.99,
    name: '1800 Gems Monthly',
  },
  price_4000_gems: {
    gems: 4000,
    price: 39.99,
    name: '4000 Gems Monthly',
  },
} as const;

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.',
        },
        { status: 500 }
      );
    }

    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await request.json();

    // Validate price ID
    if (!priceId || !(priceId in SUBSCRIPTION_PLANS)) {
      return NextResponse.json(
        {
          error:
            'Invalid price ID. Valid options: price_400_gems, price_1800_gems, price_4000_gems',
        },
        { status: 400 }
      );
    }

    const plan = SUBSCRIPTION_PLANS[priceId as keyof typeof SUBSCRIPTION_PLANS];

    // Get the actual Stripe Price ID from the payment link
    const actualPriceId = await getPriceIdFromPaymentLink(
      PAYMENT_LINKS[priceId as keyof typeof PAYMENT_LINKS]
    );

    if (!actualPriceId) {
      return NextResponse.json(
        { error: 'Failed to retrieve price ID from payment link' },
        { status: 500 }
      );
    }

    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or retrieve Stripe customer
    let customer;
    if (user.stripe_customer_id) {
      try {
        customer = await stripe.customers.retrieve(user.stripe_customer_id);
      } catch (error) {
        console.log('Customer not found, creating new one');
        customer = null;
      }
    }

    if (!customer) {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripe_customer_id: customer.id },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: actualPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/gen?subscription=success&plan=${plan.name}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/gems?subscription=canceled`,
      metadata: {
        userId: user.id,
        planName: plan.name,
        gemAmount: plan.gems.toString(),
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planName: plan.name,
          gemAmount: plan.gems.toString(),
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Error creating subscription checkout session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve plan information
export async function GET() {
  return NextResponse.json({
    plans: Object.entries(SUBSCRIPTION_PLANS).map(([priceId, plan]) => ({
      priceId,
      gems: plan.gems,
      price: plan.price,
      name: plan.name,
    })),
  });
}
