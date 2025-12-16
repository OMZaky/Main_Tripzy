# 🌍 Tripzy - Travel Booking Platform

A modern, full-stack travel booking platform built with Next.js 14, TypeScript, and Firebase. Features hotel bookings with room selection, flight reservations, and car rentals - all with a beautiful, responsive UI inspired by Booking.com.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10-orange?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)

---

## ✨ Features

### 🏨 Hotels
- **Room Selection Table** - Booking.com-style room picker with multiple room types
- **Dynamic Pricing** - Prices update based on nights and room selection
- **Instant Booking** - Skip approval, proceed directly to payment
- **7 Room Types** - Standard, Superior, Deluxe, Twin, Family Suite, Executive, Presidential

### ✈️ Flights
- **Flight Search** - Filter by origin, destination, cabin class
- **Ticket-style Cards** - Beautiful horizontal flight cards
- **Instant Confirmation** - Book and pay immediately

### 🚗 Car Rentals
- **Multiple Categories** - Economy, Compact, SUV, Luxury, Van
- **Detailed Specs** - Seats, transmission, fuel type, mileage
- **Insurance Options** - Clear display of included coverage

### 👤 User Roles
| Role | Capabilities |
|------|--------------|
| **Traveler** | Search, book, pay, view trips |
| **Owner** | List properties, manage bookings |
| **Admin** | Approve listings, manage users, view all bookings |

### 💳 Booking Flow
- **Instant Book** (Hotels, Flights, Cars) → Payment → Confirmed
- **Request to Book** (Private Properties) → Owner Approval → Payment → Confirmed

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OMZaky/Main_Tripzy.git
   cd Main_Tripzy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
tripzy/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── search/            # Search results page
│   ├── stays/[id]/        # Hotel detail page
│   ├── flights/[id]/      # Flight detail page
│   ├── cars/[id]/         # Car detail page
│   ├── checkout/[id]/     # Payment checkout
│   ├── trips/             # User bookings
│   ├── dashboard/         # Owner dashboard
│   ├── admin/             # Admin portal
│   └── login/             # Authentication
├── components/            # Reusable components
│   ├── property/          # Property-specific components
│   │   └── RoomTable.tsx  # Room selection table
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Toast.tsx
├── lib/                   # Utilities and services
│   ├── data/              # Data generators
│   │   ├── generators.ts  # Hotel/Flight/Car generators
│   │   └── constants.ts   # Static data
│   ├── firebase.ts        # Firebase configuration
│   ├── bookingService.ts  # Booking CRUD operations
│   ├── adminService.ts    # Admin operations
│   └── mockData.ts        # Generated mock data
├── hooks/                 # Custom React hooks
│   └── useAuthStore.ts    # Zustand auth store
├── types/                 # TypeScript interfaces
│   └── index.ts           # All type definitions
└── public/                # Static assets
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **State** | Zustand |
| **Auth** | Firebase Authentication |
| **Database** | Firebase Firestore |
| **Icons** | Lucide React |

---

## 🔐 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** with Google Sign-in
4. Create a **Firestore Database**
5. Copy your config to `.env.local`

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🎨 Key Components

### RoomTable
Booking.com-style room selection with:
- Room type details (name, bed type, size)
- Capacity icons
- Per-night and total pricing
- Quantity dropdown (limited by availability)
- Sticky footer with selection summary

### BookingWidget
Sidebar booking form with:
- Date pickers
- Guest counter
- Price breakdown
- Instant Book button

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**OMZaky**

- GitHub: [@OMZaky](https://github.com/OMZaky)

---

## 🙏 Acknowledgments

- Design inspiration from [Booking.com](https://booking.com)
- Icons by [Lucide](https://lucide.dev)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)
