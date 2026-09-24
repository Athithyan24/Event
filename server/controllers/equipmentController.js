const Equipment = require('../models/Equipment');
const EquipmentAllocation = require('../models/EquipmentAllocation');
const { asyncHandler } = require('../middleware/error');
const { equipmentAvailability } = require('../utils/availability');
const { logActivity } = require('../utils/audit');

exports.list = asyncHandler(async (req, res) => {
  const items = await Equipment.find().sort({ name: 1 });
  res.json(items);
});

exports.create = asyncHandler(async (req, res) => {
  const item = await Equipment.create(req.body);
  await logActivity({ actor: req.user._id, action: 'Added equipment', entity: 'equipment', entityId: String(item._id) });
  res.status(201).json(item);
});

exports.update = asyncHandler(async (req, res) => {
  const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Equipment not found' });
  res.json(item);
});

exports.remove = asyncHandler(async (req, res) => {
  await Equipment.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

exports.check = asyncHandler(async (req, res) => {
  const { items, date, startTime, endTime, excludeEventId } = req.body;
  const results = [];
  for (const row of items || []) {
    const r = await equipmentAvailability({
      Equipment,
      EquipmentAllocation,
      itemId: row.item,
      quantity: Number(row.quantity),
      date,
      startTime,
      endTime,
      excludeEventId,
    });
    results.push({ item: row.item, ...r });
  }
  const ok = results.every((r) => r.ok);
  res.json({ ok, results });
});

exports.matrix = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  date.setHours(0, 0, 0, 0);
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  const items = await Equipment.find({ status: 'active' }).sort({ name: 1 });
  const allocs = await EquipmentAllocation.find({
    date: { $gte: date, $lt: next },
    status: 'reserved',
  }).populate('event', 'title startTime endTime');

  const matrix = items.map((item) => {
    const used = allocs
      .filter((a) => String(a.equipment) === String(item._id))
      .reduce((s, a) => s + a.quantity, 0);
    return {
      item,
      reserved: used,
      remaining: item.totalQuantity - used,
      allocations: allocs.filter((a) => String(a.equipment) === String(item._id)),
    };
  });
  res.json({ date, matrix });
});
