const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    audience: { type: String, enum: ['all', 'admin', 'department'], default: 'all' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
