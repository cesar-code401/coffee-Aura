"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { createPaymentIntent } from "@/server/actions/payment.actions";

// Make sure to call loadStripe outside of a component's render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");

function CheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: (id: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is not required if we handle redirects manually or use 'if_required' redirects
      },
      redirect: 'if_required'
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {message && <div className="text-red-500 text-sm font-medium">{message}</div>}
      <Button 
        disabled={isLoading || !stripe || !elements} 
        className="w-full h-12 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold"
      >
        {isLoading ? "Procesando..." : `Pagar $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

export function StripeCheckout({ amount, onSuccess }: { amount: number, onSuccess: (id: string) => void }) {
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    createPaymentIntent(amount).then((res) => {
      if (res.success && res.clientSecret) {
        setClientSecret(res.clientSecret);
      }
    });
  }, [amount]);

  if (!clientSecret) {
    return <div className="py-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
    </div>;
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#1c1917', // stone-900
      colorBackground: '#ffffff',
      colorText: '#1c1917',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
  };

  return (
    <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
}
