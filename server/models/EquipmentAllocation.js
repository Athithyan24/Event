const mongoose = require('mongoose');

const equipmentAllocationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    quantity: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ['reserved', 'released', 'cancelled'], default: 'reserved' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EquipmentAllocation', equipmentAllocationSchema);
