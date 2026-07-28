export const seedPackages = [
  {
    _id: 'pkg-1',
    destination: 'Goa',
    type: 'Beach escape',
    price: 18999,
    duration: '4 Days',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: 'Sunset cruises, curated dining, and boutique stays near the coast.',
  },
  {
    _id: 'pkg-2',
    destination: 'Jaipur',
    type: 'Heritage weekend',
    price: 14250,
    duration: '3 Days',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    description: 'Palaces, local craft markets, and premium city-center hotels.',
  },
  {
    _id: 'pkg-3',
    destination: 'Manali',
    type: 'Mountain retreat',
    price: 22750,
    duration: '5 Days',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    description: 'Snow views, guided adventures, and family-friendly resorts.',
  },
];

export const seedAdminUser = {
  name: 'Admin User',
  email: 'admin@travelloop.com',
  password: 'Admin123!',
  role: 'admin',
};

export const seedBookings = [
  {
    _id: 'BK-10241',
    userId: 'usr-admin',
    destination: 'Goa',
    travelDates: '14 Aug - 18 Aug 2026',
    travelers: 2,
    amount: 18999,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
  },
  {
    _id: 'BK-10242',
    userId: 'usr-admin',
    destination: 'Jaipur',
    travelDates: '29 Aug - 01 Sep 2026',
    travelers: 2,
    amount: 14250,
    paymentStatus: 'Pending',
    bookingStatus: 'Reserved',
  },
];
