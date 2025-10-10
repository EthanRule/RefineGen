import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get Price ID from payment link
async function getPriceIdFromPaymentLink(paymentLinkUrl: string): Promise<string | null> {
  try {
    console.log('getPriceIdFromPaymentLink called with URL:', paymentLinkUrl);

    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return null;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    // Extract the payment link ID from the URL
    const paymentLinkId = paymentLinkUrl.split('/').pop();
    console.log('Extracted payment link ID:', paymentLinkId);

    if (!paymentLinkId) {
      console.error('Could not extract payment link ID from URL:', paymentLinkUrl);
      return null;
    }

    // Retrieve the payment link from Stripe
    console.log('Retrieving payment link from Stripe...');
    const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
    console.log('Payment link retrieved successfully');

    // Get the first line item's price ID
    if (paymentLink.line_items && paymentLink.line_items.data.length > 0) {
      const firstLineItem = paymentLink.line_items.data[0];
      if (firstLineItem && firstLineItem.price) {
        console.log('Found price ID:', firstLineItem.price.id);
        return firstLineItem.price.id;
      }
    }

    console.error('No line items found in payment link');
    return null;
  } catch (error) {
    console.error('Error retrieving price ID from payment link:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

// Direct price IDs from Stripe Dashboard
const DIRECT_PRICE_IDS = {
  price_400_gems: 'price_1SG1vHJxtYYSN7hpwOJ52x9Q', // 400 gems - $4.99
  price_1800_gems: 'price_1SG1wHJxtYYSN7hpwOJ52x9Q', // 1800 gems - $19.99
  price_4000_gems: 'price_1SG1z4JxtYYSN7hp7Ftszmas', // 4000 gems - $39.99
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
    console.log('Starting subscription creation process...');

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return NextResponse.json(
        {
          error:
            'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.',
        },
        { status: 500 }
      );
    }

    console.log('Stripe key found, initializing Stripe client...');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    console.log('Getting server session...');
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      console.error('No valid session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session found for user:', session.user.email);

    const { priceId } = await request.json();
    console.log('Received priceId:', priceId);

    // Validate price ID
    if (!priceId || !(priceId in SUBSCRIPTION_PLANS)) {
      console.error('Invalid priceId:', priceId);
      return NextResponse.json(
        {
          error:
            'Invalid price ID. Valid options: price_400_gems, price_1800_gems, price_4000_gems',
        },
        { status: 400 }
      );
    }

    const plan = SUBSCRIPTION_PLANS[priceId as keyof typeof SUBSCRIPTION_PLANS];
    console.log('Selected plan:', plan);

    // Get the direct Stripe Price ID
    console.log('Using direct Price ID...');
    const actualPriceId = DIRECT_PRICE_IDS[priceId as keyof typeof DIRECT_PRICE_IDS];
    console.log('Using direct price ID:', actualPriceId);

    if (!actualPriceId) {
      console.error('Failed to retrieve Price ID from configuration');
      return NextResponse.json(
        { error: 'Failed to retrieve price ID. Please check your Stripe configuration.' },
        { status: 500 }
      );
    }

    console.log('Using Price ID:', actualPriceId);

    // Get or create user in database
    console.log('Looking up user in database...');
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error('User not found in database:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', user.id);

    // Create or retrieve Stripe customer
    console.log('Handling Stripe customer...');
    let customer;
    if (user.stripe_customer_id) {
      try {
        console.log('Retrieving existing customer:', user.stripe_customer_id);
        customer = await stripe.customers.retrieve(user.stripe_customer_id);
        console.log('Existing customer found');
      } catch (error) {
        console.log('Customer not found, creating new one. Error:', error);
        customer = null;
      }
    }

    if (!customer) {
      console.log('Creating new Stripe customer...');
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      console.log('New customer created:', customer.id);

      // Update user with Stripe customer ID
      console.log('Updating user with Stripe customer ID...');
      await prisma.user.update({
        where: { id: user.id },
        data: { stripe_customer_id: customer.id },
      });
    }

    // Create checkout session
    console.log('Creating checkout session...');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

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

    console.log('Checkout session created successfully:', checkoutSession.id);
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
