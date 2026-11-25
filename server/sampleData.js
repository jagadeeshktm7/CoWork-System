// ---------- Member 1: Insert demo bookings (run with: npm run seed:demo) ----------
require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

// Pad a number to 2 digits (e.g. 4 -> "04")
function pad2(n) {
  return String(n).padStart(2, '0');
}

// Get a local date string "YYYY-MM-DD" offset by days from today
function getDateOffset(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${year}-${month}-${day}`;
}

// Find a hall's _id by its exact name
function findHallId(halls, name) {
  const hall = halls.find((h) => h.name === name);
  return hall ? hall._id : null;
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const halls = await Room.find({ isActive: true });
    if (halls.length === 0) {
      console.log('No halls found. Run "npm run seed" first.');
      process.exit(1);
    }

    // Build 20 sample bookings across the last 7 days and next 3 days (no emails sent)
    const sampleBookings = [
      {
        room: findHallId(halls, 'Seminar Hall'),
        bookedBy: 'Aarav Sharma',
        bookedByEmail: 'student1@example.com',
        eventType: 'Seminar',
        attendees: 85,
        bookingDate: getDateOffset(-6),
        startTime: '10:00',
        endTime: '12:00',
        meetingTitle: 'AI Career Orientation',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Meeting Hall 1'),
        bookedBy: 'Priya Nair',
        bookedByEmail: 'student2@example.com',
        eventType: 'Meeting',
        attendees: 14,
        bookingDate: getDateOffset(-6),
        startTime: '14:00',
        endTime: '15:30',
        meetingTitle: 'Robotics Club Planning',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Sports Hall'),
        bookedBy: 'Rohan Verma',
        bookedByEmail: 'student3@example.com',
        eventType: 'Sports',
        attendees: 32,
        bookingDate: getDateOffset(-5),
        startTime: '16:00',
        endTime: '18:00',
        meetingTitle: 'Inter-Dept Badminton Practice',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Discussion Hall'),
        bookedBy: 'Sneha Patel',
        bookedByEmail: 'student4@example.com',
        eventType: 'Discussion',
        attendees: 10,
        bookingDate: getDateOffset(-5),
        startTime: '11:00',
        endTime: '12:30',
        meetingTitle: 'Book Club Chapter Review',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Canteen Hall'),
        bookedBy: 'Karthik Rao',
        bookedByEmail: 'student5@example.com',
        eventType: 'Birthday',
        attendees: 35,
        bookingDate: getDateOffset(-4),
        startTime: '17:00',
        endTime: '19:00',
        meetingTitle: 'Ananya Birthday Celebration',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Presentation Hall'),
        bookedBy: 'Meera Iyer',
        bookedByEmail: 'student6@example.com',
        eventType: 'Presentation',
        attendees: 28,
        bookingDate: getDateOffset(-4),
        startTime: '09:30',
        endTime: '11:30',
        meetingTitle: 'Mini Project Demo Day',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Terrace'),
        bookedBy: 'Vikram Joshi',
        bookedByEmail: 'student7@example.com',
        eventType: 'Party',
        attendees: 65,
        bookingDate: getDateOffset(-3),
        startTime: '18:00',
        endTime: '20:00',
        meetingTitle: 'Freshers Welcome Evening',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Seminar Hall'),
        bookedBy: 'Divya Menon',
        bookedByEmail: 'student8@example.com',
        eventType: 'Seminar',
        attendees: 90,
        bookingDate: getDateOffset(-2),
        startTime: '10:00',
        endTime: '12:00',
        meetingTitle: 'Cloud Computing Guest Talk',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Discussion Hall'),
        bookedBy: 'Arjun Reddy',
        bookedByEmail: 'student9@example.com',
        eventType: 'Discussion',
        attendees: 12,
        bookingDate: getDateOffset(-2),
        startTime: '15:00',
        endTime: '16:30',
        meetingTitle: 'Hackathon Team Brainstorm',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Meeting Hall 1'),
        bookedBy: 'Neha Gupta',
        bookedByEmail: 'student10@example.com',
        eventType: 'Other',
        attendees: 16,
        bookingDate: getDateOffset(-1),
        startTime: '11:00',
        endTime: '12:00',
        meetingTitle: 'Cultural Fest Volunteer Briefing',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Presentation Hall'),
        bookedBy: 'Aarav Sharma',
        bookedByEmail: 'student1@example.com',
        eventType: 'Presentation',
        attendees: 30,
        bookingDate: getDateOffset(-1),
        startTime: '14:00',
        endTime: '15:30',
        meetingTitle: 'Design Sprint Showcase',
        status: 'completed',
      },
      {
        room: findHallId(halls, 'Sports Hall'),
        bookedBy: 'Rohan Verma',
        bookedByEmail: 'student3@example.com',
        eventType: 'Sports',
        attendees: 40,
        bookingDate: getDateOffset(-1),
        startTime: '17:00',
        endTime: '18:30',
        meetingTitle: 'Table Tennis Warmup',
        status: 'cancelled',
      },
      {
        room: findHallId(halls, 'Seminar Hall'),
        bookedBy: 'Priya Nair',
        bookedByEmail: 'student2@example.com',
        eventType: 'Seminar',
        attendees: 75,
        bookingDate: getDateOffset(1),
        startTime: '10:00',
        endTime: '11:30',
        meetingTitle: 'Open Source Contribution Workshop',
        status: 'booked',
      },
      {
        room: findHallId(halls, 'Meeting Hall 1'),
        bookedBy: 'Sneha Patel',
        bookedByEmail: 'student4@example.com',
        eventType: 'Meeting',
        attendees: 15,
        bookingDate: getDateOffset(1),
        startTime: '12:00',
        endTime: '13:00',
        meetingTitle: 'Student Council Sync',
        status: 'booked',
      },
      {
        room: findHallId(halls, 'Canteen Hall'),
        bookedBy: 'Karthik Rao',
        bookedByEmail: 'student5@example.com',
        eventType: 'Birthday',
        attendees: 40,
        bookingDate: getDateOffset(1),
        startTime: '16:00',
        endTime: '18:00',
        meetingTitle: 'Final Year Farewell Tea',
        status: 'booked',
      },
      {
        room: findHallId(halls, 'Sports Hall'),
        bookedBy: 'Rohan Verma',
        bookedByEmail: 'student3@example.com',
        eventType: 'Sports',
        attendees: 50,
        bookingDate: getDateOffset(2),
        startTime: '09:00',
        endTime: '11:00',
        meetingTitle: 'Basketball Friendly Match',
        status: 'booked',
      },
      {
        room: findHallId(halls, 'Discussion Hall'),
        bookedBy: 'Meera Iyer',
        bookedByEmail: 'student6@example.com',
        eventType: 'Discussion',
        attendees: 14,
        bookingDate: getDateOffset(2),
        startTime: '13:00',
        endTime: '14:30',
        meetingTitle: 'Research Paper Study Group',
        status: 'booked',
      },
      {
        room: findHallId(halls, 'Presentation Hall'),
        bookedBy: 'Divya Menon',
        bookedByEmail: 'student8@example.com',
        eventType: 'Presentation',
        attendees: 35,
        bookingDate: getDateOffset(2),
        startTime: '15:00',
        endTime: '16:30',
        meetingTitle: 'Capstone Progress Review',
        status: 'cancelled',
      },
      {
        room: findHallId(halls, 'Terrace'),
        bookedBy: 'Vikram Joshi',
        bookedByEmail: 'student7@example.com',
        eventType: 'Party',
        attendees: 70,
        bookingDate: getDateOffset(3),
        startTime: '17:30',
        endTime: '19:30',
        meetingTitle: 'Music Club Acoustic Night',
        status: 'booked',
      },
      {
        room: findHallId(halls, 'Seminar Hall'),
        bookedBy: 'Arjun Reddy',
        bookedByEmail: 'student9@example.com',
        eventType: 'Other',
        attendees: 60,
        bookingDate: getDateOffset(3),
        startTime: '11:00',
        endTime: '13:00',
        meetingTitle: 'Placement Prep Q&A Session',
        status: 'booked',
      },
    ];

    // Keep only entries whose hall was found
    const validBookings = sampleBookings.filter((b) => b.room !== null);
    await Booking.insertMany(validBookings);
    console.log(`Inserted ${validBookings.length} sample bookings (no emails sent).`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Demo seed failed:', err.message);
    process.exit(1);
  });
