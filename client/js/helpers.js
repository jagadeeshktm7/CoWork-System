// ---------- Member 4: Shared React hooks, API calls, and date/time helpers ----------
const { useState, useEffect } = React;

const API = 'http://localhost:5000/api';

const EVENT_TYPES = [
  'Meeting',
  'Seminar',
  'Discussion',
  'Presentation',
  'Sports',
  'Birthday',
  'Party',
  'Other',
];

const TIMETABLE_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

// Pad a single digit number to two digits (e.g. 8 -> "08")
function padTwo(num) {
  return String(num).padStart(2, '0');
}

// Get today's local date as "YYYY-MM-DD" without toISOString
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = padTwo(now.getMonth() + 1);
  const day = padTwo(now.getDate());
  return `${year}-${month}-${day}`;
}

// Get current local time as "HH:mm"
function getCurrentTime() {
  const now = new Date();
  return `${padTwo(now.getHours())}:${padTwo(now.getMinutes())}`;
}

// Add 1 hour to an "HH:mm" string (capped at "23:59")
function addOneHour(timeStr) {
  const parts = timeStr.split(':');
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (hour >= 23) return '23:59';
  return `${padTwo(hour + 1)}:${padTwo(minute)}`;
}

// Add or subtract days on a "YYYY-MM-DD" string using local time
function addDaysToDate(dateStr, days) {
  const parts = dateStr.split('-');
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())}`;
}

// Show floor 0 as "Ground floor"
function formatFloor(floorNumber) {
  if (floorNumber === 0) return 'Ground floor';
  return `Floor ${floorNumber}`;
}

// Find the largest count in a list of { count } items for bar width scaling
function getMaxBarCount(items) {
  let max = 1;
  for (let i = 0; i < items.length; i++) {
    if (items[i].count > max) {
      max = items[i].count;
    }
  }
  return max;
}

// ---------- Axios API calls ----------
async function getRooms() {
  const res = await axios.get(`${API}/rooms`);
  return res.data;
}

async function getFreeRooms(date, startTime, endTime) {
  const res = await axios.get(`${API}/rooms/free`, {
    params: { date, startTime, endTime },
  });
  return res.data;
}

async function getBookings(params) {
  const res = await axios.get(`${API}/bookings`, { params });
  return res.data;
}

async function createBooking(data) {
  const res = await axios.post(`${API}/bookings`, data);
  return res.data;
}

async function updateBooking(id, data) {
  const res = await axios.put(`${API}/bookings/${id}`, data);
  return res.data;
}

async function cancelBooking(id) {
  const res = await axios.delete(`${API}/bookings/${id}`);
  return res.data;
}

async function getDashboardStats() {
  const res = await axios.get(`${API}/dashboard/stats`);
  return res.data;
}
