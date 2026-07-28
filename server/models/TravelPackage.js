import mongoose from 'mongoose';

const travelPackageSchema = new mongoose.Schema(
  {
    destination: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    image: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.TravelPackage || mongoose.model('TravelPackage', travelPackageSchema);
