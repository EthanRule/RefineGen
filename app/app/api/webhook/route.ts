import Stripe from 'stripe';
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();

// For this route there are 3 possible purchases: 4.99, 19.99, 39.99

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('Stripe-Signature');

  try {
    let event = stripe.webhooks.constructEvent(
      payload,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Webhook event: ', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      const priceId = session.line_items?.data?.[0]?.price?.id;
      console.log('checkout.session.completed', email, priceId);

      if (email && priceId) {
        let gemsAmount = 0;
        switch (priceId) {
          case 'price_1SHri4JxtYYSN7hpm2fkuQzO':
            gemsAmount = 400;
            break;
          case 'price_1SHrjQJxtYYSN7hp1ojYFsUC':
            gemsAmount = 1800;
            break;
          case 'price_1SHrjxJxtYYSN7hpz32GDuzP':
            gemsAmount = 4000;
            break;
          default:
            console.error('Unknown price ID: ', priceId);
            gemsAmount = 0;
            break;
        }

        const user = await prisma.user.findUnique({
          where: { email: email },
        });
        if (user) {
          await prisma.user.update({
            where: { email: email },
            data: {
              tokens_remaining: (user.tokens_remaining || 0) + gemsAmount,
            },
          });
          console.log(`Added ${gemsAmount} gems to user ${email}`);
        } else {
          console.log(`User ${email} not found`);
        }
      }
    }
    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
