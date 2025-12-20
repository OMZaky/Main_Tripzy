'use client';

// ==============================================
// TRIPZY - Database Seed Button (Flight Generator)
// ==============================================

import { useState } from 'react';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Database, Plane, Check } from 'lucide-react';
import { toast } from '@/components/Toast';

// -------------------- Data Pools --------------------

const HUBS = [
    { code: 'CAI', city: 'Cairo', country: 'Egypt' },
    { code: 'DXB', city: 'Dubai', country: 'UAE' },
    { code: 'LHR', city: 'London', country: 'UK' },
    { code: 'JFK', city: 'New York', country: 'USA' },
    { code: 'CDG', city: 'Paris', country: 'France' },
    { code: 'JED', city: 'Jeddah', country: 'Saudi Arabia' },
    { code: 'IST', city: 'Istanbul', country: 'Turkey' },
    { code: 'SSH', city: 'Sharm El Sheikh', country: 'Egypt' },
    { code: 'ASW', city: 'Aswan', country: 'Egypt' },
    { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia' },
    { code: 'FCO', city: 'Rome', country: 'Italy' },
    { code: 'AMS', city: 'Amsterdam', country: 'Netherlands' },
];

const AIRLINES = [
    { name: 'EgyptAir', code: 'MS' },
    { name: 'Emirates', code: 'EK' },
    { name: 'British Airways', code: 'BA' },
    { name: 'Saudia', code: 'SV' },
    { name: 'Lufthansa', code: 'LH' },
    { name: 'Air France', code: 'AF' },
    { name: 'Turkish Airlines', code: 'TK' },
    { name: 'Qatar Airways', code: 'QR' },
    { name: 'Delta', code: 'DL' },
];

const CABIN_CLASSES: ('economy' | 'premium_economy' | 'business' | 'first')[] = ['economy', 'premium_economy', 'business', 'first'];

const AIRCRAFT_TYPES = [
    'Boeing 777-300ER',
    'Airbus A380',
    'Boeing 787 Dreamliner',
    'Airbus A350-900',
    'Boeing 737 MAX',
    'Airbus A320neo',
];

const FLIGHT_IMAGES = [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
    'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=800',
    'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
];

// -------------------- Helper Functions --------------------

function getRandomItem<T>(arr: readonly T[] | T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number, decimals: number = 1): number {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function generateFlightNumber(airlineCode: string): string {
    return `${airlineCode} ${getRandomNumber(100, 999)}`;
}

// -------------------- Flight Generator --------------------

interface GeneratedFlight {
    id: string;
    type: 'flight';
    ownerId: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    location: string;
    images: string[];
    rating: number;
    reviewCount: number;
    isAvailable: boolean;
    status: 'APPROVED';
    createdAt: Date;

    // Flight-specific fields
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
    cabinClass: string;
    stops: number;
    aircraft: string;
    baggageAllowance: string;
    departureDate: string;
}

function generateFlights(): GeneratedFlight[] {
    const flights: GeneratedFlight[] = [];
    let flightCounter = 0;

    // Cairo hub for 50% of flights
    const cairoHub = HUBS.find(h => h.code === 'CAI')!;
    const otherHubs = HUBS.filter(h => h.code !== 'CAI');

    // Generate flights for the next 30 days
    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
        const flightDate = new Date();
        flightDate.setDate(flightDate.getDate() + dayOffset);
        const dateString = formatDate(flightDate);

        // Generate 4-6 routes per day
        const routesPerDay = getRandomNumber(4, 6);

        for (let routeIdx = 0; routeIdx < routesPerDay; routeIdx++) {
            flightCounter++;

            // 50% of flights involve Cairo
            let origin, destination;
            if (routeIdx < routesPerDay / 2) {
                // Cairo flights
                if (Math.random() > 0.5) {
                    origin = cairoHub;
                    destination = getRandomItem(otherHubs);
                } else {
                    origin = getRandomItem(otherHubs);
                    destination = cairoHub;
                }
            } else {
                // International flights
                origin = getRandomItem(HUBS);
                do {
                    destination = getRandomItem(HUBS);
                } while (destination.code === origin.code);
            }

            const airline = getRandomItem(AIRLINES);
            const cabinClass = getRandomItem(CABIN_CLASSES);

            // Calculate price based on cabin class
            const basePrices: Record<string, [number, number]> = {
                economy: [150, 450],
                premium_economy: [350, 700],
                business: [800, 1800],
                first: [2000, 4000],
            };
            const [minPrice, maxPrice] = basePrices[cabinClass];
            const price = getRandomNumber(minPrice, maxPrice);

            // Generate times
            const departureHour = getRandomNumber(5, 23);
            const departureMin = getRandomItem(['00', '15', '30', '45']);
            const durationHours = getRandomNumber(2, 12);
            const durationMins = getRandomNumber(10, 55);
            const arrivalHour = (departureHour + durationHours) % 24;
            const nextDay = (departureHour + durationHours) >= 24;

            const flight: GeneratedFlight = {
                id: `flight-gen-${String(flightCounter).padStart(4, '0')}`,
                type: 'flight',
                ownerId: `owner-airline-${airline.code}`,
                title: `${origin.city} to ${destination.city} - ${airline.name}`,
                description: `Fly ${cabinClass === 'economy' ? 'Economy' : cabinClass === 'premium_economy' ? 'Premium Economy' : cabinClass === 'business' ? 'Business Class' : 'First Class'} with ${airline.name}. Experience exceptional service and comfort on your journey from ${origin.city} to ${destination.city}.`,
                price,
                currency: 'USD',
                location: 'International',
                images: [getRandomItem(FLIGHT_IMAGES), getRandomItem(FLIGHT_IMAGES)],
                rating: getRandomFloat(4.0, 5.0),
                reviewCount: getRandomNumber(100, 5000),
                isAvailable: true,
                status: 'APPROVED',
                createdAt: new Date(),

                airline: airline.name,
                airlineLogo: `https://logo.clearbit.com/${airline.name.toLowerCase().replace(/\s/g, '')}.com`,
                flightNumber: generateFlightNumber(airline.code),
                origin: origin.city,
                originCode: origin.code,
                destination: destination.city,
                destinationCode: destination.code,
                departureTime: `${String(departureHour).padStart(2, '0')}:${departureMin}`,
                arrivalTime: `${String(arrivalHour).padStart(2, '0')}:${String(getRandomNumber(0, 59)).padStart(2, '0')}${nextDay ? '+1' : ''}`,
                duration: `${durationHours}h ${durationMins}m`,
                cabinClass,
                stops: Math.random() > 0.75 ? getRandomNumber(1, 2) : 0,
                aircraft: getRandomItem(AIRCRAFT_TYPES),
                baggageAllowance: cabinClass === 'economy' ? '1 x 23kg' : cabinClass === 'business' ? '2 x 32kg' : '3 x 32kg',
                departureDate: dateString,
            };

            flights.push(flight);
        }
    }

    console.log(`[SeedButton] Generated ${flights.length} flights`);
    return flights;
}

// -------------------- Car Data Pools --------------------

const CAR_LOCATIONS = [
    { city: 'Cairo', country: 'Egypt' },
    { city: 'Alexandria', country: 'Egypt' },
    { city: 'Sharm El Sheikh', country: 'Egypt' },
    { city: 'Dubai', country: 'UAE' },
    { city: 'London', country: 'UK' },
    { city: 'Paris', country: 'France' },
    { city: 'Riyadh', country: 'Saudi Arabia' },
    { city: 'Istanbul', country: 'Turkey' },
];

const CAR_CATEGORIES = [
    {
        type: 'economy',
        displayName: 'Economy',
        models: ['Nissan Sunny', 'Toyota Corolla', 'Hyundai Elantra', 'Kia Rio'],
        basePrice: 40,
        seats: 5,
        doors: 4
    },
    {
        type: 'suv',
        displayName: 'SUV',
        models: ['Kia Sportage', 'Toyota Fortuner', 'Jeep Wrangler', 'Nissan Patrol'],
        basePrice: 100,
        seats: 7,
        doors: 4
    },
    {
        type: 'luxury',
        displayName: 'Luxury',
        models: ['Mercedes C180', 'BMW 520i', 'Tesla Model 3', 'Audi A6'],
        basePrice: 200,
        seats: 5,
        doors: 4
    },
    {
        type: 'van',
        displayName: 'Van',
        models: ['Toyota Hiace', 'Mercedes V-Class', 'Hyundai H1'],
        basePrice: 150,
        seats: 12,
        doors: 4
    },
    {
        type: 'compact',
        displayName: 'Compact',
        models: ['Suzuki Swift', 'Honda Fit', 'Toyota Yaris'],
        basePrice: 30,
        seats: 5,
        doors: 4
    },
];

const CAR_COLORS = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red'];

const CAR_FEATURES = [
    'Air Conditioning',
    'GPS Navigation',
    'Bluetooth',
    'USB Charging',
    'Cruise Control',
    'Backup Camera',
    'Child Seat Available',
    'Sunroof',
    'Leather Seats',
    'Apple CarPlay',
];

const CAR_IMAGES: Record<string, string[]> = {
    economy: [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    ],
    suv: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
    ],
    luxury: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    ],
    van: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1609520778163-a16fb3862581?w=800',
    ],
    compact: [
        'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800',
        'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800',
    ],
};

// -------------------- Car Generator --------------------

interface GeneratedCar {
    id: string;
    type: 'car';
    ownerId: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    location: string;
    images: string[];
    rating: number;
    reviewCount: number;
    isAvailable: boolean;
    status: 'APPROVED';
    createdAt: Date;

    // Car-specific fields
    make: string;
    model: string;
    year: number;
    transmission: 'automatic' | 'manual';
    fuelType: string;
    seats: number;
    doors: number;
    category: string;
    features: string[];
    pickupLocation: string;
    dropoffLocation: string;
    mileageLimit: string;
    insuranceIncluded: boolean;
}

function generateCars(): GeneratedCar[] {
    const cars: GeneratedCar[] = [];
    let carCounter = 0;

    // Iterate through every location
    CAR_LOCATIONS.forEach(location => {
        // Iterate through every category
        CAR_CATEGORIES.forEach(category => {
            // Generate 2-3 variants per category per location
            const variantsPerCategory = getRandomNumber(2, 3);

            for (let variant = 0; variant < variantsPerCategory; variant++) {
                carCounter++;

                const model = getRandomItem(category.models);
                const color = getRandomItem(CAR_COLORS);
                const [make, ...modelParts] = model.split(' ');
                const modelName = modelParts.join(' ');
                const year = getRandomNumber(2021, 2024);
                const transmission = Math.random() > 0.3 ? 'automatic' : 'manual';

                // Price variation (+/- $20 from base)
                const priceVariation = getRandomNumber(-20, 30);
                const price = category.basePrice + priceVariation;

                // Random features (3-6)
                const shuffledFeatures = [...CAR_FEATURES].sort(() => Math.random() - 0.5);
                const features = shuffledFeatures.slice(0, getRandomNumber(3, 6));

                const car: GeneratedCar = {
                    id: `car-gen-${String(carCounter).padStart(4, '0')}`,
                    type: 'car',
                    ownerId: `owner-rental-${String(getRandomNumber(1, 20)).padStart(3, '0')}`,
                    title: `${color} ${model} ${year} - ${category.displayName}`,
                    description: `Experience the comfort of this ${color.toLowerCase()} ${model} ${year}. Perfect for ${category.type === 'suv' ? 'family adventures' : category.type === 'luxury' ? 'business trips' : 'city exploration'} in ${location.city}. Features include ${features.slice(0, 3).join(', ')}.`,
                    price,
                    currency: 'USD',
                    location: `${location.city}, ${location.country}`,
                    images: CAR_IMAGES[category.type] || CAR_IMAGES.economy,
                    rating: getRandomFloat(4.0, 5.0),
                    reviewCount: getRandomNumber(20, 500),
                    isAvailable: true,
                    status: 'APPROVED',
                    createdAt: new Date(),

                    make,
                    model: `${model} ${year}`,
                    year,
                    transmission,
                    fuelType: category.type === 'luxury' && Math.random() > 0.5 ? 'electric' : 'petrol',
                    seats: category.seats,
                    doors: category.doors,
                    category: category.type,
                    features,
                    pickupLocation: `${location.city} ${getRandomItem(['Airport', 'Downtown', 'City Center', 'Main Station'])}`,
                    dropoffLocation: `${location.city} ${getRandomItem(['Airport', 'Downtown', 'City Center', 'Main Station'])}`,
                    mileageLimit: Math.random() > 0.3 ? `${getRandomNumber(150, 300)} miles/day` : 'Unlimited',
                    insuranceIncluded: Math.random() > 0.4,
                };

                cars.push(car);
            }
        });
    });

    console.log(`[SeedButton] Generated ${cars.length} cars`);
    return cars;
}

// -------------------- Seed Button Component --------------------

export default function SeedButton() {
    const [isSeedingFlights, setIsSeedingFlights] = useState(false);
    const [isSeedingCars, setIsSeedingCars] = useState(false);
    const [flightProgress, setFlightProgress] = useState(0);
    const [carProgress, setCarProgress] = useState(0);
    const [flightsComplete, setFlightsComplete] = useState(false);
    const [carsComplete, setCarsComplete] = useState(false);

    const handleSeedFlights = async () => {
        setIsSeedingFlights(true);
        setFlightProgress(0);
        setFlightsComplete(false);

        try {
            const flights = generateFlights();
            console.log(`[SeedButton] Starting batch upload of ${flights.length} flights...`);

            const batchSize = 100;
            const totalBatches = Math.ceil(flights.length / batchSize);

            for (let i = 0; i < flights.length; i += batchSize) {
                const batch = writeBatch(db);
                const batchFlights = flights.slice(i, i + batchSize);

                batchFlights.forEach(flight => {
                    const docRef = doc(collection(db, 'properties'), flight.id);
                    batch.set(docRef, {
                        ...flight,
                        createdAt: serverTimestamp(),
                    });
                });

                await batch.commit();

                const completedBatches = Math.floor(i / batchSize) + 1;
                setFlightProgress(Math.round((completedBatches / totalBatches) * 100));
                console.log(`[SeedButton] Flight batch ${completedBatches}/${totalBatches} uploaded`);
            }

            setFlightsComplete(true);
            toast.success('Flights Seeded!', `Successfully uploaded ${flights.length} flights.`);
            console.log(`[SeedButton] ✓ All ${flights.length} flights uploaded!`);

        } catch (error) {
            console.error('[SeedButton] Error seeding flights:', error);
            toast.error('Seeding Failed', 'Check console for details.');
        } finally {
            setIsSeedingFlights(false);
        }
    };

    const handleSeedCars = async () => {
        setIsSeedingCars(true);
        setCarProgress(0);
        setCarsComplete(false);

        try {
            const cars = generateCars();
            console.log(`[SeedButton] Starting batch upload of ${cars.length} cars...`);

            const batchSize = 100;
            const totalBatches = Math.ceil(cars.length / batchSize);

            for (let i = 0; i < cars.length; i += batchSize) {
                const batch = writeBatch(db);
                const batchCars = cars.slice(i, i + batchSize);

                batchCars.forEach(car => {
                    const docRef = doc(collection(db, 'properties'), car.id);
                    batch.set(docRef, {
                        ...car,
                        createdAt: serverTimestamp(),
                    });
                });

                await batch.commit();

                const completedBatches = Math.floor(i / batchSize) + 1;
                setCarProgress(Math.round((completedBatches / totalBatches) * 100));
                console.log(`[SeedButton] Car batch ${completedBatches}/${totalBatches} uploaded`);
            }

            setCarsComplete(true);
            toast.success('Cars Seeded!', `Successfully uploaded ${cars.length} cars.`);
            console.log(`[SeedButton] ✓ All ${cars.length} cars uploaded!`);

        } catch (error) {
            console.error('[SeedButton] Error seeding cars:', error);
            toast.error('Seeding Failed', 'Check console for details.');
        } finally {
            setIsSeedingCars(false);
        }
    };

    return (
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Database size={24} className="text-primary-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Seed Database</h3>
                    <p className="text-sm text-gray-500">Generate test data for search</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Flight Seeder */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Plane size={16} className="text-orange-500" />
                        <span className="font-medium text-sm">Flight Data</span>
                        <span className="text-xs text-gray-500">(120-180 flights)</span>
                    </div>

                    {flightProgress > 0 && flightProgress < 100 && (
                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-primary-600">Uploading...</span>
                                <span className="text-xs text-primary-600">{flightProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-600 transition-all" style={{ width: `${flightProgress}%` }} />
                            </div>
                        </div>
                    )}

                    {flightsComplete && (
                        <div className="flex items-center gap-1 text-success-600 text-sm mb-2">
                            <Check size={14} />
                            <span>Flights seeded!</span>
                        </div>
                    )}

                    <button
                        onClick={handleSeedFlights}
                        disabled={isSeedingFlights}
                        className="w-full py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSeedingFlights ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Seeding Flights...
                            </>
                        ) : (
                            <>
                                <Plane size={14} />
                                Seed Flights
                            </>
                        )}
                    </button>
                </div>

                {/* Car Seeder */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-500">🚗</span>
                        <span className="font-medium text-sm">Car Rental Data</span>
                        <span className="text-xs text-gray-500">(80-120 cars)</span>
                    </div>

                    {carProgress > 0 && carProgress < 100 && (
                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-green-600">Uploading...</span>
                                <span className="text-xs text-green-600">{carProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-600 transition-all" style={{ width: `${carProgress}%` }} />
                            </div>
                        </div>
                    )}

                    {carsComplete && (
                        <div className="flex items-center gap-1 text-success-600 text-sm mb-2">
                            <Check size={14} />
                            <span>Cars seeded!</span>
                        </div>
                    )}

                    <button
                        onClick={handleSeedCars}
                        disabled={isSeedingCars}
                        className="w-full py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSeedingCars ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Seeding Cars...
                            </>
                        ) : (
                            <>
                                <span>🚗</span>
                                Seed Cars
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

