// ==============================================
// TRIPZY - Booking Service (Firebase Firestore)
// ==============================================

import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Booking, BookingStatus, PropertyType } from '@/types';

// -------------------- Types --------------------

export interface CreateBookingData {
    propertyId: string;
    propertyType: PropertyType;
    propertyTitle: string;
    propertyImage: string;
    travelerId: string;
    travelerName: string;
    travelerEmail: string;
    ownerId: string;
    startDate: Date;
    endDate: Date;
    guests: number;
    totalPrice: number;
    currency: string;
    specialRequests?: string;
    isInstantBook?: boolean; // For hotels - skip owner approval
}

export interface BookingDocument {
    id: string;
    propertyId: string;
    propertyType: PropertyType;
    propertyTitle: string;
    propertyImage: string;
    travelerId: string;
    travelerName: string;
    travelerEmail: string;
    ownerId: string;
    status: BookingStatus;
    startDate: Timestamp;
    endDate: Timestamp;
    guests: number;
    totalPrice: number;
    currency: string;
    specialRequests?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export async function createBooking(data: CreateBookingData): Promise<string> {
    const bookingsRef = collection(db, 'bookings');

    // Determine initial status based on booking type
    // Hotels use instant booking (AWAITING_PAYMENT)
    // Other properties require owner approval (PENDING_APPROVAL)
    const initialStatus: BookingStatus = data.isInstantBook
        ? 'AWAITING_PAYMENT'
        : 'PENDING_APPROVAL';

    const bookingData = {
        ...data,
        status: initialStatus,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: Timestamp.fromDate(data.endDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(bookingsRef, bookingData);
    return docRef.id;
}

// -------------------- Get Bookings for Traveler --------------------

export async function getTravelerBookings(travelerId: string): Promise<BookingDocument[]> {
    const bookingsRef = collection(db, 'bookings');
    // Note: Using only where clause to avoid Firestore composite index requirement
    // Sorting is done client-side
    const q = query(
        bookingsRef,
        where('travelerId', '==', travelerId)
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as BookingDocument));

    // Sort client-side by createdAt descending
    return bookings.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
    });
}

// -------------------- Get Bookings for Owner --------------------

export async function getOwnerBookings(ownerId: string): Promise<BookingDocument[]> {
    const bookingsRef = collection(db, 'bookings');
    // Note: Using only where clause to avoid Firestore composite index requirement
    const q = query(
        bookingsRef,
        where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as BookingDocument));

    // Sort client-side by createdAt descending
    return bookings.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
    });
}

// -------------------- Update Booking Status --------------------

export async function updateBookingStatus(
    bookingId: string,
    status: BookingStatus
): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);

    await updateDoc(bookingRef, {
        status,
        updatedAt: serverTimestamp(),
    });
}

// -------------------- Approve Booking (Owner) --------------------

export async function approveBooking(bookingId: string): Promise<void> {
    await updateBookingStatus(bookingId, 'AWAITING_PAYMENT');
}

// -------------------- Reject Booking (Owner) --------------------

export async function rejectBooking(bookingId: string): Promise<void> {
    await updateBookingStatus(bookingId, 'CANCELLED');
}

// -------------------- Confirm Payment (Traveler) --------------------

export async function confirmPayment(bookingId: string): Promise<void> {
    await updateBookingStatus(bookingId, 'CONFIRMED');
}

// -------------------- Complete Booking --------------------

export async function completeBooking(bookingId: string): Promise<void> {
    await updateBookingStatus(bookingId, 'COMPLETED');
}

// -------------------- Helper: Format Date --------------------

export function formatBookingDate(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// -------------------- Helper: Get Status Badge Info --------------------

export function getStatusInfo(status: BookingStatus): {
    label: string;
    color: string;
    bgColor: string;
} {
    switch (status) {
        case 'PENDING_APPROVAL':
            return {
                label: 'Pending Approval',
                color: 'text-warning-600',
                bgColor: 'bg-warning-100'
            };
        case 'AWAITING_PAYMENT':
            return {
                label: 'Awaiting Payment',
                color: 'text-primary-600',
                bgColor: 'bg-primary-100'
            };
        case 'CONFIRMED':
            return {
                label: 'Confirmed',
                color: 'text-success-600',
                bgColor: 'bg-success-100'
            };
        case 'CANCELLED':
            return {
                label: 'Cancelled',
                color: 'text-error-600',
                bgColor: 'bg-error-100'
            };
        case 'COMPLETED':
            return {
                label: 'Completed',
                color: 'text-gray-600',
                bgColor: 'bg-gray-100'
            };
        default:
            return {
                label: status,
                color: 'text-gray-600',
                bgColor: 'bg-gray-100'
            };
    }
}
