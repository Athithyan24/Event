const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    building: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    facilities: [{ type: String }],
    image: { type: String, default: '' },
    status: { type: String, enum: ['available', 'maintenance', 'closed'], default: 'available' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);
