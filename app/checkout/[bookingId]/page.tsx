'use client';

// ==============================================
// TRIPZY - Checkout Page with Stripe
// ==============================================

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import {
    ArrowLeft,
    CreditCard,
    Shield,
    Check,
    Loader2,
    Calendar,
    Users,
    Lock
} from 'lucide-react';
import { getStripe, cardElementOptions } from '@/lib/stripe';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
    confirmPayment,
    formatBookingDate,
    BookingDocument
} from '@/lib/bookingService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/components/Toast';

// -------------------- Payment Form --------------------

interface PaymentFormProps {
    booking: BookingDocument;
    onSuccess: () => void;
}

const PaymentForm = ({ booking, onSuccess }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setCardError(null);

        try {
            // Simulate payment processing delay (Test Mode)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In Test Mode, we just simulate a successful payment
            // In production, you would:
            // 1. Create a PaymentIntent on your backend
            // 2. Confirm the payment with stripe.confirmCardPayment()

            // For this demo, we'll just update the booking status
            await confirmPayment(booking.id);

            toast.success('Payment Successful!', 'Your booking has been confirmed.');
            onSuccess();
        } catch (error) {
            console.error('Payment error:', error);
            setCardError('Payment failed. Please try again.');
            toast.error('Payment Failed', 'Please check your card details and try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Details
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <CreditCard size={20} />
                    </div>
                    <div className="pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                        <CardElement
                            options={cardElementOptions}
                            onChange={(e) => {
                                setCardComplete(e.complete);
                                setCardError(e.error?.message || null);
                            }}
                        />
                    </div>
                </div>
                {cardError && (
                    <p className="mt-2 text-sm text-error-600">{cardError}</p>
                )}
            </div>

            {/* Test Card Info */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Shield size={16} className="text-primary-600" />
                    <span className="font-medium text-primary-900">Test Mode</span>
                </div>
                <p className="text-sm text-primary-700">
                    Use test card: <code className="bg-primary-100 px-2 py-0.5 rounded font-mono">4242 4242 4242 4242</code>
                </p>
                <p className="text-sm text-primary-600 mt-1">
                    Any future date, any 3-digit CVC
                </p>
            </div>

            {/* Secure Payment Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock size={14} />
                <span>Secured by Stripe. Your payment is safe.</span>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!stripe || isProcessing || !cardComplete}
                className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <CreditCard size={20} />
                        Pay ${booking.totalPrice.toLocaleString()}
                    </>
                )}
            </button>
        </form>
    );
};

// -------------------- Main Checkout Page --------------------

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.bookingId as string;
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

    const [booking, setBooking] = useState<BookingDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Auth check
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/login?returnUrl=/checkout/${bookingId}`);
        }
    }, [authLoading, isAuthenticated, router, bookingId]);

    // Fetch booking
    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) return;

            try {
                const bookingRef = doc(db, 'bookings', bookingId);
                const bookingDoc = await getDoc(bookingRef);

                if (!bookingDoc.exists()) {
                    toast.error('Booking not found');
                    router.push('/trips');
                    return;
                }

                const bookingData = {
                    id: bookingDoc.id,
                    ...bookingDoc.data()
                } as BookingDocument;

                // Verify the booking belongs to the current user
                if (bookingData.travelerId !== user?.id) {
                    toast.error('Unauthorized access');
                    router.push('/trips');
                    return;
                }

                // Check if already paid
                if (bookingData.status === 'CONFIRMED') {
                    toast.success('Already Paid', 'This booking is already confirmed.');
                    router.push('/trips');
                    return;
                }

                // Check if awaiting payment
                if (bookingData.status !== 'AWAITING_PAYMENT') {
                    toast.error('This booking is not ready for payment yet.');
                    router.push('/trips');
                    return;
                }

                setBooking(bookingData);
            } catch (error) {
                console.error('Error fetching booking:', error);
                toast.error('Failed to load booking');
                router.push('/trips');
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.id) {
            fetchBooking();
        }
    }, [bookingId, user?.id, router]);

    const handlePaymentSuccess = () => {
        setPaymentSuccess(true);
        setTimeout(() => {
            router.push('/trips');
        }, 3000);
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary-600" />
            </div>
        );
    }

    // Payment Success View
    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-success-50 to-primary-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in">
                    <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} className="text-success-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Your booking for <span className="font-semibold">{booking?.propertyTitle}</span> has been confirmed.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Redirecting to your trips...
                    </p>
                    <Link href="/trips" className="btn-primary">
                        View My Trips
                    </Link>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Booking not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 py-8">
                <div className="container mx-auto px-4">
                    <Link
                        href="/trips"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
                    >
                        <ArrowLeft size={18} />
                        Back to My Trips
                    </Link>
                    <h1 className="text-3xl font-display font-bold text-white">
                        Complete Your Booking
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left: Payment Form */}
                    <div className="lg:col-span-3">
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <CreditCard size={20} className="text-primary-600" />
                                Payment Details
                            </h2>

                            <Elements stripe={getStripe()}>
                                <PaymentForm
                                    booking={booking}
                                    onSuccess={handlePaymentSuccess}
                                />
                            </Elements>
                        </div>
                    </div>

                    {/* Right: Booking Summary */}
                    <div className="lg:col-span-2">
                        <div className="card p-6 sticky top-24">
                            <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>

                            {/* Property Image */}
                            <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                                <img
                                    src={booking.propertyImage}
                                    alt={booking.propertyTitle}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Property Details */}
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {booking.propertyTitle}
                            </h3>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>
                                        {formatBookingDate(booking.startDate)} - {formatBookingDate(booking.endDate)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={14} />
                                    <span>{booking.guests} {booking.guests > 1 ? 'guests' : 'guest'}</span>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>${(booking.totalPrice * 0.8).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Service fee</span>
                                    <span>${(booking.totalPrice * 0.12).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Taxes</span>
                                    <span>${(booking.totalPrice * 0.08).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 mt-2">
                                    <span>Total</span>
                                    <span className="text-primary-600">${booking.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
