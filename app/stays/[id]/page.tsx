'use client';

// ==============================================
// TRIPZY - Hotel/Stays Detail Page
// ==============================================

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Star,
    MapPin,
    Clock,
    Users,
    ChevronLeft,
    Wifi,
    Car,
    Waves,
    Utensils,
    Dumbbell,
    Wind,
    Tv,
    Coffee,
    Shield,
    Calendar,
    Minus,
    Plus,
    Heart,
    Share2,
    Check
} from 'lucide-react';
import { mockHotels } from '@/lib/mockData';
import { calculatePriceBreakdown } from '@/lib/searchUtils';
import { createBooking } from '@/lib/bookingService';
import { useAuthStore } from '@/hooks/useAuthStore';
import { toast } from '@/components/Toast';
import { Hotel } from '@/types';
import RoomTable, { RoomSelection } from '@/components/property/RoomTable';

// -------------------- Amenity Icon Mapping --------------------

const amenityIcons: Record<string, React.ReactNode> = {
    'Free WiFi': <Wifi size={20} />,
    'Pool': <Waves size={20} />,
    'Restaurant': <Utensils size={20} />,
    'Gym': <Dumbbell size={20} />,
    'Spa': <Wind size={20} />,
    'Room Service': <Coffee size={20} />,
    'Bar': <Coffee size={20} />,
    'Parking': <Car size={20} />,
    'Valet Parking': <Car size={20} />,
    'Beach Access': <Waves size={20} />,
    'Concierge': <Shield size={20} />,
    'Business Center': <Tv size={20} />,
};

// -------------------- Image Gallery --------------------

const ImageGallery = ({ images, title }: { images: string[]; title: string }) => {
    return (
        <div className="grid grid-cols-4 gap-3 h-[450px]">
            <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
                <img src={images[0]} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            {images.slice(1, 5).map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden group cursor-pointer">
                    <img src={img} alt={`${title} ${idx + 2}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {idx === 3 && images.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">+{images.length - 5} more</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// -------------------- Booking Data Interface --------------------

interface BookingFormData {
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    total: number;
}

// -------------------- Sticky Booking Widget --------------------

interface BookingWidgetProps {
    hotel: Hotel;
    onRequestBooking: (data: BookingFormData) => void;
    isSubmitting: boolean;
    isInstantBook?: boolean; // Hotels have instant booking
}

const BookingWidget = ({ hotel, onRequestBooking, isSubmitting, isInstantBook = false }: BookingWidgetProps) => {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);

    const nights = useMemo(() => {
        if (!checkIn || !checkOut) return 3;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    }, [checkIn, checkOut]);

    const priceBreakdown = calculatePriceBreakdown(hotel.price, nights);

    const handleSubmit = () => {
        onRequestBooking({ checkIn, checkOut, guests, nights, total: priceBreakdown.total });
    };

    return (
        <div className="card p-6 sticky top-24 shadow-xl border border-gray-100">
            {/* Instant Booking Badge */}
            {isInstantBook && (
                <div className="bg-success-50 border border-success-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <span className="text-sm font-medium text-success-700">Instant Confirmation</span>
                </div>
            )}

            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-gray-900">${hotel.price}</span>
                <span className="text-gray-500">/ night</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">CHECK-IN</label>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input-field pl-9 text-sm py-2.5" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">CHECK-OUT</label>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input-field pl-9 text-sm py-2.5" />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">GUESTS</label>
                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Users size={18} className="text-gray-400" />
                        <span className="text-sm">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50">
                            <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-medium">{guests}</span>
                        <button onClick={() => setGuests(Math.min(hotel.maxGuests, guests + 1))} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50">
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum {hotel.maxGuests} guests</p>
            </div>

            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary w-full py-4 text-lg font-semibold relative overflow-hidden disabled:opacity-70">
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isInstantBook ? 'Processing...' : 'Sending Request...'}
                    </span>
                ) : (
                    isInstantBook ? '⚡ Book Now' : 'Request to Book'
                )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-3">
                {isInstantBook ? 'Confirm your booking instantly' : "You won't be charged yet"}
            </p>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">${hotel.price} × {nights} nights</span>
                    <span className="font-medium">${priceBreakdown.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-medium">${priceBreakdown.serviceFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-medium">${priceBreakdown.taxes}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">${priceBreakdown.total}</span>
                </div>
            </div>
        </div>
    );
};

// -------------------- Main Page Component --------------------

export default function HotelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Room selection state
    const [selectedRooms, setSelectedRooms] = useState<RoomSelection[]>([]);
    const [roomTotal, setRoomTotal] = useState(0);
    const [nights, setNights] = useState(3); // Default 3 nights

    const hotel = useMemo(() => {
        return mockHotels.find(h => h.id === params.id);
    }, [params.id]);

    if (!hotel) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
                    <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
                    <Link href="/search?tab=stays" className="btn-primary">Browse Hotels</Link>
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
            const startDate = data.checkIn ? new Date(data.checkIn) : new Date();
            const endDate = data.checkOut ? new Date(data.checkOut) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

            // Hotels use instant booking (skip owner approval)
            // Creates booking with status 'AWAITING_PAYMENT' and redirects to checkout
            const bookingId = await createBooking({
                propertyId: hotel.id,
                propertyType: 'hotel',
                propertyTitle: hotel.title,
                propertyImage: hotel.images[0],
                travelerId: user!.id,
                travelerName: user!.name,
                travelerEmail: user!.email,
                ownerId: hotel.ownerId,
                startDate,
                endDate,
                guests: data.guests,
                totalPrice: data.total,
                currency: 'USD',
                isInstantBook: true, // Hotels have instant booking
            });

            // Redirect directly to checkout for instant booking
            toast.success('Booking Created!', 'Complete your payment to confirm.');
            router.push(`/checkout/${bookingId}`);
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Booking Failed', 'Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle room selection changes from RoomTable
    const handleRoomSelectionChange = (selections: RoomSelection[], total: number) => {
        setSelectedRooms(selections);
        setRoomTotal(total);
    };

    // Handle Reserve button click (with room selections)
    const handleRoomReserve = async () => {
        if (!isAuthenticated) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            router.push(`/login?returnUrl=${returnUrl}`);
            return;
        }

        if (selectedRooms.length === 0) {
            toast.error('No Rooms Selected', 'Please select at least one room.');
            return;
        }

        setIsSubmitting(true);

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + 1); // Tomorrow
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + nights);

            const totalGuests = selectedRooms.reduce((sum, r) => {
                const roomType = hotel.roomTypes?.find(rt => rt.id === r.roomId);
                return sum + (roomType?.capacity || 2) * r.quantity;
            }, 0);

            const bookingId = await createBooking({
                propertyId: hotel.id,
                propertyType: 'hotel',
                propertyTitle: hotel.title,
                propertyImage: hotel.images[0],
                travelerId: user!.id,
                travelerName: user!.name,
                travelerEmail: user!.email,
                ownerId: hotel.ownerId,
                startDate,
                endDate,
                guests: totalGuests,
                totalPrice: roomTotal,
                currency: 'USD',
                isInstantBook: true,
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
                    <Link href="/search?tab=stays" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 transition-colors">
                        <ChevronLeft size={20} />
                        Back to search
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {'★'.repeat(hotel.starRating)} Hotel
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">{hotel.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Star size={18} className="text-primary-600" fill="currentColor" />
                                    <span className="font-semibold">{hotel.rating}</span>
                                    <span className="text-gray-400">({hotel.reviewCount} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={18} />
                                    <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                <Share2 size={20} className="text-gray-600" />
                            </button>
                            <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                <Heart size={20} className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <ImageGallery images={hotel.images} title={hotel.title} />
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">About this property</h2>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1"><Users size={16} /> Up to {hotel.maxGuests} guests</span>
                                    <span className="flex items-center gap-1"><Clock size={16} /> {hotel.roomType}</span>
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
                        </div>

                        {/* Room Selection Table - Booking.com Style */}
                        {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                            <div className="space-y-4">
                                {/* Nights Selector */}
                                <div className="card p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={20} className="text-primary-600" />
                                        <span className="font-medium">Select your stay duration</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setNights(Math.max(1, nights - 1))}
                                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-20 text-center font-bold text-lg">{nights} night{nights > 1 ? 's' : ''}</span>
                                        <button
                                            onClick={() => setNights(Math.min(30, nights + 1))}
                                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Room Table */}
                                <RoomTable
                                    roomTypes={hotel.roomTypes}
                                    nights={nights}
                                    onSelectionChange={handleRoomSelectionChange}
                                />

                                {/* Reserve Button (appears when rooms selected) */}
                                {selectedRooms.length > 0 && (
                                    <div className="sticky bottom-4 z-50">
                                        <button
                                            onClick={handleRoomReserve}
                                            disabled={isSubmitting}
                                            className="w-full btn-primary py-4 text-lg font-semibold shadow-xl flex items-center justify-center gap-3 disabled:opacity-70"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Processing...
                                                </span>
                                            ) : (
                                                <>
                                                    <span>I'll Reserve</span>
                                                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                                        ${roomTotal.toLocaleString()}
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-6">Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {hotel.amenities.map(amenity => (
                                    <div key={amenity} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="text-primary-600">{amenityIcons[amenity] || <Check size={20} />}</div>
                                        <span className="text-sm font-medium">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-6">House Rules</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <Clock size={24} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Check-in</p>
                                        <p className="text-gray-600">{hotel.checkInTime}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <Clock size={24} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Check-out</p>
                                        <p className="text-gray-600">{hotel.checkOutTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-4">Location</h2>
                            <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin size={32} className="text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">Map placeholder</p>
                                    <p className="text-sm text-gray-400">{hotel.address}, {hotel.city}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <BookingWidget hotel={hotel} onRequestBooking={handleRequestBooking} isSubmitting={isSubmitting} isInstantBook={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}
