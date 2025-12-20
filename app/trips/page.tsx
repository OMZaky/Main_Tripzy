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
    Car,
    Edit3,
    XCircle
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
    getTravelerBookings,
    confirmPayment,
    formatBookingDate,
    getStatusInfo,
    BookingDocument,
    updateBookingStatus,
    canModifyBooking,
    requestModification,
    applyModificationInstantly,
    ModificationData
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

// -------------------- Modify Booking Modal --------------------

interface ModifyBookingModalProps {
    booking: BookingDocument;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (modifications: ModificationData) => void;
    isProcessing: boolean;
}

const ModifyBookingModal = ({ booking, isOpen, onClose, onSubmit, isProcessing }: ModifyBookingModalProps) => {
    const [formData, setFormData] = useState<ModificationData>({
        checkInTime: booking.checkInTime || '',
        checkOutTime: booking.checkOutTime || '',
        specialRequests: booking.specialRequests || '',
        guests: booking.guests || 1,
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'guests' ? parseInt(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const isPropertyBooking = booking.propertyType === 'hotel';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
                    <div className="flex items-center gap-3">
                        <Edit3 size={24} />
                        <div>
                            <h2 className="text-xl font-bold">Modify Booking</h2>
                            <p className="text-white/80 text-sm">{booking.propertyTitle}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Booking Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-2">
                        <div className="flex items-center gap-3">
                            <img
                                src={booking.propertyImage}
                                alt={booking.propertyTitle}
                                className="w-14 h-14 rounded-lg object-cover"
                            />
                            <div>
                                <p className="font-medium">{formatBookingDate(booking.startDate)} - {formatBookingDate(booking.endDate)}</p>
                                <p className="text-sm text-gray-500 capitalize">{booking.propertyType}</p>
                            </div>
                        </div>
                    </div>

                    {isPropertyBooking && (
                        <>
                            {/* Check-in / Check-out Times */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Check-in Time
                                    </label>
                                    <input
                                        type="time"
                                        name="checkInTime"
                                        value={formData.checkInTime}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Check-out Time
                                    </label>
                                    <input
                                        type="time"
                                        name="checkOutTime"
                                        value={formData.checkOutTime}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Guests */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Guests
                                </label>
                                <select
                                    name="guests"
                                    value={formData.guests}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                        <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Special Requests */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Special Requests
                                </label>
                                <textarea
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Any special requirements or requests..."
                                    className="input-field resize-none"
                                />
                            </div>
                        </>
                    )}

                    {/* Info Notice */}
                    <div className={`p-3 rounded-lg text-sm ${isPropertyBooking ? 'bg-orange-50 text-orange-700' : 'bg-primary-50 text-primary-700'}`}>
                        {isPropertyBooking ? (
                            <p>⏳ Changes to property bookings require owner approval.</p>
                        ) : (
                            <p>✨ Changes to flights/cars are applied instantly.</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Edit3 size={18} />
                                    {isPropertyBooking ? 'Request Changes' : 'Apply Changes'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// -------------------- Booking Card --------------------

interface BookingCardProps {
    booking: BookingDocument;
    onPayNow: (booking: BookingDocument) => void;
    onModify: (booking: BookingDocument) => void;
    onCancel: (bookingId: string) => void;
}

const BookingCard = ({ booking, onPayNow, onModify, onCancel }: BookingCardProps) => {
    const statusInfo = getStatusInfo(booking.status);

    const getPropertyIcon = () => {
        switch (booking.propertyType) {
            case 'flight': return <Plane size={16} />;
            case 'car': return <Car size={16} />;
            default: return <Building2 size={16} />;
        }
    };

    // Check if modification is allowed (48 hours before start, only for confirmed)
    const modificationCheck = canModifyBooking(booking);
    const isModifyAllowed = modificationCheck.allowed && booking.status === 'CONFIRMED';

    // Event handlers with stopPropagation to prevent card click hijacking
    const handleModifyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onModify(booking);
    };

    const handleCancelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onCancel(booking.id);
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
                        {booking.status === 'PENDING_MODIFICATION' && <Edit3 size={12} />}
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

                    {/* Action Buttons */}
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
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-warning-600 flex items-center gap-2">
                                <Clock size={16} />
                                Waiting for owner approval...
                            </p>
                            <button
                                type="button"
                                onClick={handleCancelClick}
                                className="px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer relative z-10"
                            >
                                <XCircle size={16} />
                                Cancel Request
                            </button>
                        </div>
                    )}

                    {booking.status === 'PENDING_MODIFICATION' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-orange-600 flex items-center gap-2">
                                <Edit3 size={16} />
                                Modification request pending owner approval...
                            </p>
                        </div>
                    )}

                    {booking.status === 'CONFIRMED' && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-success-600 flex items-center gap-2">
                                <Check size={16} />
                                Booking confirmed! Get ready for your trip.
                            </p>
                            <div className="flex items-center gap-2 relative z-10">
                                {isModifyAllowed && (
                                    <button
                                        type="button"
                                        onClick={handleModifyClick}
                                        className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <Edit3 size={16} />
                                        Modify
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleCancelClick}
                                    className="px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <XCircle size={16} />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {booking.status === 'CANCELLED' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <X size={16} />
                                This booking has been cancelled.
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
    const [modifyingBooking, setModifyingBooking] = useState<BookingDocument | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

    // Filter bookings based on active filter
    const filteredBookings = bookings.filter(booking => {
        const now = new Date();
        const startDate = booking.startDate.toDate();
        const endDate = booking.endDate.toDate();

        switch (activeFilter) {
            case 'upcoming':
                // Upcoming = not cancelled, start date is in future
                return booking.status !== 'CANCELLED' && startDate > now;
            case 'completed':
                // Completed = confirmed/completed and end date has passed
                return (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && endDate < now;
            case 'cancelled':
                return booking.status === 'CANCELLED';
            default:
                return true; // 'all' shows everything
        }
    });

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

    // Handle Modify button click
    const handleModify = (booking: BookingDocument) => {
        const check = canModifyBooking(booking);
        if (!check.allowed) {
            toast.error('Cannot Modify', check.reason || 'Unable to modify this booking.');
            return;
        }
        setModifyingBooking(booking);
    };

    // Handle Cancel button click
    const handleCancel = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        setIsProcessing(true);
        try {
            await updateBookingStatus(bookingId, 'CANCELLED');
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
            ));
            toast.success('Booking Cancelled', 'Your booking has been cancelled.');
        } catch (error) {
            toast.error('Failed to cancel booking. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle modification submission
    const handleSubmitModification = async (modifications: ModificationData) => {
        if (!modifyingBooking || !user?.id) return;

        setIsProcessing(true);
        try {
            // Check property type - flights/cars get instant updates
            if (modifyingBooking.propertyType === 'flight' || modifyingBooking.propertyType === 'car') {
                await applyModificationInstantly(modifyingBooking.id, modifications);
                setBookings(prev => prev.map(b =>
                    b.id === modifyingBooking.id ? { ...b, ...modifications } : b
                ));
                toast.success('Booking Updated', 'Your changes have been applied.');
            } else {
                // Properties (hotels) need owner approval
                const currentValues: ModificationData = {
                    checkInTime: modifyingBooking.checkInTime,
                    checkOutTime: modifyingBooking.checkOutTime,
                    specialRequests: modifyingBooking.specialRequests,
                    guests: modifyingBooking.guests,
                };
                await requestModification(modifyingBooking.id, user.id, modifications, currentValues);
                setBookings(prev => prev.map(b =>
                    b.id === modifyingBooking.id ? { ...b, status: 'PENDING_MODIFICATION' as const } : b
                ));
                toast.success('Modification Requested', 'Your request has been sent to the property owner for approval.');
            }
            setModifyingBooking(null);
        } catch (error) {
            toast.error('Failed to submit modification. Please try again.');
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
                    <button
                        type="button"
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${activeFilter === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All Trips ({bookings.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${activeFilter === 'upcoming'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveFilter('completed')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${activeFilter === 'completed'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Completed
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveFilter('cancelled')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${activeFilter === 'cancelled'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Cancelled
                    </button>
                </div>

                {/* Bookings List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading your trips...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {activeFilter === 'all' ? 'No trips yet' : `No ${activeFilter} trips`}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {activeFilter === 'all'
                                ? 'Start exploring and book your first adventure!'
                                : `You don't have any ${activeFilter} bookings.`}
                        </p>
                        {activeFilter === 'all' && (
                            <Link href="/search?tab=stays" className="btn-primary">
                                Browse Stays
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map(booking => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onPayNow={handlePayNow}
                                onModify={handleModify}
                                onCancel={handleCancel}
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

            {/* Modification Modal */}
            {modifyingBooking && (
                <ModifyBookingModal
                    booking={modifyingBooking}
                    isOpen={true}
                    onClose={() => setModifyingBooking(null)}
                    onSubmit={handleSubmitModification}
                    isProcessing={isProcessing}
                />
            )}
        </div>
    );
}

