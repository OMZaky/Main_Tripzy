// ==============================================
// TRIPZY - Stripe Configuration
// ==============================================

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe Public Key (Test Mode)
// Note: This is a test/demo public key. In production, use environment variables.
const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || 'pk_test_51Demo1234567890abcdefghijklmnop';

// Singleton pattern to ensure Stripe is only loaded once
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
    if (!stripePromise) {
        stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
    }
    return stripePromise;
};

// Stripe Element styles that match our Tailwind design
export const stripeElementStyles = {
    style: {
        base: {
            fontSize: '16px',
            color: '#1f2937', // gray-800
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#9ca3af', // gray-400
            },
            iconColor: '#6366f1', // primary-500
        },
        invalid: {
            color: '#ef4444', // error-500
            iconColor: '#ef4444',
        },
        complete: {
            color: '#10b981', // success-500
            iconColor: '#10b981',
        },
    },
};

// Card Element options
export const cardElementOptions = {
    style: stripeElementStyles.style,
    hidePostalCode: true,
};
