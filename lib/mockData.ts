// ==============================================
// TRIPZY - Mock Data (Generated from Data Engine)
// ==============================================

import { Hotel, Flight, Car, Property } from '@/types';
import {
    generateAllHotels,
    generateAllFlights,
    generateAllCars
} from './data/generators';

// -------------------- Generate Massive Data Arrays --------------------

// Generate all data on module load
// This creates:
// - 250+ Hotels (10-15 per city x 24 cities)
// - 100 Flights (connecting major routes)
// - 200+ Cars (8-12 per city x 24 cities)

export const mockHotels: Hotel[] = generateAllHotels();
export const mockFlights: Flight[] = generateAllFlights();
export const mockCars: Car[] = generateAllCars();

// -------------------- Combined Properties --------------------

export const allProperties: Property[] = [...mockHotels, ...mockFlights, ...mockCars];

// -------------------- Helper Functions --------------------

export const getPropertyById = (id: string): Property | undefined => {
    return allProperties.find(property => property.id === id);
};

export const getPropertiesByType = (type: 'hotel' | 'flight' | 'car'): Property[] => {
    return allProperties.filter(property => property.type === type);
};

export const getPropertiesByOwner = (ownerId: string): Property[] => {
    return allProperties.filter(property => property.ownerId === ownerId);
};

export const searchProperties = (query: string, type?: 'hotel' | 'flight' | 'car'): Property[] => {
    const lowerQuery = query.toLowerCase();
    let results = allProperties.filter(property =>
        property.title.toLowerCase().includes(lowerQuery) ||
        property.location.toLowerCase().includes(lowerQuery) ||
        property.description.toLowerCase().includes(lowerQuery)
    );

    if (type) {
        results = results.filter(property => property.type === type);
    }

    // Only return APPROVED properties
    results = results.filter(property => property.status === 'APPROVED');

    return results;
};

// -------------------- Stats for Development --------------------

console.log(`[Tripzy Data Engine] Generated:`);
console.log(`  - ${mockHotels.length} Hotels`);
console.log(`  - ${mockFlights.length} Flights`);
console.log(`  - ${mockCars.length} Cars`);
console.log(`  - ${allProperties.length} Total Properties`);
