const User = require('../models/User');
const { signToken } = require('../utils/token');
const { logActivity } = require('../utils/audit');
const { asyncHandler } = require('../middleware/error');

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({ email: String(email).toLowerCase() })
    .select('+password')
    .populate('department', 'name code color');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: 'This account has been deactivated' });
  }
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  await logActivity({ actor: user._id, action: 'Signed in', entity: 'user', entityId: String(user._id) });
  res.json({ token: signToken(user), user: user.toSafeJSON() });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON ? req.user.toSafeJSON() : req.user });
});

exports.register = asyncHandler(async (req, res) => {
  return res.status(403).json({
    message: 'Accounts are created by an administrator. Use the demo credentials or ask admin.',
  });
});
