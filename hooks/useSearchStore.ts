// ==============================================
// TRIPZY - Search Store (Zustand)
// ==============================================

import { create } from 'zustand';
import { SearchTab } from '@/types';

// -------------------- Date Range Type --------------------

export interface DateRange {
    from: Date | null;
    to: Date | null;
}

// -------------------- Search Params for Each Tab --------------------

export interface StaysParams {
    location: string;
    dates: DateRange;
    guests: number;
    rooms: number;
}

export interface FlightsParams {
    origin: string;
    destination: string;
    departureDate: Date | null;
    returnDate: Date | null;
    passengers: number;
    cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
    tripType: 'roundtrip' | 'oneway';
}

export interface CarsParams {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: Date | null;
    dropoffDate: Date | null;
    driverAge: number;
}

// -------------------- Search Store State --------------------

interface SearchState {
    // Active tab
    activeTab: SearchTab;

    // Search params for each vertical
    staysParams: StaysParams;
    flightsParams: FlightsParams;
    carsParams: CarsParams;

    // Actions
    setActiveTab: (tab: SearchTab) => void;
    setStaysParams: (params: Partial<StaysParams>) => void;
    setFlightsParams: (params: Partial<FlightsParams>) => void;
    setCarsParams: (params: Partial<CarsParams>) => void;
    resetSearch: () => void;
}

// -------------------- Default Values --------------------

const defaultStaysParams: StaysParams = {
    location: '',
    dates: { from: null, to: null },
    guests: 2,
    rooms: 1,
};

const defaultFlightsParams: FlightsParams = {
    origin: '',
    destination: '',
    departureDate: null,
    returnDate: null,
    passengers: 1,
    cabinClass: 'economy',
    tripType: 'roundtrip',
};

const defaultCarsParams: CarsParams = {
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: null,
    dropoffDate: null,
    driverAge: 30,
};

// -------------------- Zustand Store --------------------

export const useSearchStore = create<SearchState>((set) => ({
    activeTab: 'stays',
    staysParams: defaultStaysParams,
    flightsParams: defaultFlightsParams,
    carsParams: defaultCarsParams,

    setActiveTab: (tab) => set({ activeTab: tab }),

    setStaysParams: (params) =>
        set((state) => ({
            staysParams: { ...state.staysParams, ...params },
        })),

    setFlightsParams: (params) =>
        set((state) => ({
            flightsParams: { ...state.flightsParams, ...params },
        })),

    setCarsParams: (params) =>
        set((state) => ({
            carsParams: { ...state.carsParams, ...params },
        })),

    resetSearch: () =>
        set({
            activeTab: 'stays',
            staysParams: defaultStaysParams,
            flightsParams: defaultFlightsParams,
            carsParams: defaultCarsParams,
        }),
}));

// -------------------- Helper: Build Search URL --------------------

export const buildSearchUrl = (state: SearchState): string => {
    const { activeTab, staysParams, flightsParams, carsParams } = state;
    const params = new URLSearchParams();

    params.set('tab', activeTab);

    if (activeTab === 'stays') {
        if (staysParams.location) params.set('location', staysParams.location);
        if (staysParams.dates.from) params.set('checkIn', staysParams.dates.from.toISOString());
        if (staysParams.dates.to) params.set('checkOut', staysParams.dates.to.toISOString());
        params.set('guests', staysParams.guests.toString());
        params.set('rooms', staysParams.rooms.toString());
    } else if (activeTab === 'flights') {
        if (flightsParams.origin) params.set('origin', flightsParams.origin);
        if (flightsParams.destination) params.set('destination', flightsParams.destination);
        if (flightsParams.departureDate) params.set('departure', flightsParams.departureDate.toISOString());
        if (flightsParams.returnDate) params.set('return', flightsParams.returnDate.toISOString());
        params.set('passengers', flightsParams.passengers.toString());
        params.set('cabin', flightsParams.cabinClass);
        params.set('tripType', flightsParams.tripType);
    } else if (activeTab === 'cars') {
        if (carsParams.pickupLocation) params.set('pickup', carsParams.pickupLocation);
        if (carsParams.dropoffLocation) params.set('dropoff', carsParams.dropoffLocation);
        if (carsParams.pickupDate) params.set('pickupDate', carsParams.pickupDate.toISOString());
        if (carsParams.dropoffDate) params.set('dropoffDate', carsParams.dropoffDate.toISOString());
        params.set('driverAge', carsParams.driverAge.toString());
    }

    return `/search?${params.toString()}`;
};
