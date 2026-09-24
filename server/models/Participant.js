const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    role: { type: String, enum: ['attendee', 'speaker', 'vip', 'volunteer'], default: 'attendee' },
    attended: { type: Boolean, default: false },
    department: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Participant', participantSchema);
