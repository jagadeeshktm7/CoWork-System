// ---------- Member 1: Booking database model ----------
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    bookedBy: { type: String, required: true, trim: true },
    bookedByEmail: { type: String, required: true, trim: true },
    eventType: {
      type: String,
      enum: ['Meeting', 'Seminar', 'Discussion', 'Presentation', 'Sports', 'Birthday', 'Party', 'Other'],
      required: true,
    },
    attendees: { type: Number, required: true, min: 1 },
    bookingDate: { type: String, required: true },   // "YYYY-MM-DD"
    startTime: { type: String, required: true },     // "HH:mm" (24 hour)
    endTime: { type: String, required: true },       // "HH:mm" (24 hour)
    meetingTitle: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['booked', 'cancelled', 'completed'],
      default: 'booked',
    },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
