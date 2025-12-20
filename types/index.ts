// ==============================================
// TRIPZY - Core TypeScript Types
// ==============================================

// -------------------- User Types --------------------

export type UserRole = 'traveler' | 'owner' | 'admin';
export type Gender = 'male' | 'female' | 'other';
export type Currency = 'USD' | 'EUR' | 'EGP';

export interface User {
    // Core Identity
    id: string;
    email: string;
    role: UserRole;

    // Personal Info
    username: string;           // Unique handle (e.g., @traveler_joe)
    firstName: string;
    lastName: string;
    dateOfBirth?: string;       // YYYY-MM-DD (for age calculation)
    gender?: Gender;            // Required for flights/passport match
    avatarUrl?: string;

    // Contact & Location
    phoneNumber?: string;
    address?: string;
    country?: string;
    city?: string;

    // Preferences
    currency: Currency;

    // Account Status
    suspended?: boolean;
    createdAt: Date;

    // Legacy compatibility
    name?: string;              // Deprecated: use firstName + lastName
    phone?: string;             // Deprecated: use phoneNumber

    // Profile completion (for Google sign-in users)
    isProfileComplete?: boolean;
}

// Helper to get display name
export function getUserDisplayName(user: User): string {
    if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.username || user.email.split('@')[0];
}


// -------------------- Property Types --------------------

export type PropertyType = 'hotel' | 'flight' | 'car';
export type PropertyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Room type for hotels (Booking.com style)
export interface RoomType {
    id: string;
    name: string;           // e.g., "Deluxe Double Room", "King Suite"
    price: number;          // Price per night
    capacity: number;       // Max guests (e.g., 2)
    bedType: string;        // e.g., "1 large double bed"
    available: number;      // Inventory count
    amenities: string[];    // e.g., ["Free cancellation", "Breakfast included"]
    size?: number;          // Room size in sqm
}

export interface BaseProperty {
    id: string;
    ownerId: string;
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
    createdAt: Date;
}

// Hotel-specific properties
export interface Hotel extends BaseProperty {
    type: 'hotel';
    starRating: 1 | 2 | 3 | 4 | 5;
    amenities: string[];
    roomType: string;          // Legacy single room type
    roomTypes?: RoomType[];    // NEW: Multiple room types for booking table
    maxGuests: number;
    checkInTime: string;
    checkOutTime: string;
    address: string;
    city: string;
    country: string;
}

// Flight-specific properties
export interface Flight extends BaseProperty {
    type: 'flight';
    airline: string;
    airlineLogo: string;
    flightNumber: string;
    origin: string;
    originCode: string;
    destination: string;
    destinationCode: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
    stops: number;
    aircraft: string;
    baggageAllowance: string;
}

// Car rental-specific properties
export interface Car extends BaseProperty {
    type: 'car';
    make: string;
    model: string;
    year: number;
    transmission: 'automatic' | 'manual';
    fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    seats: number;
    doors: number;
    category: 'economy' | 'compact' | 'midsize' | 'suv' | 'luxury' | 'van';
    features: string[];
    pickupLocation: string;
    dropoffLocation: string;
    mileageLimit: string;
    insuranceIncluded: boolean;
}

// Union type for all properties
export type Property = Hotel | Flight | Car;

// -------------------- Booking Types --------------------

export type BookingStatus =
    | 'PENDING_APPROVAL'
    | 'AWAITING_PAYMENT'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'COMPLETED'
    | 'PENDING_MODIFICATION';  // NEW: Waiting for owner to approve changes

// Pending modification data structure
export interface PendingModification {
    // What fields are being modified
    requestedAt: Date;
    requestedBy: string;  // travelerId

    // The proposed new values (only include what's changing)
    checkInTime?: string;      // e.g., "14:00"
    checkOutTime?: string;     // e.g., "11:00"
    specialRequests?: string;
    guests?: number;

    // For flights
    seatPreference?: string;
    mealPreference?: string;

    // For cars
    pickupTime?: string;
    dropoffTime?: string;

    // Original values for comparison
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
}

export interface BookingDates {
    checkIn: Date;
    checkOut: Date;
}

export interface Booking {
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
    dates: BookingDates;
    guests: number;
    totalPrice: number;
    currency: string;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;

    // NEW: Modification workflow
    pendingModification?: PendingModification;

    // Additional fields for modification tracking
    checkInTime?: string;    // e.g., "14:00"
    checkOutTime?: string;   // e.g., "11:00"
    seatPreference?: string; // For flights
    mealPreference?: string; // For flights
    pickupTime?: string;     // For cars
    dropoffTime?: string;    // For cars
}

// -------------------- Search Types --------------------

export type SearchTab = 'stays' | 'flights' | 'cars';

export interface StaysSearchParams {
    location: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    rooms: number;
}

export interface FlightsSearchParams {
    origin: string;
    destination: string;
    departureDate: Date;
    returnDate?: Date;
    passengers: number;
    cabinClass: Flight['cabinClass'];
    tripType: 'roundtrip' | 'oneway';
}

export interface CarsSearchParams {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: Date;
    dropoffDate: Date;
    driverAge: number;
}

export type SearchParams = StaysSearchParams | FlightsSearchParams | CarsSearchParams;

// -------------------- Auth Context Types --------------------

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

// -------------------- API Response Types --------------------

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    totalPages: number;
    totalItems: number;
}
