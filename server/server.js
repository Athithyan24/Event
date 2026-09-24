const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { errorHandler } = require('./middleware/error');
const { ensureAdmin } = require('./utils/ensureAdmin');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'Aura Events API' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/venues', require('./routes/venueRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aura_events';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await ensureAdmin();
    app.listen(PORT, () => console.log(`Aura API running on ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed', err);
    process.exit(1);
  });
