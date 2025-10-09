import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

// Payment links from Stripe Dashboard
const PAYMENT_LINKS = {
  price_400_gems: 'https://buy.stripe.com/bJebJ2aS3a4W4cD58i2Ry00',
  price_1800_gems: 'https://buy.stripe.com/14A9AU6BN7WO4cDasC2Ry01',
  price_4000_gems: 'https://buy.stripe.com/6oU9AUaS3dh8gZpasC2Ry02',
} as const;

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
    console.log('Payment link details:', {
      id: paymentLink.id,
      active: paymentLink.active,
      line_items_count: paymentLink.line_items?.data?.length || 0,
    });

    // Get the first line item's price ID
    if (paymentLink.line_items && paymentLink.line_items.data.length > 0) {
      const firstLineItem = paymentLink.line_items.data[0];
      console.log('First line item:', firstLineItem);
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

export async function GET(request: NextRequest) {
  try {
    console.log('Testing payment links...');

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error: 'STRIPE_SECRET_KEY environment variable is not set',
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    // Test each payment link
    const results: Record<string, { url: string; priceId: string | null; success: boolean }> =
      {};

    for (const [planName, paymentLinkUrl] of Object.entries(PAYMENT_LINKS)) {
      console.log(`\n--- Testing ${planName} ---`);
      console.log('URL:', paymentLinkUrl);

      const priceId = await getPriceIdFromPaymentLink(paymentLinkUrl);

      results[planName] = {
        url: paymentLinkUrl,
        priceId: priceId,
        success: !!priceId,
      };

      console.log(`Result for ${planName}:`, results[planName]);
    }

    return NextResponse.json({
      message: 'Payment link test completed',
      results: results,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) + '...',
    });
  } catch (error) {
    console.error('Error testing payment links:', error);
    return NextResponse.json(
      {
        error: 'Failed to test payment links',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
