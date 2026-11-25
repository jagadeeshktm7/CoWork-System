// ---------- Member 1: Room (Hall) database model ----------
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },       // e.g. "Seminar Hall"
  floorNumber: { type: Number, required: true },            // 0 = Ground floor
  capacity: { type: Number, required: true, min: 1 },
  purpose: { type: String, default: '', trim: true },
  amenities: { type: [String], default: [] },               // e.g. ["Projector", "Microphone"]
  imageUrl: { type: String, default: '' },                  // e.g. "/images/seminar-hall.svg"
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Room', roomSchema);
