const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  resourceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Resource', 
    required: true 
  },
  quantityAllocated: { 
    type: Number, 
    required: true, 
    min: 1, 
    default: 1 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Returned'], 
    default: 'Confirmed' 
  }
}, { timestamps: true });

// Prevent duplicate allocations for the same event and resource combination
allocationSchema.index({ eventId: 1, resourceId: 1 }, { unique: true });

module.exports = mongoose.model('Allocation', allocationSchema);