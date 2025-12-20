// ==============================================
// TRIPZY - Search Utilities
// ==============================================

import { Hotel, Flight, Car, Property, SearchTab } from '@/types';
import { mockHotels, mockFlights, mockCars } from './mockData';

// -------------------- Filter Parameters --------------------

export interface SearchFilters {
    tab: SearchTab;
    // Stays filters
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    starRating?: number;
    guests?: number;
    // Flights filters
    origin?: string;
    destination?: string;
    cabinClass?: string;
    maxStops?: number;
    // Cars filters
    pickupLocation?: string;
    category?: string;
    transmission?: string;
    fuelType?: string;
}

// -------------------- Filter Hotels --------------------

export function filterHotels(filters: SearchFilters): Hotel[] {
    // SECURITY: Only show APPROVED properties to users
    let results = mockHotels.filter(h => h.status === 'APPROVED');

    // Location filter - case-insensitive with trimming
    if (filters.location) {
        const query = filters.location.toLowerCase().trim();
        if (query.length > 0) {
            results = results.filter(h =>
                h.location.toLowerCase().trim().includes(query) ||
                h.city.toLowerCase().trim().includes(query) ||
                h.country.toLowerCase().trim().includes(query) ||
                h.title.toLowerCase().trim().includes(query)
            );
        }
    }

    // Price filters - ensure number comparison
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
        results = results.filter(h => h.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        results = results.filter(h => h.price <= filters.maxPrice!);
    }

    if (filters.minRating !== undefined && filters.minRating > 0) {
        results = results.filter(h => h.rating >= filters.minRating!);
    }

    if (filters.starRating !== undefined && filters.starRating > 0) {
        results = results.filter(h => h.starRating >= filters.starRating!);
    }

    if (filters.guests !== undefined && filters.guests > 0) {
        results = results.filter(h => h.maxGuests >= filters.guests!);
    }

    return results;
}

// -------------------- Filter Flights --------------------

export function filterFlights(filters: SearchFilters): Flight[] {
    // SECURITY: Only show APPROVED properties to users
    let results = mockFlights.filter(f => f.status === 'APPROVED');

    // Origin filter - case-insensitive with trimming
    if (filters.origin) {
        const query = filters.origin.toLowerCase().trim();
        if (query.length > 0) {
            results = results.filter(f =>
                f.origin.toLowerCase().trim().includes(query) ||
                f.originCode.toLowerCase().trim().includes(query)
            );
        }
    }

    // Destination filter - case-insensitive with trimming
    if (filters.destination) {
        const query = filters.destination.toLowerCase().trim();
        if (query.length > 0) {
            results = results.filter(f =>
                f.destination.toLowerCase().trim().includes(query) ||
                f.destinationCode.toLowerCase().trim().includes(query)
            );
        }
    }

    // Cabin class - case-insensitive comparison
    if (filters.cabinClass) {
        const query = filters.cabinClass.toLowerCase().trim();
        if (query.length > 0) {
            results = results.filter(f => f.cabinClass.toLowerCase() === query);
        }
    }

    if (filters.maxStops !== undefined && filters.maxStops >= 0) {
        results = results.filter(f => f.stops <= filters.maxStops!);
    }

    if (filters.minPrice !== undefined && filters.minPrice > 0) {
        results = results.filter(f => f.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        results = results.filter(f => f.price <= filters.maxPrice!);
    }

    return results;
}

// -------------------- Filter Cars --------------------

export function filterCars(filters: SearchFilters): Car[] {
    // SECURITY: Only show APPROVED properties to users
    let results = mockCars.filter(c => c.status === 'APPROVED');

    // Pickup location filter - case-insensitive with trimming
    if (filters.pickupLocation) {
        const query = filters.pickupLocation.toLowerCase().trim();
        if (query.length > 0) {
            results = results.filter(c =>
                c.pickupLocation.toLowerCase().trim().includes(query) ||
                c.location.toLowerCase().trim().includes(query)
            );
        }
    }

    // Category - case-insensitive comparison
    if (filters.category) {
        const query = filters.category.toLowerCase().trim();
        if (query.length > 0) {
            results = results.filter(c => c.category.toLowerCase() === query);
        }
    }

    // Transmission - case-insensitive comparison
    if (filters.transmission) {
        const query = filters.transmission.toLowerCase().trim();
        if (query.length > 0) {
            results = results.filter(c => c.transmission.toLowerCase() === query);
        }
    }

    // Fuel type - case-insensitive comparison
    if (filters.fuelType) {
        const query = filters.fuelType.toLowerCase().trim();
        if (query.length > 0) {
            results = results.filter(c => c.fuelType.toLowerCase() === query);
        }
    }

    if (filters.minPrice !== undefined && filters.minPrice > 0) {
        results = results.filter(c => c.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        results = results.filter(c => c.price <= filters.maxPrice!);
    }

    return results;
}

// -------------------- Main Filter Function --------------------

export function filterResults(filters: SearchFilters): Property[] {
    switch (filters.tab) {
        case 'stays':
            return filterHotels(filters);
        case 'flights':
            return filterFlights(filters);
        case 'cars':
            return filterCars(filters);
        default:
            return [];
    }
}

// -------------------- Parse URL Search Params --------------------

// Helper to safely get and trim search param
function getParam(searchParams: URLSearchParams, key: string): string | undefined {
    const value = searchParams.get(key);
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

// Helper to safely parse integer
function getIntParam(searchParams: URLSearchParams, key: string): number | undefined {
    const value = getParam(searchParams, key);
    if (!value) return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
}

// Helper to safely parse float
function getFloatParam(searchParams: URLSearchParams, key: string): number | undefined {
    const value = getParam(searchParams, key);
    if (!value) return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
}

export function parseSearchParams(searchParams: URLSearchParams): SearchFilters {
    const tabParam = getParam(searchParams, 'tab');
    const tab = (tabParam === 'stays' || tabParam === 'flights' || tabParam === 'cars'
        ? tabParam
        : 'stays') as SearchTab;

    return {
        tab,
        // Stays - normalize location for matching
        location: getParam(searchParams, 'location'),
        minPrice: getIntParam(searchParams, 'minPrice'),
        maxPrice: getIntParam(searchParams, 'maxPrice'),
        minRating: getFloatParam(searchParams, 'minRating'),
        starRating: getIntParam(searchParams, 'starRating'),
        guests: getIntParam(searchParams, 'guests'),
        // Flights
        origin: getParam(searchParams, 'origin'),
        destination: getParam(searchParams, 'destination'),
        cabinClass: getParam(searchParams, 'cabin'),
        maxStops: getIntParam(searchParams, 'maxStops'),
        // Cars
        pickupLocation: getParam(searchParams, 'pickup'),
        category: getParam(searchParams, 'category'),
        transmission: getParam(searchParams, 'transmission'),
        fuelType: getParam(searchParams, 'fuelType'),
    };
}

// -------------------- Get Property By ID --------------------

export function getPropertyById(type: string, id: string): Property | null {
    switch (type) {
        case 'stays':
        case 'hotel':
            return mockHotels.find(h => h.id === id) || null;
        case 'flights':
        case 'flight':
            return mockFlights.find(f => f.id === id) || null;
        case 'cars':
        case 'car':
            return mockCars.find(c => c.id === id) || null;
        default:
            return null;
    }
}

// -------------------- Calculate Booking Price --------------------

export interface PriceBreakdown {
    basePrice: number;
    nights: number;
    subtotal: number;
    serviceFee: number;
    taxes: number;
    total: number;
}

export function calculatePriceBreakdown(
    pricePerUnit: number,
    units: number,
    feePercentage: number = 0.12,
    taxPercentage: number = 0.08
): PriceBreakdown {
    const subtotal = pricePerUnit * units;
    const serviceFee = Math.round(subtotal * feePercentage);
    const taxes = Math.round(subtotal * taxPercentage);
    const total = subtotal + serviceFee + taxes;

    return {
        basePrice: pricePerUnit,
        nights: units,
        subtotal,
        serviceFee,
        taxes,
        total,
    };
}
