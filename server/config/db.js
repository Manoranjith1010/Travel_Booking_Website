import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  if (!uri) {
    return false;
  }

  await mongoose.connect(uri, { autoIndex: true });
  return true;
}
