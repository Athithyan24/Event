const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Equipment = require('../models/Equipment');
const EquipmentAllocation = require('../models/EquipmentAllocation');
const Timeline = require('../models/Timeline');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');
const {
  findVenueConflicts,
  suggestVenues,
  equipmentAvailability,
} = require('../utils/availability');
const { addTimeline, notify, notifyMany, logActivity, logResource } = require('../utils/audit');

const POPULATE = [
  { path: 'department', select: 'name code color' },
  { path: 'organizer', select: 'name email role' },
  { path: 'venue', select: 'name location building capacity image status' },
  { path: 'equipment.item', select: 'name totalQuantity' },
  { path: 'reviewedBy', select: 'name' },
  { path: 'suggestedVenue', select: 'name location capacity' },
];

function scopedQuery(user) {
  if (user.role === 'admin') return {};
  return { department: user.department };
}

async function reserveEquipment(event) {
  await EquipmentAllocation.deleteMany({ event: event._id });
  if (!event.equipment?.length) return;
  const docs = event.equipment.map((row) => ({
    event: event._id,
    equipment: row.item,
    quantity: row.quantity,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    status: event.status === 'approved' || event.status === 'in_progress' ? 'reserved' : 'reserved',
  }));
  await EquipmentAllocation.insertMany(docs);
}

async function releaseEquipment(eventId) {
  await EquipmentAllocation.updateMany({ event: eventId }, { status: 'released' });
}

async function validateResources(payload, excludeId) {
  const issues = [];
  let alternatives = [];
  if (payload.venue) {
    const venue = await Venue.findById(payload.venue);
    if (!venue) issues.push({ kind: 'venue', message: 'Venue not found' });
    else if (venue.status !== 'available') {
      issues.push({ kind: 'venue', message: `Venue is ${venue.status}` });
      alternatives = await suggestVenues({
        Event,
        Venue,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        audience: payload.expectedAudience,
        excludeVenue: payload.venue,
      });
    } else if (payload.expectedAudience && payload.expectedAudience > venue.capacity) {
      issues.push({
        kind: 'capacity',
        message: `Audience ${payload.expectedAudience} exceeds capacity ${venue.capacity}`,
      });
      alternatives = await suggestVenues({
        Event,
        Venue,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        audience: payload.expectedAudience,
        excludeVenue: payload.venue,
      });
    } else {
      const conflicts = await findVenueConflicts({
        Event,
        venueId: payload.venue,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        excludeId,
      });
      if (conflicts.length) {
        issues.push({
          kind: 'conflict',
          message: 'Venue is already booked in this window',
          conflicts,
        });
        alternatives = await suggestVenues({
          Event,
          Venue,
          date: payload.date,
          startTime: payload.startTime,
          endTime: payload.endTime,
          audience: payload.expectedAudience,
          excludeVenue: payload.venue,
        });
      }
    }
  }

  const equipmentIssues = [];
  for (const row of payload.equipment || []) {
    const check = await equipmentAvailability({
      Equipment,
      EquipmentAllocation,
      itemId: row.item,
      quantity: Number(row.quantity),
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      excludeEventId: excludeId,
    });
    if (!check.ok) equipmentIssues.push({ ...check, item: row.item });
  }
  if (equipmentIssues.length) {
    issues.push({ kind: 'equipment', message: 'Equipment over-allocation', details: equipmentIssues });
  }
  return { issues, alternatives };
}

exports.list = asyncHandler(async (req, res) => {
  const q = scopedQuery(req.user);
  if (req.query.status) q.status = req.query.status;
  if (req.query.type) q.type = req.query.type;
  if (req.query.department && req.user.role === 'admin') q.department = req.query.department;
  const items = await Event.find(q).populate(POPULATE).sort({ date: -1, startTime: 1 });
  res.json(items);
});

exports.getOne = asyncHandler(async (req, res) => {
  const item = await Event.findById(req.params.id).populate(POPULATE);
  if (!item) return res.status(404).json({ message: 'Event not found' });
  if (req.user.role !== 'admin' && String(item.department?._id || item.department) !== String(req.user.department?._id || req.user.department)) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  const timeline = await Timeline.find({ event: item._id }).populate('actor', 'name').sort({ createdAt: 1 });
  res.json({ event: item, timeline });
});

exports.create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const force = Boolean(body.force);
  delete body.force;
  body.organizer = req.user._id;
  if (req.user.role !== 'admin') body.department = req.user.department;
  if (!body.department) return res.status(400).json({ message: 'Department is required' });
  if (!force) {
    const { issues, alternatives } = await validateResources(body);
    if (issues.length) {
      return res.status(409).json({ message: 'Resource conflict detected', issues, alternatives });
    }
  }
  const status = body.status === 'draft' ? 'draft' : 'pending';
  const event = await Event.create({ ...body, status });
  await addTimeline(event._id, { action: 'Created', detail: status === 'draft' ? 'Saved as draft' : 'Submitted for approval', actor: req.user._id });
  await reserveEquipment(event);
  if (event.venue) {
    await logResource({ kind: 'venue', resourceId: event.venue, event: event._id, message: 'Venue requested' });
  }
  const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
  await notifyMany(
    admins.map((a) => a._id),
    {
      title: 'New event request',
      message: `${req.user.name} submitted “${event.title}”`,
      type: 'approval',
      link: `/app/events/${event._id}`,
    }
  );
  await logActivity({ actor: req.user._id, action: 'Created event request', entity: 'event', entityId: String(event._id) });
  const populated = await Event.findById(event._id).populate(POPULATE);
  res.status(201).json(populated);
});

exports.update = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (req.user.role !== 'admin' && String(event.organizer) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  if (!['draft', 'changes_requested', 'pending'].includes(event.status) && req.user.role !== 'admin') {
    return res.status(400).json({ message: 'This event can no longer be edited' });
  }
  const next = { ...req.body };
  const force = Boolean(next.force);
  delete next.status;
  delete next.force;
  if (!force) {
    const { issues, alternatives } = await validateResources({ ...event.toObject(), ...next }, event._id);
    if (issues.length) return res.status(409).json({ message: 'Resource conflict detected', issues, alternatives });
  }
  Object.assign(event, next);
  if (event.status === 'changes_requested') event.status = 'pending';
  await event.save();
  await reserveEquipment(event);
  await addTimeline(event._id, { action: 'Updated', detail: 'Request details were revised', actor: req.user._id });
  const populated = await Event.findById(event._id).populate(POPULATE);
  res.json(populated);
});

exports.review = asyncHandler(async (req, res) => {
  const { decision, reviewNote, suggestedVenue, suggestedSlot, venue, equipment, date, startTime, endTime } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (decision === 'approve') {
    if (venue) event.venue = venue;
    if (equipment) event.equipment = equipment;
    if (date) event.date = date;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    const { issues, alternatives } = await validateResources(event.toObject(), event._id);
    if (issues.length) {
      return res.status(409).json({ message: 'Cannot approve with current allocation', issues, alternatives });
    }
    event.status = 'approved';
    event.reviewNote = reviewNote || '';
    event.reviewedBy = req.user._id;
    event.reviewedAt = new Date();
    await event.save();
    await reserveEquipment(event);
    await addTimeline(event._id, { action: 'Approved', detail: reviewNote || 'Resources reserved', actor: req.user._id });
    await notify(event.organizer, {
      title: 'Event approved',
      message: `“${event.title}” is approved and resources are reserved.`,
      type: 'approval',
      link: `/app/events/${event._id}`,
    });
  } else if (decision === 'reject') {
    event.status = 'rejected';
    event.reviewNote = reviewNote || 'Rejected';
    event.reviewedBy = req.user._id;
    event.reviewedAt = new Date();
    await event.save();
    await releaseEquipment(event._id);
    await addTimeline(event._id, { action: 'Rejected', detail: event.reviewNote, actor: req.user._id });
    await notify(event.organizer, {
      title: 'Event rejected',
      message: `“${event.title}” was rejected. ${event.reviewNote}`,
      type: 'rejection',
      link: `/app/events/${event._id}`,
    });
  } else if (decision === 'changes') {
    event.status = 'changes_requested';
    event.reviewNote = reviewNote || '';
    event.suggestedVenue = suggestedVenue || null;
    event.suggestedSlot = suggestedSlot || '';
    event.reviewedBy = req.user._id;
    event.reviewedAt = new Date();
    await event.save();
    await addTimeline(event._id, { action: 'Changes requested', detail: event.reviewNote, actor: req.user._id });
    await notify(event.organizer, {
      title: 'Changes requested',
      message: `Admin asked for updates on “${event.title}”.`,
      type: 'system',
      link: `/app/events/${event._id}`,
    });
  } else {
    return res.status(400).json({ message: 'Unknown decision' });
  }

  const populated = await Event.findById(event._id).populate(POPULATE);
  res.json(populated);
});

exports.progress = asyncHandler(async (req, res) => {
  const { status, actualAudience } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  event.status = status;
  if (actualAudience != null) event.actualAudience = actualAudience;
  await event.save();
  if (status === 'completed' || status === 'cancelled') await releaseEquipment(event._id);
  await addTimeline(event._id, { action: status.replace('_', ' '), detail: '', actor: req.user._id });
  const populated = await Event.findById(event._id).populate(POPULATE);
  res.json(populated);
});

exports.calendar = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  const q = { ...scopedQuery(req.user), date: { $gte: start, $lt: end } };
  const items = await Event.find(q).populate(POPULATE);
  res.json(items);
});
