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

    if (filters.location) {
        const query = filters.location.toLowerCase();
        results = results.filter(h =>
            h.location.toLowerCase().includes(query) ||
            h.city.toLowerCase().includes(query) ||
            h.country.toLowerCase().includes(query) ||
            h.title.toLowerCase().includes(query)
        );
    }

    if (filters.minPrice !== undefined) {
        results = results.filter(h => h.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
        results = results.filter(h => h.price <= filters.maxPrice!);
    }

    if (filters.minRating !== undefined) {
        results = results.filter(h => h.rating >= filters.minRating!);
    }

    if (filters.starRating !== undefined) {
        results = results.filter(h => h.starRating >= filters.starRating!);
    }

    if (filters.guests !== undefined) {
        results = results.filter(h => h.maxGuests >= filters.guests!);
    }

    return results;
}

// -------------------- Filter Flights --------------------

export function filterFlights(filters: SearchFilters): Flight[] {
    // SECURITY: Only show APPROVED properties to users
    let results = mockFlights.filter(f => f.status === 'APPROVED');

    if (filters.origin) {
        const query = filters.origin.toLowerCase();
        results = results.filter(f =>
            f.origin.toLowerCase().includes(query) ||
            f.originCode.toLowerCase().includes(query)
        );
    }

    if (filters.destination) {
        const query = filters.destination.toLowerCase();
        results = results.filter(f =>
            f.destination.toLowerCase().includes(query) ||
            f.destinationCode.toLowerCase().includes(query)
        );
    }

    if (filters.cabinClass) {
        results = results.filter(f => f.cabinClass === filters.cabinClass);
    }

    if (filters.maxStops !== undefined) {
        results = results.filter(f => f.stops <= filters.maxStops!);
    }

    if (filters.minPrice !== undefined) {
        results = results.filter(f => f.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
        results = results.filter(f => f.price <= filters.maxPrice!);
    }

    return results;
}

// -------------------- Filter Cars --------------------

export function filterCars(filters: SearchFilters): Car[] {
    // SECURITY: Only show APPROVED properties to users
    let results = mockCars.filter(c => c.status === 'APPROVED');

    if (filters.pickupLocation) {
        const query = filters.pickupLocation.toLowerCase();
        results = results.filter(c =>
            c.pickupLocation.toLowerCase().includes(query) ||
            c.location.toLowerCase().includes(query)
        );
    }

    if (filters.category) {
        results = results.filter(c => c.category === filters.category);
    }

    if (filters.transmission) {
        results = results.filter(c => c.transmission === filters.transmission);
    }

    if (filters.fuelType) {
        results = results.filter(c => c.fuelType === filters.fuelType);
    }

    if (filters.minPrice !== undefined) {
        results = results.filter(c => c.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
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

export function parseSearchParams(searchParams: URLSearchParams): SearchFilters {
    const tab = (searchParams.get('tab') || 'stays') as SearchTab;

    return {
        tab,
        // Stays
        location: searchParams.get('location') || undefined,
        minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
        maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
        minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
        starRating: searchParams.get('starRating') ? parseInt(searchParams.get('starRating')!) : undefined,
        guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
        // Flights
        origin: searchParams.get('origin') || undefined,
        destination: searchParams.get('destination') || undefined,
        cabinClass: searchParams.get('cabin') || undefined,
        maxStops: searchParams.get('maxStops') ? parseInt(searchParams.get('maxStops')!) : undefined,
        // Cars
        pickupLocation: searchParams.get('pickup') || undefined,
        category: searchParams.get('category') || undefined,
        transmission: searchParams.get('transmission') || undefined,
        fuelType: searchParams.get('fuelType') || undefined,
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
