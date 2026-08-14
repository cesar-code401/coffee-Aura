'use server'

import Stripe from 'stripe';

// This is a server action, ensure you have STRIPE_SECRET_KEY in your .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia',
});

export async function createPaymentIntent(amount: number, metadata?: Record<string, string>) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'usd',
      metadata,
    });

    return { 
      success: true, 
      clientSecret: paymentIntent.client_secret 
    };
  } catch (error: any) {
    console.error("Stripe createPaymentIntent failed:", error);
    return { success: false, error: error.message || "Failed to initialize payment" };
  }
}
