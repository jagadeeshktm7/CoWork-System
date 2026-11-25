// ---------- Member 1: Seed the 7 halls (run with: npm run seed) ----------
require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const halls = [
  {
    name: 'Canteen Hall',
    floorNumber: 0,
    capacity: 50,
    purpose: 'Birthday events and small celebrations',
    amenities: ['Tables', 'Sound System'],
    imageUrl: '/images/canteen-hall.JPG',
  },
  {
    name: 'Sports Hall',
    floorNumber: 0,
    capacity: 60,
    purpose: 'Indoor games and practice',
    amenities: ['Indoor Courts', 'Lockers'],
    imageUrl: '/images/sports-hall.jpg',
  },
  {
    name: 'Meeting Hall 1',
    floorNumber: 1,
    capacity: 20,
    purpose: 'Team meetings',
    amenities: ['TV', 'Whiteboard'],
    imageUrl: '/images/meeting-hall-1.jpg',
  },
  {
    name: 'Discussion Hall',
    floorNumber: 2,
    capacity: 15,
    purpose: 'Group discussions',
    amenities: ['Whiteboard', 'Projector'],
    imageUrl: '/images/discussion-hall.jpg',
  },
  {
    name: 'Seminar Hall',
    floorNumber: 2,
    capacity: 100,
    purpose: 'Seminars and guest talks',
    amenities: ['Projector', 'Microphone', 'AC'],
    imageUrl: '/images/seminar-hall.jpg',
  },
  {
    name: 'Presentation Hall',
    floorNumber: 3,
    capacity: 40,
    purpose: 'Presentations and project reviews',
    amenities: ['Projector', 'Microphone', 'Video Conference'],
    imageUrl: '/images/presentation-hall.jpg',
  },
  {
    name: 'Terrace',
    floorNumber: 4,
    capacity: 80,
    purpose: 'Parties and get-togethers',
    amenities: ['Open Air', 'Sound System', 'Lights'],
    imageUrl: '/images/terrace.jpg',
  },
];

// Connect to MongoDB, clear old bookings and halls, and insert the 7 halls
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Booking.deleteMany({});
    await Room.deleteMany({});
    await Room.insertMany(halls);
    console.log(`Cleared old bookings and added ${halls.length} halls.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
