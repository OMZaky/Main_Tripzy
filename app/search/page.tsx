'use client';

// ==============================================
// TRIPZY - Enhanced Search Results Page
// ==============================================

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
    Building2,
    Plane,
    Car,
    Star,
    MapPin,
    Users,
    Fuel,
    Settings2,
    ArrowRight,
    SlidersHorizontal,
    X,
    Wifi,
    Waves,
    Utensils
} from 'lucide-react';
import { Hotel, Flight, Car as CarType, SearchTab } from '@/types';
import { filterResults, parseSearchParams } from '@/lib/searchUtils';
import { SearchResultsSkeleton } from '@/components/Skeletons';

// -------------------- Hotel Card (Grid - Image Focused) --------------------

const HotelCard = ({ hotel }: { hotel: Hotel }) => (
    <Link href={`/stays/${hotel.id}`} className="block">
        <div className="card overflow-hidden hover-lift group cursor-pointer">
            <div className="relative h-52 overflow-hidden">
                <img
                    src={hotel.images[0]}
                    alt={hotel.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                        {'★'.repeat(hotel.starRating)}
                    </span>
                    {/* Instant Booking Badge */}
                    <span className="bg-success-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
                        ⚡ Instant
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <div className="bg-primary-600 text-white px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                        <Star size={12} fill="white" />
                        {hotel.rating}
                    </div>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-5">
                <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary-600 transition-colors">
                    {hotel.title}
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin size={14} />
                    {hotel.city}, {hotel.country}
                </div>

                {/* Amenity Icons */}
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                    {hotel.amenities.includes('Free WiFi') && <Wifi size={16} />}
                    {hotel.amenities.includes('Pool') && <Waves size={16} />}
                    {hotel.amenities.includes('Restaurant') && <Utensils size={16} />}
                    <span className="text-xs text-gray-500">+{Math.max(0, hotel.amenities.length - 3)} more</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <span className="text-2xl font-bold text-primary-600">${hotel.price}</span>
                        <span className="text-gray-500 text-sm"> / night</span>
                    </div>
                    <span className="text-sm text-gray-500">{hotel.reviewCount} reviews</span>
                </div>
            </div>
        </div>
    </Link>
);

// -------------------- Flight Card (Ticket Style - Horizontal) --------------------

const FlightCard = ({ flight }: { flight: Flight }) => (
    <Link href={`/flights/${flight.id}`} className="block">
        <div className="card overflow-hidden hover-lift group cursor-pointer">
            {/* Ticket-style layout */}
            <div className="flex">
                {/* Left section - Airline info */}
                <div className="w-40 bg-gradient-to-br from-primary-50 to-primary-100 p-5 flex flex-col items-center justify-center border-r border-dashed border-primary-200">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">
                        <Plane size={28} className="text-primary-600" />
                    </div>
                    <h4 className="font-semibold text-center text-sm">{flight.airline}</h4>
                    <p className="text-xs text-gray-500">{flight.flightNumber}</p>
                </div>

                {/* Right section - Flight details */}
                <div className="flex-1 p-5">
                    {/* Route */}
                    <div className="flex items-center justify-between mb-4">
                        {/* Departure */}
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{flight.departureTime}</p>
                            <p className="text-lg font-semibold text-primary-600">{flight.originCode}</p>
                            <p className="text-xs text-gray-500 max-w-[100px] truncate">{flight.origin}</p>
                        </div>

                        {/* Flight path visualization */}
                        <div className="flex-1 px-6">
                            <div className="relative flex items-center">
                                <div className="w-3 h-3 rounded-full bg-primary-600" />
                                <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2 relative">
                                    <Plane size={16} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600 rotate-90" />
                                </div>
                                <div className="w-3 h-3 rounded-full bg-primary-600" />
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-xs font-medium text-gray-600">{flight.duration}</p>
                                <p className="text-xs text-gray-400">
                                    {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                </p>
                            </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{flight.arrivalTime}</p>
                            <p className="text-lg font-semibold text-primary-600">{flight.destinationCode}</p>
                            <p className="text-xs text-gray-500 max-w-[100px] truncate">{flight.destination}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                            <span className={`badge text-xs ${flight.cabinClass === 'economy' ? 'bg-gray-100 text-gray-700' :
                                flight.cabinClass === 'business' ? 'bg-primary-100 text-primary-700' :
                                    flight.cabinClass === 'first' ? 'bg-accent-100 text-accent-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {flight.cabinClass.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-xs text-gray-500">{flight.aircraft}</span>
                            {/* Instant Booking Badge */}
                            <span className="bg-success-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                ⚡ Instant
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-primary-600">${flight.price}</span>
                            <span className="text-gray-500 text-sm"> / person</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Link>
);

// -------------------- Car Card (Grid View) --------------------

const CarCard = ({ car }: { car: CarType }) => (
    <Link href={`/cars/${car.id}`} className="block">
        <div className="card overflow-hidden hover-lift group cursor-pointer">
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                <img
                    src={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium capitalize shadow-sm">
                        {car.category}
                    </span>
                    {/* Instant Booking Badge */}
                    <span className="bg-success-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                        ⚡ Instant
                    </span>
                </div>
                {car.insuranceIncluded && (
                    <div className="absolute top-3 right-3">
                        <span className="bg-success-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                            Insurance Included
                        </span>
                    </div>
                )}
            </div>
            <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary-600 transition-colors">
                        {car.make} {car.model}
                    </h3>
                    <div className="flex items-center gap-1 text-primary-600">
                        <Star size={14} fill="currentColor" />
                        <span className="font-semibold text-sm">{car.rating}</span>
                    </div>
                </div>
                <p className="text-gray-500 text-sm mb-4">{car.year}</p>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-3 mb-4 py-3 bg-gray-50 rounded-xl px-3">
                    <div className="flex flex-col items-center text-center">
                        <Users size={18} className="text-gray-400 mb-1" />
                        <span className="text-sm font-medium">{car.seats}</span>
                        <span className="text-xs text-gray-500">Seats</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <Settings2 size={18} className="text-gray-400 mb-1" />
                        <span className="text-sm font-medium capitalize">{car.transmission.slice(0, 4)}</span>
                        <span className="text-xs text-gray-500">Trans.</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <Fuel size={18} className="text-gray-400 mb-1" />
                        <span className="text-sm font-medium capitalize">{car.fuelType}</span>
                        <span className="text-xs text-gray-500">Fuel</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                    <MapPin size={14} />
                    {car.pickupLocation}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <span className="text-2xl font-bold text-primary-600">${car.price}</span>
                        <span className="text-gray-500 text-sm"> / day</span>
                    </div>
                    <span className="text-xs text-gray-500">{car.mileageLimit}</span>
                </div>
            </div>
        </div>
    </Link>
);

// -------------------- Filter Sidebar --------------------

interface FilterSidebarProps {
    tab: SearchTab;
    isOpen: boolean;
    onClose: () => void;
}

const FilterSidebar = ({ tab, isOpen, onClose }: FilterSidebarProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
            <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl lg:relative lg:shadow-none lg:w-full p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6 lg:hidden">
                    <h3 className="font-semibold text-lg">Filters</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <div className="flex gap-3">
                        <input type="number" placeholder="Min" className="input-field text-sm py-2" />
                        <input type="number" placeholder="Max" className="input-field text-sm py-2" />
                    </div>
                </div>

                {/* Star Rating (for hotels) */}
                {tab === 'stays' && (
                    <div className="mb-6">
                        <h4 className="font-medium mb-3">Star Rating</h4>
                        <div className="flex gap-2">
                            {[5, 4, 3, 2, 1].map(stars => (
                                <button
                                    key={stars}
                                    className="flex-1 py-2 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-sm"
                                >
                                    {stars}★
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cabin Class (for flights) */}
                {tab === 'flights' && (
                    <div className="mb-6">
                        <h4 className="font-medium mb-3">Cabin Class</h4>
                        <div className="space-y-2">
                            {['Economy', 'Premium Economy', 'Business', 'First'].map(cabin => (
                                <label key={cabin} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                                    <span className="text-sm">{cabin}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Car Type (for cars) */}
                {tab === 'cars' && (
                    <div className="mb-6">
                        <h4 className="font-medium mb-3">Car Type</h4>
                        <div className="space-y-2">
                            {['Economy', 'Compact', 'Midsize', 'SUV', 'Luxury', 'Van'].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                                    <span className="text-sm">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <button className="btn-primary w-full mt-4">Apply Filters</button>
            </div>
        </div>
    );
};

// -------------------- Search Results Content --------------------

function SearchContent() {
    const searchParams = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const filters = useMemo(() => parseSearchParams(searchParams), [searchParams]);
    const results = useMemo(() => filterResults(filters), [filters]);

    // Simulate loading delay
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [searchParams]);

    const getSearchTitle = () => {
        if (filters.tab === 'stays') {
            return filters.location ? `Hotels in ${filters.location}` : 'All Hotels';
        }
        if (filters.tab === 'flights') {
            if (filters.origin && filters.destination) {
                return `Flights from ${filters.origin} to ${filters.destination}`;
            }
            return 'All Flights';
        }
        return filters.pickupLocation ? `Cars in ${filters.pickupLocation}` : 'All Car Rentals';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-hero-pattern py-10">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                        {getSearchTitle()}
                    </h1>
                    <p className="text-white/80">
                        {results.length} {filters.tab === 'stays' ? 'properties' : filters.tab === 'flights' ? 'flights' : 'cars'} found
                    </p>
                </div>
            </div>

            {/* Tab Filters */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex gap-2">
                            <Link
                                href={`/search?tab=stays`}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${filters.tab === 'stays'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Building2 size={18} />
                                Stays
                            </Link>
                            <Link
                                href={`/search?tab=flights`}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${filters.tab === 'flights'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Plane size={18} />
                                Flights
                            </Link>
                            <Link
                                href={`/search?tab=cars`}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${filters.tab === 'cars'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Car size={18} />
                                Cars
                            </Link>
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <SlidersHorizontal size={18} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Desktop Filters */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="card p-5 sticky top-32">
                            <h3 className="font-semibold mb-4">Filters</h3>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h4 className="font-medium text-sm mb-3">Price Range</h4>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Min" className="input-field text-sm py-2" />
                                    <input type="number" placeholder="Max" className="input-field text-sm py-2" />
                                </div>
                            </div>

                            {filters.tab === 'stays' && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-sm mb-3">Star Rating</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {[5, 4, 3, 2, 1].map(stars => (
                                            <button
                                                key={stars}
                                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-sm"
                                            >
                                                {stars}★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button className="btn-primary w-full text-sm py-2.5">Apply</button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex-1">
                        {isLoading ? (
                            <SearchResultsSkeleton type={filters.tab} />
                        ) : results.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {filters.tab === 'stays' ? <Building2 size={32} className="text-gray-400" /> :
                                        filters.tab === 'flights' ? <Plane size={32} className="text-gray-400" /> :
                                            <Car size={32} className="text-gray-400" />}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                                <p className="text-gray-500">Try adjusting your search criteria</p>
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${filters.tab === 'flights'
                                ? 'grid-cols-1'
                                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                                }`}>
                                {filters.tab === 'stays' && (results as Hotel[]).map(hotel => (
                                    <HotelCard key={hotel.id} hotel={hotel} />
                                ))}
                                {filters.tab === 'flights' && (results as Flight[]).map(flight => (
                                    <FlightCard key={flight.id} flight={flight} />
                                ))}
                                {filters.tab === 'cars' && (results as CarType[]).map(car => (
                                    <CarCard key={car.id} car={car} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Sidebar */}
            <FilterSidebar
                tab={filters.tab}
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            />
        </div>
    );
}

// -------------------- Main Page with Suspense --------------------

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50">
                <div className="bg-hero-pattern py-10">
                    <div className="container mx-auto px-4">
                        <div className="h-10 bg-white/20 rounded w-64 mb-2 animate-pulse" />
                        <div className="h-5 bg-white/20 rounded w-32 animate-pulse" />
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <SearchResultsSkeleton type="stays" />
                </div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
