import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get gem amount from any price ID
async function getGemAmountFromPriceId(
  priceId: string,
  stripe: Stripe
): Promise<number | null> {
  try {
    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return null;
    }

    // First check our predefined plans
    if (priceId in GEM_PLANS) {
      return GEM_PLANS[priceId as keyof typeof GEM_PLANS];
    }

    // If not found, try to retrieve the price from Stripe
    const price = await stripe.prices.retrieve(priceId);

    // Map based on the amount (in cents)
    const amountInCents = price.unit_amount || 0;
    const amountInDollars = amountInCents / 100;

    // Map dollar amounts to gem amounts
    if (amountInDollars === 4.99) return 400;
    if (amountInDollars === 19.99) return 1800;
    if (amountInDollars === 39.99) return 4000;

    return null;
  } catch (error) {
    console.error('Error retrieving price:', error);
    return null;
  }
}

// Gem amounts for each plan
const GEM_PLANS = {
  price_400_gems: 400, // $4.99 monthly
  price_1800_gems: 1800, // $19.99 monthly
  price_4000_gems: 4000, // $39.99 monthly
} as const;

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, stripe);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, stripe);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, stripe);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, stripe: Stripe) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('No price ID found in subscription');
    return;
  }

  const gemAmount = await getGemAmountFromPriceId(priceId, stripe);

  if (!gemAmount) {
    console.error('Invalid price ID:', priceId);
    return;
  }

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripe_customer_id: customerId },
  });

  if (!user) {
    console.error('User not found for customer ID:', customerId);
    return;
  }

  // Update user subscription info and add gems
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_plan_id: priceId,
      subscription_current_period_start: new Date(
        (subscription as any).current_period_start * 1000
      ),
      subscription_current_period_end: new Date(
        (subscription as any).current_period_end * 1000
      ),
      is_premium: true,
      subscription_expires: new Date((subscription as any).current_period_end * 1000),
      // Add gems to user's balance
      tokens_remaining: (user.tokens_remaining || 0) + gemAmount,
      tokens_purchased_total: (user.tokens_purchased_total || 0) + gemAmount,
      last_token_refill_date: new Date(),
    },
  });

  console.log(`Subscription created for user ${user.id}, added ${gemAmount} gems`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('No price ID found in subscription');
    return;
  }

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripe_customer_id: customerId },
  });

  if (!user) {
    console.error('User not found for customer ID:', customerId);
    return;
  }

  // Update subscription info
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscription_status: subscription.status,
      subscription_plan_id: priceId,
      subscription_current_period_start: new Date(
        (subscription as any).current_period_start * 1000
      ),
      subscription_current_period_end: new Date(
        (subscription as any).current_period_end * 1000
      ),
      is_premium: subscription.status === 'active',
      subscription_expires: new Date((subscription as any).current_period_end * 1000),
    },
  });

  console.log(`Subscription updated for user ${user.id}, status: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripe_customer_id: customerId },
  });

  if (!user) {
    console.error('User not found for customer ID:', customerId);
    return;
  }

  // Cancel subscription
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscription_status: 'canceled',
      is_premium: false,
      subscription_expires: new Date(),
      stripe_subscription_id: null,
    },
  });

  console.log(`Subscription canceled for user ${user.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, stripe: Stripe) {
  if (!(invoice as any).subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    (invoice as any).subscription as string
  );
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('No price ID found in subscription');
    return;
  }

  const gemAmount = await getGemAmountFromPriceId(priceId, stripe);

  if (!gemAmount) {
    console.error('Invalid price ID:', priceId);
    return;
  }

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripe_customer_id: customerId },
  });

  if (!user) {
    console.error('User not found for customer ID:', customerId);
    return;
  }

  // Add gems for successful payment (monthly refill)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      tokens_remaining: (user.tokens_remaining || 0) + gemAmount,
      tokens_purchased_total: (user.tokens_purchased_total || 0) + gemAmount,
      last_token_refill_date: new Date(),
      subscription_current_period_start: new Date(
        (subscription as any).current_period_start * 1000
      ),
      subscription_current_period_end: new Date(
        (subscription as any).current_period_end * 1000
      ),
    },
  });

  console.log(`Payment succeeded for user ${user.id}, added ${gemAmount} gems`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice, stripe: Stripe) {
  if (!(invoice as any).subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    (invoice as any).subscription as string
  );
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripe_customer_id: customerId },
  });

  if (!user) {
    console.error('User not found for customer ID:', customerId);
    return;
  }

  // Update subscription status to past_due
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscription_status: 'past_due',
    },
  });

  console.log(`Payment failed for user ${user.id}`);
}
