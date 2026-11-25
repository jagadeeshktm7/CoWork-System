// ---------- Member 2: Booking endpoints + collision detection + email ----------
const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { sendConfirmation, sendUpdated, sendCancelled } = require('../mailer');

const router = express.Router();

const EVENT_TYPES = ['Meeting', 'Seminar', 'Discussion', 'Presentation', 'Sports', 'Birthday', 'Party', 'Other'];

// Pad a number to 2 digits
function pad2(n) {
  return String(n).padStart(2, '0');
}

// Get current local date and time as strings
function getLocalNow() {
  const now = new Date();
  const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  return { today, time };
}

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

// Simple email check without regex: must have @ and a dot after @
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.includes(' ')) return false;
  const atIndex = trimmed.indexOf('@');
  const dotIndex = trimmed.lastIndexOf('.');
  return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < trimmed.length - 1;
}

// Check if bookingDate + startTime is in the past
function isInPast(bookingDate, startTime) {
  const now = getLocalNow();
  if (bookingDate < now.today) return true;
  if (bookingDate === now.today && startTime < now.time) return true;
  return false;
}

// GET /api/bookings?date=&bookedBy=&bookedByEmail=&room=&status=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.bookingDate = req.query.date;
    if (req.query.room) filter.room = req.query.room;
    if (req.query.status) filter.status = req.query.status;

    let bookings = await Booking.find(filter)
      .populate('room', 'name floorNumber capacity')
      .sort({ bookingDate: 1, startTime: 1 });

    // Optional name or email filtering (case-insensitive, without regex)
    if (req.query.bookedBy) {
      const targetName = req.query.bookedBy.trim().toLowerCase();
      bookings = bookings.filter((b) => b.bookedBy.toLowerCase() === targetName);
    }
    if (req.query.bookedByEmail) {
      const targetEmail = req.query.bookedByEmail.trim().toLowerCase();
      bookings = bookings.filter((b) => b.bookedByEmail.toLowerCase() === targetEmail);
    }

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Could not load bookings.' });
  }
});

// POST /api/bookings  -> create a booking (with validation, collision check, email)
router.post('/', async (req, res) => {
  try {
    const {
      room,
      bookedBy,
      bookedByEmail,
      eventType,
      attendees,
      bookingDate,
      startTime,
      endTime,
      meetingTitle,
    } = req.body;

    // 1. All fields required
    if (
      !room ||
      !bookedBy ||
      !bookedByEmail ||
      !eventType ||
      attendees === undefined ||
      attendees === '' ||
      !bookingDate ||
      !startTime ||
      !endTime ||
      !meetingTitle
    ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!String(bookedBy).trim() || !String(meetingTitle).trim()) {
      return res.status(400).json({ message: 'Name and meeting title are required.' });
    }

    // 2. Email, event type, date and time checks
    if (!isValidEmail(bookedByEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({ message: 'Please select a valid event type.' });
    }
    if (!isValidDate(bookingDate)) {
      return res.status(400).json({ message: 'Date must look like YYYY-MM-DD.' });
    }
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({ message: 'Time must look like HH:mm (24 hour).' });
    }

    // 3. Start before end & not in the past
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }
    if (isInPast(bookingDate, startTime)) {
      return res.status(400).json({ message: 'Booking cannot be in the past.' });
    }

    // 4. Hall must exist and attendees must fit
    const roomExists = await Room.findOne({ _id: room, isActive: true });
    if (!roomExists) {
      return res.status(404).json({ message: 'Hall not found.' });
    }

    const peopleCount = Number(attendees);
    if (Number.isNaN(peopleCount) || peopleCount < 1) {
      return res.status(400).json({ message: 'Attendees must be at least 1.' });
    }
    if (peopleCount > roomExists.capacity) {
      return res.status(400).json({ message: `This hall seats only ${roomExists.capacity} people.` });
    }

    // 5. COLLISION DETECTION (only against status "booked"; back-to-back is allowed)
    const conflict = await Booking.findOne({
      room,
      bookingDate,
      status: 'booked',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return res
        .status(409)
        .json({ message: 'This room is already reserved for the selected time slot.' });
    }

    // 6. Save and send confirmation email
    const booking = await Booking.create({
      room,
      bookedBy: String(bookedBy).trim(),
      bookedByEmail: String(bookedByEmail).trim().toLowerCase(),
      eventType,
      attendees: peopleCount,
      bookingDate,
      startTime,
      endTime,
      meetingTitle: String(meetingTitle).trim(),
      status: 'booked',
      reminderSent: false,
    });

    await sendConfirmation(booking, roomExists);
    const saved = await Booking.findById(booking._id).populate('room', 'name floorNumber capacity');
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Could not create booking.' });
  }
});

// PUT /api/bookings/:id  -> edit an active ("booked") booking
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    if (booking.status !== 'booked') {
      return res.status(400).json({ message: 'Only active booked reservations can be edited.' });
    }

    const { meetingTitle, eventType, attendees, bookingDate, startTime, endTime } = req.body;

    if (
      !meetingTitle ||
      !eventType ||
      attendees === undefined ||
      attendees === '' ||
      !bookingDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!String(meetingTitle).trim()) {
      return res.status(400).json({ message: 'Meeting title is required.' });
    }
    if (!EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({ message: 'Please select a valid event type.' });
    }
    if (!isValidDate(bookingDate)) {
      return res.status(400).json({ message: 'Date must look like YYYY-MM-DD.' });
    }
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({ message: 'Time must look like HH:mm (24 hour).' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }
    if (isInPast(bookingDate, startTime)) {
      return res.status(400).json({ message: 'Booking cannot be in the past.' });
    }

    const roomExists = await Room.findOne({ _id: booking.room, isActive: true });
    if (!roomExists) {
      return res.status(404).json({ message: 'Hall not found.' });
    }

    const peopleCount = Number(attendees);
    if (Number.isNaN(peopleCount) || peopleCount < 1) {
      return res.status(400).json({ message: 'Attendees must be at least 1.' });
    }
    if (peopleCount > roomExists.capacity) {
      return res.status(400).json({ message: `This hall seats only ${roomExists.capacity} people.` });
    }

    // Collision check ignores the booking itself
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      room: booking.room,
      bookingDate,
      status: 'booked',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return res
        .status(409)
        .json({ message: 'This room is already reserved for the selected time slot.' });
    }

    booking.meetingTitle = String(meetingTitle).trim();
    booking.eventType = eventType;
    booking.attendees = peopleCount;
    booking.bookingDate = bookingDate;
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.reminderSent = false;
    await booking.save();

    await sendUpdated(booking, roomExists);
    const updated = await Booking.findById(booking._id).populate('room', 'name floorNumber capacity');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Could not update booking.' });
  }
});

// DELETE /api/bookings/:id  -> mark status "cancelled" (keep history)
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const roomDoc = await Room.findById(booking.room);
    await sendCancelled(booking, roomDoc);

    res.json({ message: 'Booking cancelled.', booking });
  } catch (err) {
    res.status(500).json({ message: 'Could not cancel booking.' });
  }
});

module.exports = router;
