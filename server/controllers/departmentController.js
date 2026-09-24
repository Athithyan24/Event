const Department = require('../models/Department');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');
const { logActivity } = require('../utils/audit');

exports.list = asyncHandler(async (req, res) => {
  const items = await Department.find().sort({ name: 1 });
  res.json(items);
});

exports.create = asyncHandler(async (req, res) => {
  const item = await Department.create(req.body);
  await logActivity({ actor: req.user._id, action: 'Created department', entity: 'department', entityId: String(item._id) });
  res.status(201).json(item);
});

exports.update = asyncHandler(async (req, res) => {
  const item = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Department not found' });
  res.json(item);
});

exports.remove = asyncHandler(async (req, res) => {
  const item = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!item) return res.status(404).json({ message: 'Department not found' });
  res.json(item);
});

exports.assignUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.body.userId,
    { department: req.params.id },
    { new: true }
  ).populate('department', 'name code');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.toSafeJSON());
});
