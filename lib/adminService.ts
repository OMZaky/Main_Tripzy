// ==============================================
// TRIPZY - Admin Service (Firebase Firestore)
// ==============================================

import {
    collection,
    getDocs,
    updateDoc,
    doc
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from '@/types';
import { BookingDocument } from './bookingService';

// -------------------- Get All Users --------------------

export async function getAllUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as User));

    // Sort client-side by createdAt descending
    return users.sort((a, b) => {
        const aTime = (a as any).createdAt?.toMillis?.() || 0;
        const bTime = (b as any).createdAt?.toMillis?.() || 0;
        return bTime - aTime;
    });
}

// -------------------- Toggle User Suspension --------------------

export async function toggleUserSuspension(userId: string, suspended: boolean): Promise<void> {
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
        suspended,
    });
}

// -------------------- Get All Bookings (for stats) --------------------

export async function getAllBookings(): Promise<BookingDocument[]> {
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
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

// -------------------- Get Platform Stats --------------------

export interface PlatformStats {
    totalRevenue: number;
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalUsers: number;
    travelers: number;
    owners: number;
    admins: number;
    suspendedUsers: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
    // Fetch all users
    const users = await getAllUsers();

    // Fetch all bookings
    const bookings = await getAllBookings();

    // Calculate stats
    const totalRevenue = bookings
        .filter(b => b.status === 'CONFIRMED')
        .reduce((sum, b) => sum + b.totalPrice, 0);

    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING_APPROVAL').length;

    return {
        totalRevenue,
        totalBookings: bookings.length,
        confirmedBookings,
        pendingBookings,
        totalUsers: users.length,
        travelers: users.filter(u => u.role === 'traveler').length,
        owners: users.filter(u => u.role === 'owner').length,
        admins: users.filter(u => u.role === 'admin').length,
        suspendedUsers: users.filter(u => u.suspended === true).length,
    };
}
