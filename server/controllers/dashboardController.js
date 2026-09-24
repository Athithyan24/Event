const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Equipment = require('../models/Equipment');
const EquipmentAllocation = require('../models/EquipmentAllocation');
const Department = require('../models/Department');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const ActivityLog = require('../models/ActivityLog');
const Feedback = require('../models/Feedback');
const { asyncHandler } = require('../middleware/error');
const { logActivity } = require('../utils/audit');

exports.overview = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const deptFilter = isAdmin ? {} : { department: req.user.department };

  const [departments, users, venues, equipment, pending, upcoming, completed] = await Promise.all([
    Department.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    Venue.countDocuments(),
    Equipment.countDocuments({ status: 'active' }),
    Event.countDocuments({ ...deptFilter, status: 'pending' }),
    Event.countDocuments({
      ...deptFilter,
      status: { $in: ['approved', 'in_progress'] },
      date: { $gte: new Date() },
    }),
    Event.countDocuments({ ...deptFilter, status: 'completed' }),
  ]);

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthly = await Event.aggregate([
    { $match: { ...deptFilter, date: { $gte: sixMonthsAgo } } },
    { $group: { _id: { y: { $year: '$date' }, m: { $month: '$date' } }, count: { $sum: 1 } } },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);

  const venueUsage = await Event.aggregate([
    { $match: { ...deptFilter, venue: { $ne: null }, status: { $in: ['approved', 'in_progress', 'completed'] } } },
    { $group: { _id: '$venue', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);
  await Venue.populate(venueUsage, { path: '_id', select: 'name' });

  const equipmentUsage = await EquipmentAllocation.aggregate([
    { $group: { _id: '$equipment', qty: { $sum: '$quantity' } } },
    { $sort: { qty: -1 } },
    { $limit: 6 },
  ]);
  await Equipment.populate(equipmentUsage, { path: '_id', select: 'name' });

  const deptActivity = await Event.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  await Department.populate(deptActivity, { path: '_id', select: 'name code color' });

  const upcomingEvents = await Event.find({
    ...deptFilter,
    status: { $in: ['approved', 'in_progress', 'pending'] },
    date: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
  })
    .populate('venue department organizer')
    .sort({ date: 1, startTime: 1 })
    .limit(6);

  res.json({
    kpis: { departments, users, venues, equipment, pending, upcoming, completed },
    monthly,
    venueUsage,
    equipmentUsage,
    deptActivity,
    upcomingEvents,
  });
});

exports.search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ events: [], venues: [], users: [], equipment: [] });
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const scope = req.user.role === 'admin' ? {} : { department: req.user.department };
  const [events, venues, users, equipment] = await Promise.all([
    Event.find({ ...scope, title: rx }).limit(6).populate('venue department'),
    Venue.find({ $or: [{ name: rx }, { location: rx }, { building: rx }] }).limit(6),
    req.user.role === 'admin' ? User.find({ $or: [{ name: rx }, { email: rx }] }).limit(6) : Promise.resolve([]),
    Equipment.find({ name: rx }).limit(6),
  ]);
  res.json({ events, venues, users, equipment });
});

exports.notifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(40);
  res.json(items);
});

exports.readNotification = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  res.json(item);
});

exports.readAllNotifications = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { read: true });
  res.json({ ok: true });
});

exports.announcements = asyncHandler(async (req, res) => {
  const items = await Announcement.find().populate('author', 'name').sort({ pinned: -1, createdAt: -1 }).limit(30);
  res.json(items);
});

exports.createAnnouncement = asyncHandler(async (req, res) => {
  const item = await Announcement.create({ ...req.body, author: req.user._id });
  await logActivity({ actor: req.user._id, action: 'Posted announcement', entity: 'announcement', entityId: String(item._id) });
  res.status(201).json(item);
});

exports.activity = asyncHandler(async (req, res) => {
  const items = await ActivityLog.find().populate('actor', 'name').sort({ createdAt: -1 }).limit(50);
  res.json(items);
});

exports.feedbackAnalytics = asyncHandler(async (req, res) => {
  const rows = await Feedback.aggregate([
    { $group: { _id: '$event', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    { $sort: { avg: -1 } },
    { $limit: 12 },
  ]);
  await Event.populate(rows, { path: '_id', select: 'title type date' });
  res.json(rows);
});
