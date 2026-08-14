'use server'

import Stripe from 'stripe';

// This is a server action, ensure you have STRIPE_SECRET_KEY in your .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
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

export async function approvePayment(orderId: string) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const payment = await prisma.payment.findFirst({
      where: { orderId: orderId, status: 'PENDING' }
    });

    if (!payment) return { success: false, error: "Pago no encontrado o ya aprobado" };

    // Update payment to PAID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID' }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
