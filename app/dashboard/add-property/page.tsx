'use client';

// ==============================================
// TRIPZY - Add Property Page (Owners Only)
// ==============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    Plane,
    Car,
    ArrowLeft,
    Loader2,
    ImagePlus,
    Check,
    Info
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { createProperty, CreatePropertyData } from '@/lib/propertyService';
import { PropertyType } from '@/types';
import { toast } from '@/components/Toast';

// -------------------- Property Type Card --------------------

interface TypeCardProps {
    type: PropertyType;
    icon: React.ElementType;
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

const TypeCard = ({ type, icon: Icon, title, description, isSelected, onClick }: TypeCardProps) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300'
            }`}
    >
        <Icon size={24} className={isSelected ? 'text-primary-600' : 'text-gray-400'} />
        <h4 className="font-semibold mt-2">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
    </button>
);

// -------------------- Random Unsplash Image --------------------

const getRandomUnsplashImage = (type: PropertyType): string => {
    const keywords = {
        hotel: ['hotel', 'resort', 'room', 'suite', 'bedroom'],
        flight: ['airplane', 'aircraft', 'airport', 'flight'],
        car: ['car', 'vehicle', 'automobile', 'driving']
    };
    const keyword = keywords[type][Math.floor(Math.random() * keywords[type].length)];
    return `https://source.unsplash.com/800x600/?${keyword}`;
};

// -------------------- Main Page --------------------

export default function AddPropertyPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [propertyType, setPropertyType] = useState<PropertyType>('hotel');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        imageUrl: '',
        // Hotel
        starRating: '4',
        amenities: '',
        roomType: '',
        maxGuests: '2',
        checkInTime: '14:00',
        checkOutTime: '11:00',
        address: '',
        city: '',
        country: '',
        // Flight
        airline: '',
        flightNumber: '',
        origin: '',
        originCode: '',
        destination: '',
        destinationCode: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        cabinClass: 'economy',
        stops: '0',
        aircraft: '',
        baggageAllowance: '',
        // Car
        make: '',
        model: '',
        year: new Date().getFullYear().toString(),
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: '5',
        doors: '4',
        category: 'midsize',
        features: '',
        pickupLocation: '',
        dropoffLocation: '',
        mileageLimit: '',
        insuranceIncluded: false as boolean
    });

    // Auth check - allow both owners and admins
    useEffect(() => {
        if (!authLoading && (!isAuthenticated || (user?.role !== 'owner' && user?.role !== 'admin'))) {
            router.push('/');
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Determine if user is admin (can add all types) or owner (stays only)
    const isAdmin = user?.role === 'admin';
    const isOwner = user?.role === 'owner';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Safety validation: Owners cannot add cars or flights
        if (isOwner && (propertyType === 'car' || propertyType === 'flight')) {
            toast.error('Permission Denied', 'Property owners can only list stays (apartments, villas, houses).');
            return;
        }

        setIsSubmitting(true);

        try {
            // Build property data based on type
            const imageUrl = formData.imageUrl || getRandomUnsplashImage(propertyType);

            const baseData: CreatePropertyData = {
                ownerId: user.id,
                ownerName: user.name || `${user.firstName} ${user.lastName}`.trim() || 'Unknown',
                ownerEmail: user.email,
                type: propertyType,
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                location: formData.location,
                images: [imageUrl],
                // Status based on role: Owners need approval, Admins auto-approve
                status: isOwner ? 'PENDING' : 'APPROVED',
            };

            let propertyData: CreatePropertyData = baseData;

            if (propertyType === 'hotel') {
                propertyData = {
                    ...baseData,
                    // Star Rating only for admins (hotels), owners don't set this
                    ...(isAdmin ? { starRating: parseInt(formData.starRating) as 1 | 2 | 3 | 4 | 5 } : {}),
                    amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
                    roomType: formData.roomType,
                    maxGuests: parseInt(formData.maxGuests),
                    checkInTime: formData.checkInTime,
                    checkOutTime: formData.checkOutTime,
                    address: formData.address,
                    city: formData.city,
                    country: formData.country,
                    // For owners: mark as residential stay requiring approval
                    ...(isOwner ? { isInstantBook: false, propertyCategory: formData.roomType } : {}),
                };
            } else if (propertyType === 'flight') {
                propertyData = {
                    ...baseData,
                    airline: formData.airline,
                    flightNumber: formData.flightNumber,
                    origin: formData.origin,
                    originCode: formData.originCode,
                    destination: formData.destination,
                    destinationCode: formData.destinationCode,
                    departureTime: formData.departureTime,
                    arrivalTime: formData.arrivalTime,
                    duration: formData.duration,
                    cabinClass: formData.cabinClass,
                    stops: parseInt(formData.stops),
                    aircraft: formData.aircraft,
                    baggageAllowance: formData.baggageAllowance,
                };
            } else if (propertyType === 'car') {
                propertyData = {
                    ...baseData,
                    make: formData.make,
                    model: formData.model,
                    year: parseInt(formData.year),
                    transmission: formData.transmission,
                    fuelType: formData.fuelType,
                    seats: parseInt(formData.seats),
                    doors: parseInt(formData.doors),
                    category: formData.category,
                    features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
                    pickupLocation: formData.pickupLocation,
                    dropoffLocation: formData.dropoffLocation || formData.pickupLocation,
                    mileageLimit: formData.mileageLimit,
                    insuranceIncluded: formData.insuranceIncluded,
                };
            }

            await createProperty(propertyData);

            toast.success(
                'Property Submitted!',
                'Your property has been submitted for review by the Admin.'
            );

            router.push('/dashboard');
        } catch (error) {
            console.error('Error creating property:', error);
            toast.error('Failed to create property. Please try again.');
        } finally {
            setIsSubmitting(false);
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
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 py-8">
                <div className="container mx-auto px-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-display font-bold text-white">
                        Add New Property
                    </h1>
                    <p className="text-white/80 mt-1">
                        List your property and start earning
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                    {/* Property Type Selection */}
                    <div className="card p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            Property Type
                            {isOwner && (
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    (Owners can only list stays)
                                </span>
                            )}
                        </h2>
                        <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
                            {/* Stay/Hotel - Always visible */}
                            <TypeCard
                                type="hotel"
                                icon={Building2}
                                title={isOwner ? 'Residential Stay' : 'Stay / Hotel'}
                                description={isOwner ? 'Apartment, Villa, House, Guest House' : 'Rooms, apartments, villas'}
                                isSelected={propertyType === 'hotel'}
                                onClick={() => setPropertyType('hotel')}
                            />
                            {/* Flight - Admin only */}
                            {isAdmin && (
                                <TypeCard
                                    type="flight"
                                    icon={Plane}
                                    title="Flight"
                                    description="Airline tickets"
                                    isSelected={propertyType === 'flight'}
                                    onClick={() => setPropertyType('flight')}
                                />
                            )}
                            {/* Car - Admin only */}
                            {isAdmin && (
                                <TypeCard
                                    type="car"
                                    icon={Car}
                                    title="Car Rental"
                                    description="Vehicles for rent"
                                    isSelected={propertyType === 'car'}
                                    onClick={() => setPropertyType('car')}
                                />
                            )}
                        </div>
                        {isOwner && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-blue-700">
                                    As a property owner, you can list residential stays such as apartments, villas, houses, and guest houses.
                                    Hotels, flights, and car rentals can only be added by administrators.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="card p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Luxury Beach Villa with Ocean View"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    placeholder="Describe your property..."
                                    className="input-field resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (USD) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        placeholder="0"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="City, Country"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL (optional)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://... (leave blank for random image)"
                                        className="input-field flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            imageUrl: getRandomUnsplashImage(propertyType)
                                        }))}
                                        className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                                    >
                                        <ImagePlus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hotel/Stay-specific Fields */}
                    {propertyType === 'hotel' && (
                        <div className="card p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4">
                                {isOwner ? 'Property Details' : 'Hotel Details'}
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Star Rating - Admin only */}
                                    {isAdmin && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Star Rating
                                            </label>
                                            <select
                                                name="starRating"
                                                value={formData.starRating}
                                                onChange={handleInputChange}
                                                className="input-field"
                                            >
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <option key={n} value={n}>{n} Star</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {/* Property Category - Owner only */}
                                    {isOwner && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Property Category *
                                            </label>
                                            <select
                                                name="roomType"
                                                value={formData.roomType}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                required
                                            >
                                                <option value="">Select category</option>
                                                <option value="Apartment">Apartment</option>
                                                <option value="Villa">Villa</option>
                                                <option value="House">House</option>
                                                <option value="Chalet">Chalet</option>
                                                <option value="Guest House">Guest House</option>
                                                <option value="Cottage">Cottage</option>
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {isOwner ? 'Unit Type' : 'Room Type'}
                                        </label>
                                        <input
                                            type="text"
                                            name={isOwner ? 'unitType' : 'roomType'}
                                            value={isOwner ? (formData as any).unitType || '' : formData.roomType}
                                            onChange={handleInputChange}
                                            placeholder={isOwner ? 'e.g., 2 Bedroom Suite' : 'e.g., Deluxe Suite'}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amenities (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="amenities"
                                        value={formData.amenities}
                                        onChange={handleInputChange}
                                        placeholder="WiFi, Pool, Gym, Parking"
                                        className="input-field"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Guests
                                        </label>
                                        <input
                                            type="number"
                                            name="maxGuests"
                                            value={formData.maxGuests}
                                            onChange={handleInputChange}
                                            min="1"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Check-in
                                        </label>
                                        <input
                                            type="time"
                                            name="checkInTime"
                                            value={formData.checkInTime}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Check-out
                                        </label>
                                        <input
                                            type="time"
                                            name="checkOutTime"
                                            value={formData.checkOutTime}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Flight-specific Fields */}
                    {propertyType === 'flight' && (
                        <div className="card p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4">Flight Details</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Airline
                                        </label>
                                        <input
                                            type="text"
                                            name="airline"
                                            value={formData.airline}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Emirates"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Flight Number
                                        </label>
                                        <input
                                            type="text"
                                            name="flightNumber"
                                            value={formData.flightNumber}
                                            onChange={handleInputChange}
                                            placeholder="e.g., EK 202"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Origin
                                        </label>
                                        <input
                                            type="text"
                                            name="origin"
                                            value={formData.origin}
                                            onChange={handleInputChange}
                                            placeholder="e.g., New York JFK"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Origin Code
                                        </label>
                                        <input
                                            type="text"
                                            name="originCode"
                                            value={formData.originCode}
                                            onChange={handleInputChange}
                                            placeholder="JFK"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Destination
                                        </label>
                                        <input
                                            type="text"
                                            name="destination"
                                            value={formData.destination}
                                            onChange={handleInputChange}
                                            placeholder="e.g., London Heathrow"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Destination Code
                                        </label>
                                        <input
                                            type="text"
                                            name="destinationCode"
                                            value={formData.destinationCode}
                                            onChange={handleInputChange}
                                            placeholder="LHR"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Departure Time
                                        </label>
                                        <input
                                            type="time"
                                            name="departureTime"
                                            value={formData.departureTime}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Arrival Time
                                        </label>
                                        <input
                                            type="time"
                                            name="arrivalTime"
                                            value={formData.arrivalTime}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duration
                                        </label>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 7h 30m"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cabin Class
                                        </label>
                                        <select
                                            name="cabinClass"
                                            value={formData.cabinClass}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="economy">Economy</option>
                                            <option value="premium_economy">Premium Economy</option>
                                            <option value="business">Business</option>
                                            <option value="first">First</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Stops
                                        </label>
                                        <input
                                            type="number"
                                            name="stops"
                                            value={formData.stops}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Aircraft
                                        </label>
                                        <input
                                            type="text"
                                            name="aircraft"
                                            value={formData.aircraft}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Boeing 777"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Car-specific Fields */}
                    {propertyType === 'car' && (
                        <div className="card p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4">Car Details</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Make
                                        </label>
                                        <input
                                            type="text"
                                            name="make"
                                            value={formData.make}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Toyota"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Model
                                        </label>
                                        <input
                                            type="text"
                                            name="model"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Camry"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Year
                                        </label>
                                        <input
                                            type="number"
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Transmission
                                        </label>
                                        <select
                                            name="transmission"
                                            value={formData.transmission}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="automatic">Automatic</option>
                                            <option value="manual">Manual</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fuel Type
                                        </label>
                                        <select
                                            name="fuelType"
                                            value={formData.fuelType}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="petrol">Petrol</option>
                                            <option value="diesel">Diesel</option>
                                            <option value="electric">Electric</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="economy">Economy</option>
                                            <option value="compact">Compact</option>
                                            <option value="midsize">Midsize</option>
                                            <option value="suv">SUV</option>
                                            <option value="luxury">Luxury</option>
                                            <option value="van">Van</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Seats
                                        </label>
                                        <input
                                            type="number"
                                            name="seats"
                                            value={formData.seats}
                                            onChange={handleInputChange}
                                            min="1"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Doors
                                        </label>
                                        <input
                                            type="number"
                                            name="doors"
                                            value={formData.doors}
                                            onChange={handleInputChange}
                                            min="2"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Features (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="features"
                                        value={formData.features}
                                        onChange={handleInputChange}
                                        placeholder="GPS, Bluetooth, Backup Camera"
                                        className="input-field"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pickup Location
                                        </label>
                                        <input
                                            type="text"
                                            name="pickupLocation"
                                            value={formData.pickupLocation}
                                            onChange={handleInputChange}
                                            placeholder="e.g., LAX Airport"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mileage Limit
                                        </label>
                                        <input
                                            type="text"
                                            name="mileageLimit"
                                            value={formData.mileageLimit}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Unlimited or 200 miles/day"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="insuranceIncluded"
                                        checked={formData.insuranceIncluded}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-primary-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Insurance Included</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Info Banner */}
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <Info size={20} className="text-primary-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-primary-900">Review Process</p>
                            <p className="text-sm text-primary-700">
                                Your property will be reviewed by an admin before it appears on the platform.
                                You'll be notified once it's approved.
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Check size={20} />
                                Submit Property
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
