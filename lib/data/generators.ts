// ==============================================
// TRIPZY - Data Generators
// ==============================================

import { Hotel, Flight, Car, PropertyStatus, RoomType } from '@/types';
import {
    CITIES,
    AIRLINES,
    HOTEL_CHAINS,
    CAR_MODELS,
    ROOM_TYPES,
    AIRCRAFT_TYPES,
    HOTEL_IMAGES,
    FLIGHT_IMAGES,
    CAR_IMAGES,
    getRandomItem,
    getRandomNumber,
    getRandomFloat,
    CityData,
    AirlineData,
    HotelChainData,
    CarModelData
} from './constants';

// -------------------- Counters for unique IDs --------------------

let hotelCounter = 0;
let flightCounter = 0;
let carCounter = 0;

// -------------------- Generate Room Types for a Hotel --------------------

interface RoomTypeTemplate {
    name: string;
    bedType: string;
    capacity: number;
    priceMultiplier: number;
    amenities: string[];
    size: number;
}

const ROOM_TYPE_TEMPLATES: RoomTypeTemplate[] = [
    {
        name: 'Standard Room',
        bedType: '1 double bed',
        capacity: 2,
        priceMultiplier: 1.0,
        amenities: ['Free WiFi', 'Air conditioning', 'TV'],
        size: 22,
    },
    {
        name: 'Superior Room',
        bedType: '1 large double bed',
        capacity: 2,
        priceMultiplier: 1.3,
        amenities: ['Free WiFi', 'Air conditioning', 'TV', 'City view', 'Mini bar'],
        size: 28,
    },
    {
        name: 'Deluxe Double Room',
        bedType: '1 king size bed',
        capacity: 2,
        priceMultiplier: 1.6,
        amenities: ['Free cancellation', 'Breakfast included', 'Free WiFi', 'Sea view', 'Bathtub'],
        size: 35,
    },
    {
        name: 'Twin Room',
        bedType: '2 single beds',
        capacity: 2,
        priceMultiplier: 1.1,
        amenities: ['Free WiFi', 'Air conditioning', 'TV', 'Work desk'],
        size: 26,
    },
    {
        name: 'Family Suite',
        bedType: '1 king bed + 2 single beds',
        capacity: 4,
        priceMultiplier: 2.2,
        amenities: ['Free cancellation', 'Breakfast included', 'Free WiFi', 'Living area', 'Kitchen'],
        size: 55,
    },
    {
        name: 'Executive Suite',
        bedType: '1 king size bed',
        capacity: 2,
        priceMultiplier: 2.5,
        amenities: ['Free cancellation', 'Breakfast included', 'Lounge access', 'Butler service', 'Jacuzzi'],
        size: 65,
    },
    {
        name: 'Presidential Suite',
        bedType: '1 emperor bed',
        capacity: 2,
        priceMultiplier: 4.0,
        amenities: ['Free cancellation', 'Breakfast included', 'Private terrace', 'Personal butler', '24h room service'],
        size: 120,
    },
];

function generateRoomTypes(hotelId: string, basePrice: number, starRating: number): RoomType[] {
    // Select 3-4 room types based on star rating
    const numRooms = getRandomNumber(3, 4);

    // Higher star hotels get more premium rooms
    let availableTemplates = [...ROOM_TYPE_TEMPLATES];
    if (starRating >= 4) {
        // Include executive and presidential for luxury hotels
        availableTemplates = availableTemplates;
    } else if (starRating === 3) {
        // Exclude presidential for mid-range
        availableTemplates = availableTemplates.filter(t => t.name !== 'Presidential Suite');
    } else {
        // Budget hotels: only standard, superior, twin
        availableTemplates = availableTemplates.filter(t =>
            ['Standard Room', 'Superior Room', 'Twin Room'].includes(t.name)
        );
    }

    // Shuffle and pick rooms
    const shuffled = [...availableTemplates].sort(() => Math.random() - 0.5);
    const selectedTemplates = shuffled.slice(0, numRooms);

    return selectedTemplates.map((template, idx) => ({
        id: `${hotelId}-room-${idx + 1}`,
        name: template.name,
        price: Math.round(basePrice * template.priceMultiplier),
        capacity: template.capacity,
        bedType: template.bedType,
        available: getRandomNumber(1, 8),
        amenities: template.amenities,
        size: template.size,
    }));
}

// -------------------- Generate Hotels for a City --------------------

export function generateHotels(city: CityData, count: number = 12): Hotel[] {
    const hotels: Hotel[] = [];

    // Shuffle hotel chains to get variety
    const shuffledChains = [...HOTEL_CHAINS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
        hotelCounter++;
        const chain = shuffledChains[i % shuffledChains.length];
        const prefix = getRandomItem(chain.prefixes);
        const starRating = getRandomNumber(chain.starRange[0], chain.starRange[1]) as 1 | 2 | 3 | 4 | 5;

        // Price varies based on star rating and random factor
        const priceMultiplier = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
        const basePrice = Math.round(chain.basePrice * priceMultiplier * (starRating / 4));

        const hotelId = `hotel-${String(hotelCounter).padStart(4, '0')}`;

        const hotel: Hotel = {
            id: hotelId,
            ownerId: `owner-hotel-${getRandomNumber(1, 50).toString().padStart(3, '0')}`,
            type: 'hotel',
            title: `${prefix} ${city.name}`,
            description: generateHotelDescription(city, chain, starRating),
            price: basePrice,
            currency: 'USD',
            location: `${city.name}, ${city.country}`,
            images: getHotelImages(3),
            rating: getRandomFloat(3.8, 5.0, 1),
            reviewCount: getRandomNumber(50, 3000),
            isAvailable: true,
            status: 'APPROVED' as PropertyStatus,
            createdAt: new Date(Date.now() - getRandomNumber(0, 365) * 24 * 60 * 60 * 1000),
            starRating,
            amenities: [...chain.amenities].slice(0, getRandomNumber(4, chain.amenities.length)),
            roomType: getRandomItem(ROOM_TYPES),
            roomTypes: generateRoomTypes(hotelId, basePrice, starRating), // NEW: Generate room types
            maxGuests: getRandomNumber(2, 6),
            checkInTime: `${getRandomNumber(14, 16)}:00`,
            checkOutTime: `${getRandomNumber(10, 12)}:00`,
            address: `${getRandomNumber(1, 500)} ${getRandomItem(['Main Street', 'Beach Road', 'City Center', 'Marina Boulevard', 'Downtown Avenue'])}`,
            city: city.name,
            country: city.country,
        };

        hotels.push(hotel);
    }

    return hotels;
}

function generateHotelDescription(city: CityData, chain: HotelChainData, stars: number): string {
    const descriptions = [
        `Experience luxury at ${chain.name} in the heart of ${city.name}. This ${stars}-star property offers world-class amenities and exceptional service.`,
        `Discover the perfect blend of comfort and elegance at our ${city.name} location. Ideally situated for both business and leisure travelers.`,
        `Welcome to ${chain.name} ${city.name}, where sophisticated design meets unparalleled hospitality. Enjoy stunning views and premium facilities.`,
        `Your gateway to ${city.name}'s best attractions. This ${stars}-star hotel offers modern amenities, gourmet dining, and personalized service.`,
        `Indulge in the ultimate hospitality experience at ${chain.name}. Located in ${city.name}, featuring elegant rooms and world-class dining.`,
    ];
    return getRandomItem(descriptions);
}

function getHotelImages(count: number): string[] {
    const shuffled = [...HOTEL_IMAGES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// -------------------- Specific Flight Route Data --------------------

interface FlightRoute {
    origin: { name: string; code: string; lat: number; lng: number };
    destination: { name: string; code: string; lat: number; lng: number };
    airline: string;
    basePrice: number;
}

// Define 12 specific popular routes
const POPULAR_ROUTES: FlightRoute[] = [
    // Cairo <-> Dubai (2 flights)
    { origin: { name: 'Cairo', code: 'CAI', lat: 30.0444, lng: 31.2357 }, destination: { name: 'Dubai', code: 'DXB', lat: 25.2048, lng: 55.2708 }, airline: 'EgyptAir', basePrice: 350 },
    { origin: { name: 'Dubai', code: 'DXB', lat: 25.2048, lng: 55.2708 }, destination: { name: 'Cairo', code: 'CAI', lat: 30.0444, lng: 31.2357 }, airline: 'Emirates', basePrice: 380 },
    // Cairo <-> London (2 flights)
    { origin: { name: 'Cairo', code: 'CAI', lat: 30.0444, lng: 31.2357 }, destination: { name: 'London', code: 'LHR', lat: 51.5074, lng: -0.1278 }, airline: 'EgyptAir', basePrice: 520 },
    { origin: { name: 'London', code: 'LHR', lat: 51.5074, lng: -0.1278 }, destination: { name: 'Cairo', code: 'CAI', lat: 30.0444, lng: 31.2357 }, airline: 'British Airways', basePrice: 550 },
    // New York <-> Paris (2 flights)
    { origin: { name: 'New York', code: 'JFK', lat: 40.7128, lng: -74.006 }, destination: { name: 'Paris', code: 'CDG', lat: 48.8566, lng: 2.3522 }, airline: 'Air France', basePrice: 680 },
    { origin: { name: 'Paris', code: 'CDG', lat: 48.8566, lng: 2.3522 }, destination: { name: 'New York', code: 'JFK', lat: 40.7128, lng: -74.006 }, airline: 'Delta', basePrice: 720 },
    // Dubai <-> London (2 flights)
    { origin: { name: 'Dubai', code: 'DXB', lat: 25.2048, lng: 55.2708 }, destination: { name: 'London', code: 'LHR', lat: 51.5074, lng: -0.1278 }, airline: 'Emirates', basePrice: 580 },
    { origin: { name: 'London', code: 'LHR', lat: 51.5074, lng: -0.1278 }, destination: { name: 'Dubai', code: 'DXB', lat: 25.2048, lng: 55.2708 }, airline: 'British Airways', basePrice: 620 },
    // Riyadh <-> Cairo (2 flights)
    { origin: { name: 'Riyadh', code: 'RUH', lat: 24.7136, lng: 46.6753 }, destination: { name: 'Cairo', code: 'CAI', lat: 30.0444, lng: 31.2357 }, airline: 'Saudia', basePrice: 280 },
    { origin: { name: 'Cairo', code: 'CAI', lat: 30.0444, lng: 31.2357 }, destination: { name: 'Riyadh', code: 'RUH', lat: 24.7136, lng: 46.6753 }, airline: 'EgyptAir', basePrice: 260 },
    // Paris <-> Rome (2 flights)
    { origin: { name: 'Paris', code: 'CDG', lat: 48.8566, lng: 2.3522 }, destination: { name: 'Rome', code: 'FCO', lat: 41.9028, lng: 12.4964 }, airline: 'Air France', basePrice: 180 },
    { origin: { name: 'Rome', code: 'FCO', lat: 41.9028, lng: 12.4964 }, destination: { name: 'Paris', code: 'CDG', lat: 48.8566, lng: 2.3522 }, airline: 'Alitalia', basePrice: 195 },
];

// -------------------- Generate Flights Between Cities --------------------

export function generateFlights(count: number = 80): Flight[] {
    const flights: Flight[] = [];

    // First, generate the 12 specific popular routes
    POPULAR_ROUTES.forEach((route, index) => {
        flightCounter++;

        // Generate departure dates from tomorrow to next month
        const daysFromNow = 1 + Math.floor(index * 2.5); // Spread flights over next month
        const departureDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

        const cabinClasses: ('economy' | 'business' | 'first')[] = ['economy', 'business', 'first'];
        const cabinClass = cabinClasses[index % 3];

        const cabinMultipliers: Record<string, number> = {
            economy: 1,
            business: 2.8,
            first: 5.2
        };

        const price = Math.round(route.basePrice * cabinMultipliers[cabinClass] + getRandomNumber(-50, 100));

        // Generate flight times
        const departureHour = getRandomNumber(6, 22);
        const departureMin = getRandomItem(['00', '15', '30', '45']);

        // Calculate duration based on rough distance
        const distance = Math.sqrt(
            Math.pow((route.destination.lat - route.origin.lat) * 111, 2) +
            Math.pow((route.destination.lng - route.origin.lng) * 85, 2)
        );
        const durationHours = Math.max(2, Math.round(distance / 800));
        const durationMins = getRandomNumber(10, 50);

        const arrivalHour = (departureHour + durationHours) % 24;
        const nextDay = (departureHour + durationHours) >= 24;

        const flight: Flight = {
            id: `flight-${String(flightCounter).padStart(4, '0')}`,
            ownerId: `owner-airline-${route.airline.toUpperCase().replace(/\s/g, '')}`,
            type: 'flight',
            title: `${route.origin.name} to ${route.destination.name} - ${route.airline}`,
            description: `Fly ${cabinClass === 'economy' ? 'Economy' : cabinClass === 'business' ? 'Business Class' : 'First Class'} with ${route.airline}. Experience exceptional service and comfort on your ${route.origin.name} to ${route.destination.name} journey.`,
            price,
            currency: 'USD',
            location: 'International',
            images: getFlightImages(2),
            rating: getRandomFloat(4.2, 5.0, 1),
            reviewCount: getRandomNumber(500, 5000),
            isAvailable: true,
            status: 'APPROVED' as PropertyStatus,
            createdAt: new Date(Date.now() - getRandomNumber(0, 90) * 24 * 60 * 60 * 1000),
            airline: route.airline,
            airlineLogo: `https://logo.clearbit.com/${route.airline.toLowerCase().replace(/\s/g, '')}.com`,
            flightNumber: `${route.airline.substring(0, 2).toUpperCase()} ${getRandomNumber(100, 999)}`,
            origin: route.origin.name,
            originCode: route.origin.code,
            destination: route.destination.name,
            destinationCode: route.destination.code,
            departureTime: `${String(departureHour).padStart(2, '0')}:${departureMin}`,
            arrivalTime: `${String(arrivalHour).padStart(2, '0')}:${String(getRandomNumber(0, 59)).padStart(2, '0')}${nextDay ? '+1' : ''}`,
            duration: `${durationHours}h ${durationMins}m`,
            cabinClass,
            stops: Math.random() > 0.8 ? 1 : 0,
            aircraft: getRandomItem(AIRCRAFT_TYPES),
            baggageAllowance: cabinClass === 'economy' ? '1 x 23kg' : cabinClass === 'business' ? '2 x 32kg' : '3 x 32kg',
        };

        flights.push(flight);
    });

    // Then generate additional random flights to reach the count
    const usedRoutes = new Set<string>();
    POPULAR_ROUTES.forEach(r => usedRoutes.add(`${r.origin.code}-${r.destination.code}`));

    while (flights.length < count) {
        flightCounter++;

        // Pick origin and destination from CITIES
        let origin: CityData, destination: CityData;
        let routeKey: string;
        let attempts = 0;

        do {
            origin = getRandomItem(CITIES);
            destination = getRandomItem(CITIES);
            routeKey = `${origin.code}-${destination.code}`;
            attempts++;
        } while ((origin.code === destination.code || usedRoutes.has(routeKey)) && attempts < 50);

        usedRoutes.add(routeKey);

        const airline = getRandomItem(AIRLINES);
        const cabinClass = getRandomItem(airline.cabinClasses);
        const stops = Math.random() > 0.75 ? getRandomNumber(1, 2) : 0;

        const distance = calculateDistance(origin, destination);
        const basePricePerKm = 0.08;
        const cabinMultipliers: Record<string, number> = {
            economy: 1,
            premium_economy: 1.6,
            business: 3.5,
            first: 6
        };
        const price = Math.round(
            (distance * basePricePerKm * cabinMultipliers[cabinClass]) +
            getRandomNumber(100, 300)
        );

        const departureHour = getRandomNumber(0, 23);
        const departureMin = getRandomItem(['00', '15', '30', '45']);
        const durationHours = Math.round(distance / 800);
        const durationMins = getRandomNumber(0, 59);

        const arrivalHour = (departureHour + durationHours) % 24;
        const nextDay = (departureHour + durationHours) >= 24;

        const flight: Flight = {
            id: `flight-${String(flightCounter).padStart(4, '0')}`,
            ownerId: `owner-airline-${airline.code}`,
            type: 'flight',
            title: `${origin.name} to ${destination.name} - ${airline.name}`,
            description: generateFlightDescription(airline, cabinClass),
            price,
            currency: 'USD',
            location: 'International',
            images: getFlightImages(2),
            rating: getRandomFloat(4.0, 5.0, 1),
            reviewCount: getRandomNumber(200, 8000),
            isAvailable: true,
            status: 'APPROVED' as PropertyStatus,
            createdAt: new Date(Date.now() - getRandomNumber(0, 180) * 24 * 60 * 60 * 1000),
            airline: airline.name,
            airlineLogo: airline.logoUrl,
            flightNumber: `${airline.code} ${getRandomNumber(100, 999)}`,
            origin: `${origin.name} ${getAirportName(origin)}`,
            originCode: origin.code,
            destination: `${destination.name} ${getAirportName(destination)}`,
            destinationCode: destination.code,
            departureTime: `${String(departureHour).padStart(2, '0')}:${departureMin}`,
            arrivalTime: `${String(arrivalHour).padStart(2, '0')}:${String(getRandomNumber(0, 59)).padStart(2, '0')}${nextDay ? '+1' : ''}`,
            duration: `${durationHours}h ${durationMins}m`,
            cabinClass,
            stops,
            aircraft: getRandomItem(AIRCRAFT_TYPES),
            baggageAllowance: cabinClass === 'economy' ? '1 x 23kg' : cabinClass === 'business' ? '2 x 32kg' : '3 x 32kg',
        };

        flights.push(flight);
    }

    return flights;
}

function generateFlightDescription(airline: AirlineData, cabinClass: string): string {
    const classNames: Record<string, string> = {
        economy: 'Economy Class',
        premium_economy: 'Premium Economy',
        business: 'Business Class',
        first: 'First Class'
    };

    const descriptions = [
        `Fly ${classNames[cabinClass]} with ${airline.name}. Enjoy exceptional service and comfort throughout your journey.`,
        `Experience the renowned hospitality of ${airline.name} in ${classNames[cabinClass]}. Award-winning service awaits.`,
        `${airline.name} ${classNames[cabinClass]} offers premium comfort, gourmet dining, and entertainment for your journey.`,
    ];
    return getRandomItem(descriptions);
}

function getAirportName(city: CityData): string {
    const airports: Record<string, string> = {
        'NYC': 'JFK International',
        'LON': 'Heathrow',
        'PAR': 'Charles de Gaulle',
        'DXB': 'International',
        'TYO': 'Narita',
        'CAI': 'International',
        'LAX': 'International',
    };
    return airports[city.code] || 'International';
}

function calculateDistance(city1: CityData, city2: CityData): number {
    const R = 6371; // Earth's radius in km
    const dLat = (city2.lat - city1.lat) * Math.PI / 180;
    const dLng = (city2.lng - city1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(city1.lat * Math.PI / 180) * Math.cos(city2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getFlightImages(count: number): string[] {
    const shuffled = [...FLIGHT_IMAGES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// -------------------- Generate Cars for a City --------------------

export function generateCars(city: CityData, count: number = 10): Car[] {
    const cars: Car[] = [];
    const shuffledModels = [...CAR_MODELS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
        carCounter++;
        const model = shuffledModels[i % shuffledModels.length];

        // Price varies by location (some cities are more expensive)
        const locationMultiplier = ['NYC', 'LON', 'TYO', 'DXB', 'ZRH'].includes(city.code) ? 1.3 : 1;
        const price = Math.round(model.pricePerDay * locationMultiplier * (0.9 + Math.random() * 0.2));

        const car: Car = {
            id: `car-${String(carCounter).padStart(4, '0')}`,
            ownerId: `owner-rental-${getRandomNumber(1, 30).toString().padStart(3, '0')}`,
            type: 'car',
            title: `${model.make} ${model.model} - ${capitalizeFirst(model.category)}`,
            description: generateCarDescription(model, city),
            price,
            currency: 'USD',
            location: `${city.name}, ${city.country}`,
            images: getCarImages(2),
            rating: getRandomFloat(4.0, 5.0, 1),
            reviewCount: getRandomNumber(30, 800),
            isAvailable: true,
            status: 'APPROVED' as PropertyStatus,
            createdAt: new Date(Date.now() - getRandomNumber(0, 300) * 24 * 60 * 60 * 1000),
            make: model.make,
            model: model.model,
            year: getRandomNumber(2021, 2024),
            transmission: model.transmission,
            fuelType: model.fuelType,
            seats: model.seats,
            doors: model.doors,
            category: model.category,
            features: model.features,
            pickupLocation: `${city.name} ${getRandomItem(['Airport', 'Downtown', 'City Center', 'Train Station'])}`,
            dropoffLocation: `${city.name} ${getRandomItem(['Airport', 'Downtown', 'City Center', 'Train Station'])}`,
            mileageLimit: Math.random() > 0.3 ? `${getRandomNumber(150, 300)} miles/day` : 'Unlimited',
            insuranceIncluded: Math.random() > 0.4,
        };

        cars.push(car);
    }

    return cars;
}

function generateCarDescription(model: CarModelData, city: CityData): string {
    const descriptions = [
        `Explore ${city.name} in style with this ${model.make} ${model.model}. Perfect for ${model.category === 'suv' ? 'family adventures' : 'city exploration'}.`,
        `Reliable and comfortable ${model.make} ${model.model} available for rent in ${city.name}. ${model.fuelType === 'electric' ? 'Zero emissions, maximum comfort.' : 'Great fuel efficiency.'}`,
        `Experience ${city.name} your way with this ${model.category} vehicle. Features include ${model.features.slice(0, 3).join(', ')}.`,
    ];
    return getRandomItem(descriptions);
}

function getCarImages(count: number): string[] {
    const shuffled = [...CAR_IMAGES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// -------------------- Generate All Data --------------------

export function generateAllHotels(): Hotel[] {
    let allHotels: Hotel[] = [];

    for (const city of CITIES) {
        const hotelsPerCity = getRandomNumber(10, 15);
        const hotels = generateHotels(city, hotelsPerCity);
        allHotels = allHotels.concat(hotels);
    }

    return allHotels;
}

export function generateAllFlights(): Flight[] {
    return generateFlights(100); // Generate 100 flights
}

export function generateAllCars(): Car[] {
    let allCars: Car[] = [];

    for (const city of CITIES) {
        const carsPerCity = getRandomNumber(8, 12);
        const cars = generateCars(city, carsPerCity);
        allCars = allCars.concat(cars);
    }

    return allCars;
}
