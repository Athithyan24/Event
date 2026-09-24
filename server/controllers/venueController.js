const Venue = require('../models/Venue');
const Event = require('../models/Event');
const { asyncHandler } = require('../middleware/error');
const { findVenueConflicts, suggestVenues } = require('../utils/availability');
const { logActivity } = require('../utils/audit');

exports.list = asyncHandler(async (req, res) => {
  const items = await Venue.find().sort({ name: 1 });
  res.json(items);
});

exports.create = asyncHandler(async (req, res) => {
  const item = await Venue.create(req.body);
  await logActivity({ actor: req.user._id, action: 'Created venue', entity: 'venue', entityId: String(item._id) });
  res.status(201).json(item);
});

exports.update = asyncHandler(async (req, res) => {
  const item = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Venue not found' });
  res.json(item);
});

exports.remove = asyncHandler(async (req, res) => {
  await Venue.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

exports.checkAvailability = asyncHandler(async (req, res) => {
  const { venueId, date, startTime, endTime, audience, excludeId } = req.body;
  const venue = await Venue.findById(venueId);
  if (!venue) return res.status(404).json({ message: 'Venue not found' });
  if (venue.status !== 'available') {
    const alternatives = await suggestVenues({ Event, Venue, date, startTime, endTime, audience, excludeVenue: venueId });
    return res.json({
      available: false,
      reason: `Venue is ${venue.status}`,
      conflicts: [],
      alternatives,
    });
  }
  if (audience && audience > venue.capacity) {
    const alternatives = await suggestVenues({ Event, Venue, date, startTime, endTime, audience, excludeVenue: venueId });
    return res.json({
      available: false,
      reason: `Capacity ${venue.capacity} is below expected audience ${audience}`,
      conflicts: [],
      alternatives,
    });
  }
  const conflicts = await findVenueConflicts({ Event, venueId, date, startTime, endTime, excludeId });
  if (conflicts.length) {
    const alternatives = await suggestVenues({ Event, Venue, date, startTime, endTime, audience, excludeVenue: venueId });
    return res.json({ available: false, reason: 'Time slot overlaps an existing booking', conflicts, alternatives });
  }
  res.json({ available: true, conflicts: [], alternatives: [] });
});

exports.matrix = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  date.setHours(0, 0, 0, 0);
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  const venues = await Venue.find().sort({ name: 1 });
  const events = await Event.find({
    date: { $gte: date, $lt: next },
    status: { $in: ['pending', 'approved', 'in_progress'] },
  }).populate('department', 'name code color');

  const slots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  const matrix = venues.map((venue) => ({
    venue,
    cells: slots.map((slot, i) => {
      const end = slots[i + 1] || '20:00';
      const hit = events.find(
        (e) =>
          String(e.venue) === String(venue._id) &&
          e.startTime < end &&
          slot < e.endTime
      );
      return { slot, end, event: hit || null };
    }),
  }));
  res.json({ date, slots, matrix });
});
