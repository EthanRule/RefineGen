import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { amount, email } = await request.json();

    const gemToPriceIdMap = {
      '400': 'price_1SHri4JxtYYSN7hpm2fkuQzO',
      '1800': 'price_1SHrjQJxtYYSN7hp1ojYFsUC',
      '4000': 'price_1SHrjxJxtYYSN7hpz32GDuzP',
    };

    const priceId = gemToPriceIdMap[amount as keyof typeof gemToPriceIdMap];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/gems?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/gems?success=false`,
      customer_email: email,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error purchasing gems:', error);
    return NextResponse.json({ error: 'Failed to purchase gems' }, { status: 500 });
  }
}
