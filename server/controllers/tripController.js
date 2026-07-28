import { listAllPackages, listPackages } from '../data/repository.js';

export async function listTrips(req, res) {
  const trips = await listPackages({ destination: req.query.destination, budget: req.query.budget });
  return res.json({ packages: trips });
}

export async function listAllTripPackages(req, res) {
  return res.json({ packages: await listAllPackages() });
}
