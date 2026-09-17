const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Venue', 'Equipment', 'Personnel'], required: true },
  totalQuantity: { type: Number, default: 1 },
  status: { type: String, enum: ['Available', 'Maintenance', 'Depleted'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);