'use client';

// ==============================================
// TRIPZY - Car Rental Detail Page
// ==============================================

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Car,
    Users,
    ChevronLeft,
    Fuel,
    Settings2,
    MapPin,
    Calendar,
    Minus,
    Plus,
    Check,
    Shield,
    Gauge,
    DoorOpen
} from 'lucide-react';
import { mockCars } from '@/lib/mockData';
import { createBooking } from '@/lib/bookingService';
import { useAuthStore } from '@/hooks/useAuthStore';
import { toast } from '@/components/Toast';
import { Car as CarType } from '@/types';

// -------------------- Booking Form Data --------------------

interface BookingFormData {
    pickupDate: string;
    dropoffDate: string;
    days: number;
    total: number;
}

// -------------------- Sticky Booking Widget --------------------

interface BookingWidgetProps {
    car: CarType;
    onRequestBooking: (data: BookingFormData) => void;
    isSubmitting: boolean;
}

const BookingWidget = ({ car, onRequestBooking, isSubmitting }: BookingWidgetProps) => {
    const [pickupDate, setPickupDate] = useState('');
    const [dropoffDate, setDropoffDate] = useState('');

    const days = useMemo(() => {
        if (!pickupDate || !dropoffDate) return 3;
        const start = new Date(pickupDate);
        const end = new Date(dropoffDate);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    }, [pickupDate, dropoffDate]);

    const subtotal = car.price * days;
    const insuranceFee = car.insuranceIncluded ? 0 : Math.round(subtotal * 0.15);
    const serviceFee = Math.round(subtotal * 0.10);
    const total = subtotal + insuranceFee + serviceFee;

    const handleSubmit = () => {
        onRequestBooking({ pickupDate, dropoffDate, days, total });
    };

    return (
        <div className="card p-6 sticky top-24 shadow-xl border border-gray-100">
            {/* Instant Booking Badge */}
            <div className="bg-success-50 border border-success-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="text-sm font-medium text-success-700">Instant Confirmation</span>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-gray-900">${car.price}</span>
                <span className="text-gray-500">/ day</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">PICK-UP</label>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="input-field pl-9 text-sm py-2.5" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">DROP-OFF</label>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="date" value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} className="input-field pl-9 text-sm py-2.5" />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">LOCATION</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{car.pickupLocation}</span>
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

            <p className="text-center text-sm text-gray-500 mt-3">Confirm your rental instantly</p>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">${car.price} × {days} days</span>
                    <span className="font-medium">${subtotal}</span>
                </div>
                {!car.insuranceIncluded && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Insurance</span>
                        <span className="font-medium">${insuranceFee}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-medium">${serviceFee}</span>
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

export default function CarDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const car = useMemo(() => {
        return mockCars.find(c => c.id === params.id);
    }, [params.id]);

    if (!car) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Car Not Found</h2>
                    <p className="text-gray-600 mb-4">The car you're looking for doesn't exist.</p>
                    <Link href="/search?tab=cars" className="btn-primary">Browse Cars</Link>
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
            const startDate = data.pickupDate ? new Date(data.pickupDate) : new Date();
            const endDate = data.dropoffDate ? new Date(data.dropoffDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

            // Cars use instant booking (skip owner approval)
            const bookingId = await createBooking({
                propertyId: car.id,
                propertyType: 'car',
                propertyTitle: `${car.make} ${car.model} (${car.year})`,
                propertyImage: car.images[0],
                travelerId: user!.id,
                travelerName: user!.name,
                travelerEmail: user!.email,
                ownerId: car.ownerId,
                startDate,
                endDate,
                guests: 1,
                totalPrice: data.total,
                currency: 'USD',
                isInstantBook: true, // Cars have instant booking
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
                    <Link href="/search?tab=cars" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 transition-colors">
                        <ChevronLeft size={20} />
                        Back to search
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium capitalize">{car.category}</span>
                        {car.insuranceIncluded && (
                            <span className="bg-success-100 text-success-700 px-3 py-1 rounded-full text-sm font-medium">Insurance Included</span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">{car.make} {car.model}</h1>
                    <p className="text-gray-600">{car.year} • {car.location}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-2 gap-4 h-96">
                    <div className="relative rounded-2xl overflow-hidden">
                        <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {car.images.slice(1, 5).map((img, idx) => (
                            <div key={idx} className="relative rounded-xl overflow-hidden">
                                <img src={img || car.images[0]} alt={`${car.make} ${car.model} ${idx + 2}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-6">Vehicle Specifications</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <Users size={28} className="text-primary-600 mx-auto mb-2" />
                                    <p className="font-semibold">{car.seats} Seats</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <DoorOpen size={28} className="text-primary-600 mx-auto mb-2" />
                                    <p className="font-semibold">{car.doors} Doors</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <Settings2 size={28} className="text-primary-600 mx-auto mb-2" />
                                    <p className="font-semibold capitalize">{car.transmission}</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <Fuel size={28} className="text-primary-600 mx-auto mb-2" />
                                    <p className="font-semibold capitalize">{car.fuelType}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-6">Features</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {car.features.map(feature => (
                                    <div key={feature} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <Check size={18} className="text-success-600" />
                                        <span className="text-sm font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-6">Rental Terms</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <Gauge size={24} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Mileage Limit</p>
                                        <p className="text-gray-600 text-sm">{car.mileageLimit}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <MapPin size={24} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Pick-up Location</p>
                                        <p className="text-gray-600 text-sm">{car.pickupLocation}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <Shield size={24} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Insurance</p>
                                        <p className="text-gray-600 text-sm">{car.insuranceIncluded ? 'Included in rental price' : 'Available as add-on'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <BookingWidget car={car} onRequestBooking={handleRequestBooking} isSubmitting={isSubmitting} />
                    </div>
                </div>
            </div>
        </div>
    );
}
