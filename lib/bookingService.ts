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

    // Modification workflow fields
    pendingModification?: {
        requestedAt: Timestamp;
        requestedBy: string;
        checkInTime?: string;
        checkOutTime?: string;
        specialRequests?: string;
        guests?: number;
        seatPreference?: string;
        mealPreference?: string;
        pickupTime?: string;
        dropoffTime?: string;
        previousValues: {
            checkInTime?: string;
            checkOutTime?: string;
            specialRequests?: string;
            guests?: number;
            seatPreference?: string;
            mealPreference?: string;
            pickupTime?: string;
            dropoffTime?: string;
        };
    };

    // Additional booking detail fields
    checkInTime?: string;
    checkOutTime?: string;
    seatPreference?: string;
    mealPreference?: string;
    pickupTime?: string;
    dropoffTime?: string;
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
        case 'PENDING_MODIFICATION':
            return {
                label: 'Modification Pending',
                color: 'text-orange-600',
                bgColor: 'bg-orange-100'
            };
        default:
            return {
                label: status,
                color: 'text-gray-600',
                bgColor: 'bg-gray-100'
            };
    }
}

// -------------------- Modification Types --------------------

export interface ModificationData {
    checkInTime?: string;
    checkOutTime?: string;
    specialRequests?: string;
    guests?: number;
    seatPreference?: string;
    mealPreference?: string;
    pickupTime?: string;
    dropoffTime?: string;
}

// -------------------- Check if Modification is Allowed --------------------

export function canModifyBooking(booking: BookingDocument): { allowed: boolean; reason?: string } {
    // Only CONFIRMED bookings can be modified
    if (booking.status !== 'CONFIRMED') {
        return { allowed: false, reason: 'Only confirmed bookings can be modified.' };
    }

    // Check if start date is at least 48 hours away
    const now = new Date();
    const startDate = booking.startDate.toDate();
    const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilStart < 48) {
        return { allowed: false, reason: 'Modifications must be made at least 48 hours before the booking start date.' };
    }

    return { allowed: true };
}

// -------------------- Request Modification (For Properties - Requires Approval) --------------------

export async function requestModification(
    bookingId: string,
    travelerId: string,
    modifications: ModificationData,
    currentValues: ModificationData
): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);

    await updateDoc(bookingRef, {
        status: 'PENDING_MODIFICATION',
        pendingModification: {
            requestedAt: serverTimestamp(),
            requestedBy: travelerId,
            ...modifications,
            previousValues: currentValues
        },
        updatedAt: serverTimestamp(),
    });
}

// -------------------- Apply Modification Instantly (For Flights/Cars) --------------------

export async function applyModificationInstantly(
    bookingId: string,
    modifications: ModificationData
): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);

    // Apply changes directly to the booking
    await updateDoc(bookingRef, {
        ...modifications,
        updatedAt: serverTimestamp(),
    });
}

// -------------------- Approve Modification (Owner) --------------------

export async function approveModification(bookingId: string, pendingModification: BookingDocument['pendingModification']): Promise<void> {
    if (!pendingModification) {
        throw new Error('No pending modification to approve');
    }

    const bookingRef = doc(db, 'bookings', bookingId);

    // Extract the modification values (exclude metadata)
    const { requestedAt, requestedBy, previousValues, ...modificationsToApply } = pendingModification;

    // Apply the pending changes to the main booking fields
    await updateDoc(bookingRef, {
        ...modificationsToApply,
        status: 'CONFIRMED',
        pendingModification: null, // Clear the pending modification
        updatedAt: serverTimestamp(),
    });
}

// -------------------- Reject Modification (Owner) --------------------

export async function rejectModification(bookingId: string): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);

    // Clear the pending modification and revert to CONFIRMED status
    await updateDoc(bookingRef, {
        status: 'CONFIRMED',
        pendingModification: null,
        updatedAt: serverTimestamp(),
    });
}
