import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelPackage', required: false },
    destination: { type: String, required: true },
    travelDates: { type: String, required: true },
    travelers: { type: Number, required: true, default: 1 },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    bookingStatus: { type: String, enum: ['Reserved', 'Confirmed', 'Cancelled'], default: 'Reserved' },
  },
  { timestamps: true },
);

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
