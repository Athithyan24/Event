const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    action: { type: String, required: true },
    detail: { type: String, default: '' },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timeline', timelineSchema);
