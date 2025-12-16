'use client';

// ==============================================
// TRIPZY - Flight Detail Page
// ==============================================

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Plane,
    Clock,
    Users,
    ChevronLeft,
    Luggage,
    Wifi,
    Utensils,
    Monitor,
    Calendar,
    Minus,
    Plus,
    Check,
    ArrowRight
} from 'lucide-react';
import { mockFlights } from '@/lib/mockData';
import { createBooking } from '@/lib/bookingService';
import { useAuthStore } from '@/hooks/useAuthStore';
import { toast } from '@/components/Toast';
import { Flight } from '@/types';

// -------------------- Flight Info Card --------------------

const FlightInfoCard = ({ flight }: { flight: Flight }) => (
    <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <Plane size={32} className="text-primary-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">{flight.airline}</h3>
                    <p className="text-gray-500">{flight.flightNumber} • {flight.aircraft}</p>
                </div>
            </div>
            <span className={`badge text-sm ${flight.cabinClass === 'economy' ? 'bg-gray-100 text-gray-700' :
                flight.cabinClass === 'business' ? 'bg-primary-100 text-primary-700' :
                    flight.cabinClass === 'first' ? 'bg-accent-100 text-accent-700' :
                        'bg-blue-100 text-blue-700'
                }`}>
                {flight.cabinClass.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8">
            <div className="flex items-center justify-between">
                <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900 mb-1">{flight.departureTime}</p>
                    <p className="text-2xl font-bold text-primary-600 mb-1">{flight.originCode}</p>
                    <p className="text-sm text-gray-600 max-w-[150px]">{flight.origin}</p>
                </div>

                <div className="flex-1 px-8">
                    <div className="relative flex items-center">
                        <div className="w-4 h-4 rounded-full bg-primary-600 shadow-lg shadow-primary-600/30" />
                        <div className="flex-1 border-t-2 border-dashed border-primary-300 mx-3 relative">
                            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
                                <Plane size={20} className="text-primary-600 rotate-90" />
                            </div>
                        </div>
                        <div className="w-4 h-4 rounded-full bg-accent-600 shadow-lg shadow-accent-600/30" />
                    </div>
                    <div className="text-center mt-4">
                        <p className="font-semibold text-gray-700">{flight.duration}</p>
                        <p className="text-sm text-gray-500">
                            {flight.stops === 0 ? 'Non-stop flight' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900 mb-1">{flight.arrivalTime}</p>
                    <p className="text-2xl font-bold text-accent-600 mb-1">{flight.destinationCode}</p>
                    <p className="text-sm text-gray-600 max-w-[150px]">{flight.destination}</p>
                </div>
            </div>
        </div>
    </div>
);

// -------------------- Booking Form Data --------------------

interface BookingFormData {
    travelDate: string;
    passengers: number;
    total: number;
}

// -------------------- Sticky Booking Widget --------------------

interface BookingWidgetProps {
    flight: Flight;
    onRequestBooking: (data: BookingFormData) => void;
    isSubmitting: boolean;
}

const BookingWidget = ({ flight, onRequestBooking, isSubmitting }: BookingWidgetProps) => {
    const [passengers, setPassengers] = useState(1);
    const [travelDate, setTravelDate] = useState('');

    const subtotal = flight.price * passengers;
    const serviceFee = Math.round(subtotal * 0.08);
    const taxes = Math.round(subtotal * 0.12);
    const total = subtotal + serviceFee + taxes;

    const handleSubmit = () => {
        onRequestBooking({ travelDate, passengers, total });
    };

    return (
        <div className="card p-6 sticky top-24 shadow-xl border border-gray-100">
            {/* Instant Booking Badge */}
            <div className="bg-success-50 border border-success-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="text-sm font-medium text-success-700">Instant Confirmation</span>
            </div>


            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-gray-900">${flight.price}</span>
                <span className="text-gray-500">/ person</span>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">TRAVEL DATE</label>
                <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className="input-field pl-9 text-sm py-2.5" />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">PASSENGERS</label>
                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Users size={18} className="text-gray-400" />
                        <span className="text-sm">{passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50">
                            <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-medium">{passengers}</span>
                        <button onClick={() => setPassengers(Math.min(9, passengers + 1))} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50">
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-70">
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                    </span>
                ) : '⚡ Book Now'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-3">Confirm your booking instantly</p>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">${flight.price} × {passengers} passenger{passengers > 1 ? 's' : ''}</span>
                    <span className="font-medium">${subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-medium">${serviceFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & fees</span>
                    <span className="font-medium">${taxes}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">${total}</span>
                </div>
            </div>
        </div>
    );
};

// -------------------- Main Page Component --------------------

export default function FlightDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const flight = useMemo(() => {
        return mockFlights.find(f => f.id === params.id);
    }, [params.id]);

    if (!flight) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Flight Not Found</h2>
                    <p className="text-gray-600 mb-4">The flight you're looking for doesn't exist.</p>
                    <Link href="/search?tab=flights" className="btn-primary">Browse Flights</Link>
                </div>
            </div>
        );
    }

    const handleRequestBooking = async (data: BookingFormData) => {
        if (!isAuthenticated) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            router.push(`/login?returnUrl=${returnUrl}`);
            return;
        }

        setIsSubmitting(true);

        try {
            const startDate = data.travelDate ? new Date(data.travelDate) : new Date();
            const endDate = new Date(startDate); // Same day for flights

            // Flights use instant booking (skip owner approval)
            const bookingId = await createBooking({
                propertyId: flight.id,
                propertyType: 'flight',
                propertyTitle: `${flight.airline} - ${flight.originCode} to ${flight.destinationCode}`,
                propertyImage: flight.images[0],
                travelerId: user!.id,
                travelerName: user!.name,
                travelerEmail: user!.email,
                ownerId: flight.ownerId,
                startDate,
                endDate,
                guests: data.passengers,
                totalPrice: data.total,
                currency: 'USD',
                isInstantBook: true, // Flights have instant booking
            });

            toast.success('Booking Created!', 'Complete your payment to confirm.');
            router.push(`/checkout/${bookingId}`);
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Booking Failed', 'Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <Link href="/search?tab=flights" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 transition-colors">
                        <ChevronLeft size={20} />
                        Back to search
                    </Link>

                    <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
                        {flight.origin} <ArrowRight className="inline text-primary-600" size={28} /> {flight.destination}
                    </h1>
                    <p className="text-gray-600">{flight.airline} • {flight.flightNumber}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <FlightInfoCard flight={flight} />

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-6">What's Included</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl text-center">
                                    <Luggage size={24} className="text-primary-600 mb-2" />
                                    <p className="text-sm font-medium">Baggage</p>
                                    <p className="text-xs text-gray-500">{flight.baggageAllowance}</p>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl text-center">
                                    <Wifi size={24} className="text-primary-600 mb-2" />
                                    <p className="text-sm font-medium">WiFi</p>
                                    <p className="text-xs text-gray-500">Available</p>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl text-center">
                                    <Utensils size={24} className="text-primary-600 mb-2" />
                                    <p className="text-sm font-medium">Meals</p>
                                    <p className="text-xs text-gray-500">Included</p>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl text-center">
                                    <Monitor size={24} className="text-primary-600 mb-2" />
                                    <p className="text-sm font-medium">Entertainment</p>
                                    <p className="text-xs text-gray-500">Personal screen</p>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-4">Booking Policies</h2>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Check size={18} className="text-success-600 mt-0.5" />
                                    <p className="text-gray-600 text-sm">Free cancellation up to 24 hours before departure</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check size={18} className="text-success-600 mt-0.5" />
                                    <p className="text-gray-600 text-sm">Date change allowed with fee</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check size={18} className="text-success-600 mt-0.5" />
                                    <p className="text-gray-600 text-sm">Seat selection available at check-in</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <BookingWidget flight={flight} onRequestBooking={handleRequestBooking} isSubmitting={isSubmitting} />
                    </div>
                </div>
            </div>
        </div>
    );
}
