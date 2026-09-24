const mongoose = require('mongoose');

const EVENT_TYPES = [
  'Seminar',
  'Workshop',
  'Conference',
  'Guest Lecture',
  'Hackathon',
  'Training Program',
  'Meeting',
  'Cultural Program',
  'Placement Drive',
];

const STATUSES = [
  'draft',
  'pending',
  'changes_requested',
  'approved',
  'rejected',
  'in_progress',
  'completed',
  'cancelled',
];

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: EVENT_TYPES, required: true },
    description: { type: String, default: '' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expectedAudience: { type: Number, default: 0 },
    actualAudience: { type: Number, default: 0 },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', default: null },
    equipment: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
        quantity: { type: Number, min: 1 },
      },
    ],
    status: { type: String, enum: STATUSES, default: 'pending' },
    reviewNote: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date },
    suggestedVenue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', default: null },
    suggestedSlot: { type: String, default: '' },
    guestSpeakers: [{ name: String, title: String }],
    vipGuests: [{ name: String, affiliation: String }],
    budget: {
      planned: { type: Number, default: 0 },
      actual: { type: Number, default: 0 },
      sponsorship: { type: Number, default: 0 },
      expenditure: { type: Number, default: 0 },
    },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

eventSchema.index({ venue: 1, date: 1, status: 1 });
eventSchema.index({ department: 1, date: -1 });

module.exports = mongoose.model('Event', eventSchema);
module.exports.EVENT_TYPES = EVENT_TYPES;
module.exports.STATUSES = STATUSES;
