import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import TravelPackage from '../models/TravelPackage.js';
import Booking from '../models/Booking.js';
import { seedAdminUser, seedBookings, seedPackages } from './seed.js';

const localAdminHash = bcrypt.hashSync(seedAdminUser.password, 10);
const localState = {
  users: [
    {
      _id: 'usr-admin',
      name: seedAdminUser.name,
      email: seedAdminUser.email.toLowerCase(),
      passwordHash: localAdminHash,
      role: seedAdminUser.role,
    },
  ],
  packages: seedPackages.map((entry) => ({ ...entry })),
  bookings: seedBookings.map((entry) => ({ ...entry })),
};

function isMongoReady() {
  return User.db?.readyState === 1;
}

function normalizeId(document) {
  if (!document) {
    return document;
  }

  const plain = typeof document.toObject === 'function' ? document.toObject() : { ...document };
  plain._id = String(plain._id);
  return plain;
}

function matchesText(value, query) {
  return !query || String(value || '').toLowerCase().includes(query);
}

function bookingMatchesUser(booking, userId, role) {
  return role === 'admin' || String(booking.userId) === String(userId);
}

async function seedMongoIfEmpty() {
  const [userCount, packageCount, bookingCount] = await Promise.all([
    User.estimatedDocumentCount(),
    TravelPackage.estimatedDocumentCount(),
    Booking.estimatedDocumentCount(),
  ]);

  if (userCount === 0) {
    const passwordHash = await bcrypt.hash(seedAdminUser.password, 10);
    await User.create({
      name: seedAdminUser.name,
      email: seedAdminUser.email,
      passwordHash,
      role: seedAdminUser.role,
    });
  }

  if (packageCount === 0) {
    await TravelPackage.insertMany(seedPackages.map(({ _id, ...pkg }) => pkg));
  }

  if (bookingCount === 0) {
    const admin = await User.findOne({ email: seedAdminUser.email.toLowerCase() });
    const seededBookings = seedBookings.map(({ _id, ...booking }) => ({
      ...booking,
      userId: admin?._id,
      packageId: null,
    }));
    if (seededBookings.length > 0 && admin) {
      await Booking.insertMany(seededBookings);
    }
  }
}

export async function bootstrapData() {
  if (isMongoReady()) {
    await seedMongoIfEmpty();
    const [packages, bookings, users] = await Promise.all([
      TravelPackage.find().sort({ createdAt: -1 }),
      Booking.find().sort({ createdAt: -1 }),
      User.find(),
    ]);

    return {
      packages: packages.map(normalizeId),
      bookings: bookings.map(normalizeId),
      summary: {
        bookings: bookings.length,
        users: users.length,
        revenue: bookings.reduce((total, booking) => total + Number(booking.amount || 0), 0),
      },
    };
  }

  return {
    packages: localState.packages,
    bookings: localState.bookings,
    summary: {
      bookings: localState.bookings.length,
      users: localState.users.length,
      revenue: localState.bookings.reduce((total, booking) => total + Number(booking.amount || 0), 0),
    },
  };
}

export async function listPackages({ destination, budget } = {}) {
  const query = String(destination || '').trim().toLowerCase();
  const parsedBudget = Number(budget || 0);

  if (isMongoReady()) {
    const filters = {};
    if (query) {
      filters.destination = new RegExp(query, 'i');
    }
    if (parsedBudget) {
      filters.price = { $lte: parsedBudget };
    }

    const packages = await TravelPackage.find(filters).sort({ createdAt: -1 });
    return packages.map(normalizeId);
  }

  return localState.packages.filter((trip) => matchesText(trip.destination, query) && (!parsedBudget || trip.price <= parsedBudget));
}

export async function listAllPackages() {
  if (isMongoReady()) {
    return (await TravelPackage.find().sort({ createdAt: -1 })).map(normalizeId);
  }

  return localState.packages;
}

export async function findUserByEmail(email) {
  if (isMongoReady()) {
    return normalizeId(await User.findOne({ email: email.toLowerCase() }));
  }

  return localState.users.find((entry) => entry.email === email.toLowerCase()) || null;
}

export async function findUserById(userId) {
  if (isMongoReady()) {
    return normalizeId(await User.findById(userId));
  }

  return localState.users.find((entry) => String(entry._id) === String(userId)) || null;
}

export async function createUser({ name, email, passwordHash, role = 'user' }) {
  if (isMongoReady()) {
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role });
    return normalizeId(user);
  }

  const user = {
    _id: `usr-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
  };
  localState.users.push(user);
  return user;
}

export async function createBooking({ userId, packageId, destination, travelDates, travelers, amount }) {
  if (isMongoReady()) {
    const booking = await Booking.create({
      userId,
      packageId: packageId || null,
      destination,
      travelDates,
      travelers: Number(travelers),
      amount: Number(amount),
      paymentStatus: 'Pending',
      bookingStatus: 'Reserved',
    });
    return normalizeId(booking);
  }

  const booking = {
    _id: `BK-${Date.now()}`,
    userId,
    packageId: packageId || null,
    destination,
    travelDates,
    travelers: Number(travelers),
    amount: Number(amount),
    paymentStatus: 'Pending',
    bookingStatus: 'Reserved',
  };
  localState.bookings.unshift(booking);
  return booking;
}

export async function listBookingsForUser(userId, role) {
  if (isMongoReady()) {
    const bookings = await Booking.find(role === 'admin' ? {} : { userId }).sort({ createdAt: -1 });
    return bookings.map(normalizeId);
  }

  return localState.bookings.filter((booking) => bookingMatchesUser(booking, userId, role));
}

export async function listAllBookings() {
  if (isMongoReady()) {
    return (await Booking.find().sort({ createdAt: -1 })).map(normalizeId);
  }

  return localState.bookings;
}

export async function cancelBookingById(bookingId, userId, role) {
  if (isMongoReady()) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return null;
    }
    if (!bookingMatchesUser(booking, userId, role)) {
      throw new Error('forbidden');
    }
    booking.bookingStatus = 'Cancelled';
    await booking.save();
    return normalizeId(booking);
  }

  const booking = localState.bookings.find((entry) => String(entry._id) === String(bookingId));
  if (!booking) {
    return null;
  }
  if (!bookingMatchesUser(booking, userId, role)) {
    throw new Error('forbidden');
  }
  booking.bookingStatus = 'Cancelled';
  return booking;
}

export async function adminSummary() {
  if (isMongoReady()) {
    const [bookings, users, packages] = await Promise.all([
      Booking.find(),
      User.find(),
      TravelPackage.find(),
    ]);

    return {
      bookings: bookings.length,
      users: users.length,
      revenue: bookings.reduce((total, booking) => total + Number(booking.amount || 0), 0),
      packages: packages.length,
    };
  }

  return {
    bookings: localState.bookings.length,
    users: localState.users.length,
    revenue: localState.bookings.reduce((total, booking) => total + Number(booking.amount || 0), 0),
    packages: localState.packages.length,
  };
}

export async function seedDatabase() {
  if (!isMongoReady()) {
    return {
      inserted: false,
      message: 'MongoDB is not connected. No seed was written.',
    };
  }

  await User.deleteMany({});
  await TravelPackage.deleteMany({});
  await Booking.deleteMany({});
  await seedMongoIfEmpty();

  return {
    inserted: true,
    message: 'Database seeded successfully.',
  };
}
