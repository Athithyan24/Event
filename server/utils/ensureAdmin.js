const User = require('../models/User');

const DEFAULT_ADMIN = {
  name: 'Aanya Sharma',
  username: 'admin',
  email: 'admin@aura.edu',
  password: 'Aura@123',
};

async function ensureAdmin() {
  const admin = {
    name: process.env.ADMIN_NAME || DEFAULT_ADMIN.name,
    username: process.env.ADMIN_USERNAME || DEFAULT_ADMIN.username,
    email: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN.email).toLowerCase(),
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN.password,
  };

  const existing = await User.findOne({ email: admin.email }).select('+password');
  if (existing) {
    console.log(`Admin account ready: ${admin.email}`);
    return existing;
  }

  const created = await User.create({ ...admin, role: 'admin' });
  console.log(`Admin account created: ${created.email}`);
  return created;
}

module.exports = { ensureAdmin };