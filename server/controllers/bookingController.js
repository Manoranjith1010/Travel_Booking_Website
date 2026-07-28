import { cancelBookingById, createBooking, listBookingsForUser } from '../data/repository.js';

export async function listBookings(req, res) {
  const bookings = await listBookingsForUser(req.user.sub, req.user.role);
  return res.json({ bookings });
}

export async function createBooking(req, res) {
  const { packageId, destination, travelDates, travelers, amount } = req.body;

  if (!destination || !travelDates || !travelers || !amount) {
    return res.status(400).json({ message: 'Destination, travel dates, travelers, and amount are required' });
  }

  const booking = await createBooking({
    userId: req.user.sub,
    packageId,
    destination,
    travelDates,
    travelers,
    amount,
  });
  return res.status(201).json({ booking, message: 'Booking created' });
}

export async function cancelBooking(req, res) {
  try {
    const booking = await cancelBookingById(req.params.bookingId, req.user.sub, req.user.role);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json({ booking, message: 'Booking cancelled' });
  } catch {
    return res.status(403).json({ message: 'Forbidden' });
  }
}
