const mongoose = require('mongoose');

const resourceLogSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['venue', 'equipment'], required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResourceLog', resourceLogSchema);
