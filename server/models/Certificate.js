const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    participantName: { type: String, required: true },
    certificateId: { type: String, required: true, unique: true },
    issuedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
