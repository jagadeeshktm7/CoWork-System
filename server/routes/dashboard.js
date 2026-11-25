// ---------- Member 1: Dashboard statistics endpoint ----------
const express = require('express');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const router = express.Router();

const EVENT_TYPES = ['Meeting', 'Seminar', 'Discussion', 'Presentation', 'Sports', 'Birthday', 'Party', 'Other'];

// Pad a number to 2 digits
function pad2(n) {
  return String(n).padStart(2, '0');
}

// Get a local date string "YYYY-MM-DD" offset by days from today
function getLocalDateString(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Get current local time "HH:mm"
function getLocalTimeString() {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ floorNumber: 1, name: 1 });
    const bookings = await Booking.find().populate('room', 'name floorNumber');

    const today = getLocalDateString(0);
    const nowTime = getLocalTimeString();

    let bookingsToday = 0;
    let upcomingBookings = 0;
    let cancelledBookings = 0;
    let completedBookings = 0;

    // Prepare hall counts initialized to 0 for every active hall
    const bookingsPerHall = [];
    for (let i = 0; i < rooms.length; i++) {
      bookingsPerHall.push({ name: rooms[i].name, count: 0 });
    }

    // Prepare last 7 days initialized to 0
    const last7Days = [];
    for (let offset = -6; offset <= 0; offset++) {
      last7Days.push({ date: getLocalDateString(offset), count: 0 });
    }

    // Prepare event type counts initialized to 0
    const eventTypeCounts = [];
    for (let i = 0; i < EVENT_TYPES.length; i++) {
      eventTypeCounts.push({ eventType: EVENT_TYPES[i], count: 0 });
    }

    // Track halls that are busy right now
    const busyRightNowIds = [];

    // Count everything using simple loops
    for (let i = 0; i < bookings.length; i++) {
      const b = bookings[i];

      if (b.status === 'cancelled') {
        cancelledBookings += 1;
      } else {
        if (b.status === 'completed') {
          completedBookings += 1;
        }
        if (b.bookingDate === today) {
          bookingsToday += 1;
        }
        if (b.status === 'booked') {
          const isFuture = b.bookingDate > today || (b.bookingDate === today && b.endTime > nowTime);
          if (isFuture) {
            upcomingBookings += 1;
          }
          const isHappeningNow = b.bookingDate === today && b.startTime <= nowTime && b.endTime > nowTime;
          if (isHappeningNow && b.room) {
            const roomId = String(b.room._id);
            if (!busyRightNowIds.includes(roomId)) {
              busyRightNowIds.push(roomId);
            }
          }
        }

        // Add to bookingsPerHall
        if (b.room) {
          for (let j = 0; j < bookingsPerHall.length; j++) {
            if (bookingsPerHall[j].name === b.room.name) {
              bookingsPerHall[j].count += 1;
            }
          }
        }

        // Add to last7Days
        for (let j = 0; j < last7Days.length; j++) {
          if (last7Days[j].date === b.bookingDate) {
            last7Days[j].count += 1;
          }
        }

        // Add to eventTypeCounts
        for (let j = 0; j < eventTypeCounts.length; j++) {
          if (eventTypeCounts[j].eventType === b.eventType) {
            eventTypeCounts[j].count += 1;
          }
        }
      }
    }

    // Find busiest hall
    let busiestHall = { name: 'None yet', count: 0 };
    for (let i = 0; i < bookingsPerHall.length; i++) {
      if (bookingsPerHall[i].count > busiestHall.count) {
        busiestHall = { name: bookingsPerHall[i].name, count: bookingsPerHall[i].count };
      }
    }

    const totalHalls = rooms.length;
    const freeHallsNow = totalHalls - busyRightNowIds.length;

    res.json({
      totalHalls,
      bookingsToday,
      upcomingBookings,
      cancelledBookings,
      completedBookings,
      freeHallsNow,
      busiestHall,
      bookingsPerHall,
      last7Days,
      eventTypeCounts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not load dashboard stats.' });
  }
});

module.exports = router;
