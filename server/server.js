// ---------- Member 1: Entry point of the backend ----------
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { startJobs } = require('./jobs');

const app = express();

app.use(cors());
app.use(express.json());

// Serve the plain HTML/CSS/JS client folder
app.use(express.static(path.join(__dirname, '..', 'client')));

// API Routes
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Connect to MongoDB, start cron jobs, then start the server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    startJobs();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
