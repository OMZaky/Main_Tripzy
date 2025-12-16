'use client';

// ==============================================
// TRIPZY - My Trips Page (Traveler)
// ==============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar,
    MapPin,
    Clock,
    CreditCard,
    Check,
    X,
    Loader2,
    Plane,
    Building2,
    Car
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
    getTravelerBookings,
    confirmPayment,
    formatBookingDate,
    getStatusInfo,
    BookingDocument
} from '@/lib/bookingService';
import { toast } from '@/components/Toast';

// -------------------- Payment Modal --------------------

interface PaymentModalProps {
    booking: BookingDocument;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing: boolean;
}

const PaymentModal = ({ booking, isOpen, onClose, onConfirm, isProcessing }: PaymentModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
                <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <img
                            src={booking.propertyImage}
                            alt={booking.propertyTitle}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                            <p className="font-semibold">{booking.propertyTitle}</p>
                            <p className="text-sm text-gray-500">
                                {formatBookingDate(booking.startDate)} - {formatBookingDate(booking.endDate)}
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between text-lg">
                            <span className="font-semibold">Total Amount</span>
                            <span className="font-bold text-primary-600">${booking.totalPrice}</span>
                        </div>
                    </div>
                </div>

                {/* Fake Card Input */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            className="input-field"
                            disabled={isProcessing}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                className="input-field"
                                disabled={isProcessing}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                            <input
                                type="text"
                                placeholder="123"
                                className="input-field"
                                disabled={isProcessing}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard size={18} />
                                Pay ${booking.totalPrice}
                            </>
                        )}
                    </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                    This is a simulated payment for demo purposes
                </p>
            </div>
        </div>
    );
};

// -------------------- Booking Card --------------------

interface BookingCardProps {
    booking: BookingDocument;
    onPayNow: (booking: BookingDocument) => void;
}

const BookingCard = ({ booking, onPayNow }: BookingCardProps) => {
    const statusInfo = getStatusInfo(booking.status);

    const getPropertyIcon = () => {
        switch (booking.propertyType) {
            case 'flight': return <Plane size={16} />;
            case 'car': return <Car size={16} />;
            default: return <Building2 size={16} />;
        }
    };

    return (
        <div className="card overflow-hidden hover-lift">
            <div className="flex flex-col md:flex-row">
                <div className="md:w-48 h-40 md:h-auto relative">
                    <img
                        src={booking.propertyImage}
                        alt={booking.propertyTitle}
                        className="w-full h-full object-cover"
                    />
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {booking.status === 'PENDING_APPROVAL' && <Clock size={12} />}
                        {booking.status === 'AWAITING_PAYMENT' && <CreditCard size={12} />}
                        {booking.status === 'CONFIRMED' && <Check size={12} />}
                        {booking.status === 'CANCELLED' && <X size={12} />}
                        {statusInfo.label}
                    </span>
                </div>

                <div className="flex-1 p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                {getPropertyIcon()}
                                <span className="capitalize">{booking.propertyType}</span>
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                {booking.propertyTitle}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>{formatBookingDate(booking.startDate)} - {formatBookingDate(booking.endDate)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">${booking.totalPrice}</p>
                            <p className="text-sm text-gray-500">{booking.currency}</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {booking.status === 'AWAITING_PAYMENT' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <Link
                                href={`/checkout/${booking.id}`}
                                className="btn-primary py-3 px-6 text-sm font-semibold inline-flex items-center gap-2"
                            >
                                <CreditCard size={16} />
                                Pay Now - Complete Your Booking
                            </Link>
                        </div>
                    )}

                    {booking.status === 'PENDING_APPROVAL' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-warning-600 flex items-center gap-2">
                                <Clock size={16} />
                                Waiting for owner approval...
                            </p>
                        </div>
                    )}

                    {booking.status === 'CONFIRMED' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-success-600 flex items-center gap-2">
                                <Check size={16} />
                                Booking confirmed! Get ready for your trip.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// -------------------- Main Page --------------------

export default function TripsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
    const [bookings, setBookings] = useState<BookingDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<BookingDocument | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Auth check
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?returnUrl=/trips');
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch bookings
    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?.id) return;

            try {
                const data = await getTravelerBookings(user.id);
                setBookings(data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
                toast.error('Failed to load your trips');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [user?.id]);

    const handlePayNow = (booking: BookingDocument) => {
        setSelectedBooking(booking);
    };

    const handleConfirmPayment = async () => {
        if (!selectedBooking) return;

        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            await confirmPayment(selectedBooking.id);
            setBookings(prev => prev.map(b =>
                b.id === selectedBooking.id ? { ...b, status: 'CONFIRMED' as const } : b
            ));
            toast.success('Payment Successful!', 'Your booking is now confirmed.');
            setSelectedBooking(null);
        } catch (error) {
            toast.error('Payment Failed', 'Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-hero-pattern py-10">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                        My Trips
                    </h1>
                    <p className="text-white/80">View and manage your bookings</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm whitespace-nowrap">
                        All Trips
                    </button>
                    <button className="px-4 py-2 bg-white text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 whitespace-nowrap">
                        Upcoming
                    </button>
                    <button className="px-4 py-2 bg-white text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 whitespace-nowrap">
                        Completed
                    </button>
                    <button className="px-4 py-2 bg-white text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 whitespace-nowrap">
                        Cancelled
                    </button>
                </div>

                {/* Bookings List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading your trips...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No trips yet</h3>
                        <p className="text-gray-500 mb-6">Start exploring and book your first adventure!</p>
                        <Link href="/search?tab=stays" className="btn-primary">
                            Browse Stays
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onPayNow={handlePayNow}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {selectedBooking && (
                <PaymentModal
                    booking={selectedBooking}
                    isOpen={true}
                    onClose={() => setSelectedBooking(null)}
                    onConfirm={handleConfirmPayment}
                    isProcessing={isProcessing}
                />
            )}
        </div>
    );
}
