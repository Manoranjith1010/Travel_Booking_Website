import { adminSummary, listAllBookings } from '../data/repository.js';

export async function getSummary(req, res) {
  return res.json(await adminSummary());
}

export async function listAllBookingsHandler(req, res) {
  return res.json({ bookings: await listAllBookings() });
}
