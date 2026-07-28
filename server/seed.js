import dotenv from 'dotenv';
import { connectDatabase } from './config/db.js';
import { seedDatabase } from './data/repository.js';

dotenv.config();

async function run() {
  await connectDatabase(process.env.MONGO_URI);
  const result = await seedDatabase();
  console.log(result.message);
  process.exit(0);
}

run().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});