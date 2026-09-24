const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    totalQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'pcs' },
    image: { type: String, default: '' },
    status: { type: String, enum: ['active', 'retired'], default: 'active' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
