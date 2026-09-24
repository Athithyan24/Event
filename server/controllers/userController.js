const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');
const { logActivity } = require('../utils/audit');

exports.list = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.department) query.department = req.query.department;
  const users = await User.find(query).populate('department', 'name code color').sort({ createdAt: -1 });
  res.json(users.map((u) => u.toSafeJSON()));
});

exports.create = asyncHandler(async (req, res) => {
  const { name, username, email, password, role, department, phone } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'Name, username, email and password are required' });
  }
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) return res.status(409).json({ message: 'Email or username already in use' });
  const user = await User.create({ name, username, email, password, role: role || 'department', department, phone });
  await logActivity({ actor: req.user._id, action: 'Created user', entity: 'user', entityId: String(user._id) });
  const populated = await User.findById(user._id).populate('department', 'name code');
  res.status(201).json(populated.toSafeJSON());
});

exports.update = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  delete payload.password;
  const user = await User.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).populate(
    'department',
    'name code'
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (req.body.password) {
    const withPass = await User.findById(user._id).select('+password');
    withPass.password = req.body.password;
    await withPass.save();
  }
  res.json(user.toSafeJSON());
});

exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.toSafeJSON());
});
