// ---------- Member 1: Room (Hall) endpoints ----------
const express = require('express');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const router = express.Router();

// Check that every character in a string is a digit 0-9
function isAllDigits(str) {
  if (!str || str.length === 0) return false;
  for (let i = 0; i < str.length; i++) {
    if (str[i] < '0' || str[i] > '9') return false;
  }
  return true;
}

// Validate "YYYY-MM-DD" without regex
function isValidDate(str) {
  if (typeof str !== 'string' || str.length !== 10) return false;
  if (str[4] !== '-' || str[7] !== '-') return false;
  const parts = str.split('-');
  if (parts.length !== 3) return false;
  if (!isAllDigits(parts[0]) || !isAllDigits(parts[1]) || !isAllDigits(parts[2])) return false;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const check = new Date(year, month - 1, day);
  return check.getFullYear() === year && check.getMonth() === month - 1 && check.getDate() === day;
}

// Validate 24-hour "HH:mm" without regex
function isValidTime(str) {
  if (typeof str !== 'string' || str.length !== 5) return false;
  if (str[2] !== ':') return false;
  const parts = str.split(':');
  if (parts.length !== 2) return false;
  if (!isAllDigits(parts[0]) || !isAllDigits(parts[1])) return false;

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

// GET /api/rooms  -> all active halls sorted by floor then name
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ floorNumber: 1, name: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Could not load halls.' });
  }
});

// GET /api/rooms/free?date=&startTime=&endTime=  -> halls with no overlapping booked booking
router.get('/free', async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'date, startTime and endTime are required.' });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'Date must look like YYYY-MM-DD.' });
    }
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({ message: 'Time must look like HH:mm (24 hour).' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }

    const activeHalls = await Room.find({ isActive: true }).sort({ floorNumber: 1, name: 1 });
    const overlapping = await Booking.find({
      bookingDate: date,
      status: 'booked',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    // Collect IDs of halls that already have an overlapping booked slot
    const busyIds = [];
    for (let i = 0; i < overlapping.length; i++) {
      busyIds.push(String(overlapping[i].room));
    }

    const freeHalls = activeHalls.filter((hall) => !busyIds.includes(String(hall._id)));
    res.json(freeHalls);
  } catch (err) {
    res.status(500).json({ message: 'Could not check free halls.' });
  }
});

// POST /api/rooms  -> add a new hall
router.post('/', async (req, res) => {
  try {
    const { name, floorNumber, capacity, purpose, amenities, imageUrl } = req.body;

    if (!name || floorNumber === undefined || !capacity) {
      return res.status(400).json({ message: 'name, floorNumber and capacity are required.' });
    }

    const room = await Room.create({
      name,
      floorNumber,
      capacity,
      purpose: purpose || '',
      amenities: amenities || [],
      imageUrl: imageUrl || '',
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Could not create hall.' });
  }
});

module.exports = router;
