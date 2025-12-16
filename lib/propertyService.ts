// ==============================================
// TRIPZY - Property Service (Firebase Firestore)
// ==============================================

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Property, PropertyType, PropertyStatus, Hotel, Flight, Car } from '@/types';

// -------------------- Property Document Interface --------------------

export interface PropertyDocument {
    id: string;
    ownerId: string;
    ownerName?: string;
    ownerEmail?: string;
    type: PropertyType;
    title: string;
    description: string;
    price: number;
    currency: string;
    location: string;
    images: string[];
    rating: number;
    reviewCount: number;
    isAvailable: boolean;
    status: PropertyStatus;
    createdAt: Timestamp | Date;

    // Hotel-specific
    starRating?: 1 | 2 | 3 | 4 | 5;
    amenities?: string[];
    roomType?: string;
    maxGuests?: number;
    checkInTime?: string;
    checkOutTime?: string;
    address?: string;
    city?: string;
    country?: string;

    // Flight-specific
    airline?: string;
    flightNumber?: string;
    origin?: string;
    originCode?: string;
    destination?: string;
    destinationCode?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    cabinClass?: string;
    stops?: number;
    aircraft?: string;
    baggageAllowance?: string;

    // Car-specific
    make?: string;
    model?: string;
    year?: number;
    transmission?: string;
    fuelType?: string;
    seats?: number;
    doors?: number;
    category?: string;
    features?: string[];
    pickupLocation?: string;
    dropoffLocation?: string;
    mileageLimit?: string;
    insuranceIncluded?: boolean;
}

// -------------------- Create Property Input --------------------

export interface CreatePropertyData {
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    type: PropertyType;
    title: string;
    description: string;
    price: number;
    currency?: string;
    location: string;
    images: string[];

    // Hotel fields
    starRating?: 1 | 2 | 3 | 4 | 5;
    amenities?: string[];
    roomType?: string;
    maxGuests?: number;
    checkInTime?: string;
    checkOutTime?: string;
    address?: string;
    city?: string;
    country?: string;

    // Flight fields
    airline?: string;
    flightNumber?: string;
    origin?: string;
    originCode?: string;
    destination?: string;
    destinationCode?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    cabinClass?: string;
    stops?: number;
    aircraft?: string;
    baggageAllowance?: string;

    // Car fields
    make?: string;
    model?: string;
    year?: number;
    transmission?: string;
    fuelType?: string;
    seats?: number;
    doors?: number;
    category?: string;
    features?: string[];
    pickupLocation?: string;
    dropoffLocation?: string;
    mileageLimit?: string;
    insuranceIncluded?: boolean;
}

// -------------------- Create Property --------------------

export async function createProperty(data: CreatePropertyData): Promise<string> {
    const propertiesRef = collection(db, 'properties');

    const propertyData = {
        ...data,
        currency: data.currency || 'USD',
        rating: 0,
        reviewCount: 0,
        isAvailable: true,
        status: 'PENDING' as PropertyStatus, // Always PENDING for new properties
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(propertiesRef, propertyData);
    return docRef.id;
}

// -------------------- Get Owner Properties --------------------

export async function getOwnerProperties(ownerId: string): Promise<PropertyDocument[]> {
    const propertiesRef = collection(db, 'properties');
    const q = query(
        propertiesRef,
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as PropertyDocument));
}

// -------------------- Get All Properties (Admin) --------------------

export async function getAllProperties(): Promise<PropertyDocument[]> {
    const propertiesRef = collection(db, 'properties');
    const q = query(propertiesRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as PropertyDocument));
}

// -------------------- Get Approved Properties (Public) --------------------

export async function getApprovedProperties(): Promise<PropertyDocument[]> {
    const propertiesRef = collection(db, 'properties');
    const q = query(
        propertiesRef,
        where('status', '==', 'APPROVED'),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as PropertyDocument));
}

// -------------------- Update Property Status (Admin) --------------------

export async function updatePropertyStatus(
    propertyId: string,
    status: PropertyStatus
): Promise<void> {
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, { status });
}

// -------------------- Get Property by ID --------------------

export async function getPropertyById(propertyId: string): Promise<PropertyDocument | null> {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists()) {
        return null;
    }

    return {
        id: propertyDoc.id,
        ...propertyDoc.data()
    } as PropertyDocument;
}

// -------------------- Get Pending Properties (Admin) --------------------

export async function getPendingProperties(): Promise<PropertyDocument[]> {
    const propertiesRef = collection(db, 'properties');
    const q = query(
        propertiesRef,
        where('status', '==', 'PENDING'),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as PropertyDocument));
}

// -------------------- Status Helpers --------------------

export function getPropertyStatusInfo(status: PropertyStatus) {
    switch (status) {
        case 'PENDING':
            return {
                label: 'Pending Review',
                color: 'bg-warning-100 text-warning-700',
                description: 'Awaiting admin approval'
            };
        case 'APPROVED':
            return {
                label: 'Approved',
                color: 'bg-success-100 text-success-700',
                description: 'Listed and visible to travelers'
            };
        case 'REJECTED':
            return {
                label: 'Rejected',
                color: 'bg-error-100 text-error-700',
                description: 'Not approved for listing'
            };
        default:
            return {
                label: status,
                color: 'bg-gray-100 text-gray-700',
                description: ''
            };
    }
}
