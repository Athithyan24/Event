const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed (npm install bcrypt)
const User = require('./models/User'); // Adjust path to your User.js if necessary
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder Imports
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

// API Endpoint Setup
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/resources', resourceRoutes);

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_planner';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    // --- Default Admin Seeding Logic ---
    try {
      const adminExists = await User.findOne({ email: 'admin@college.edu' });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
          name: 'System Admin',
          email: 'admin@college.edu',
          password: hashedPassword,
          role: 'Admin'
        });
        console.log('Default Admin user created: admin@college.edu / admin123');
      }
    } catch (seedErr) {
      console.error('Error seeding admin user:', seedErr);
    }
    // -----------------------------------

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));