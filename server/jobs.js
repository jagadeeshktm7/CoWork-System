// ---------- Member 2: Scheduled background jobs (node-cron) ----------
const cron = require('node-cron');
const Booking = require('./models/Booking');
const { sendReminder } = require('./mailer');

// Pad a number to 2 digits
function pad2(n) {
  return String(n).padStart(2, '0');
}

// Return current local date ("YYYY-MM-DD") and time ("HH:mm")
function getLocalDateAndTime() {
  const now = new Date();
  const date = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  return { now, date, time };
}

// Parse "YYYY-MM-DD" and "HH:mm" into a local Date object
function toLocalDate(dateStr, timeStr) {
  const dParts = dateStr.split('-');
  const tParts = timeStr.split(':');
  const year = Number(dParts[0]);
  const month = Number(dParts[1]) - 1;
  const day = Number(dParts[2]);
  const hour = Number(tParts[0]);
  const minute = Number(tParts[1]);
  return new Date(year, month, day, hour, minute, 0, 0);
}

// Job 1: Every minute, send reminders for bookings starting in the next 60 minutes
async function runReminderJob() {
  try {
    const { now } = getLocalDateAndTime();
    const bookings = await Booking.find({ status: 'booked', reminderSent: false }).populate('room');
    let sentCount = 0;

    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const startObj = toLocalDate(booking.bookingDate, booking.startTime);
      const diffMinutes = (startObj.getTime() - now.getTime()) / 60000;

      if (diffMinutes >= 0 && diffMinutes <= 60) {
        await sendReminder(booking, booking.room);
        booking.reminderSent = true;
        await booking.save();
        sentCount += 1;
      }
    }

    if (sentCount > 0) {
      console.log(`Reminder job sent ${sentCount} reminder(s).`);
    }
  } catch (err) {
    console.error('Reminder job error:', err.message);
  }
}

// Job 2: Every 5 minutes, mark past bookings as completed
async function runCompletionJob() {
  try {
    const { date, time } = getLocalDateAndTime();
    const bookings = await Booking.find({ status: 'booked' });
    let updatedCount = 0;

    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const isPastDate = booking.bookingDate < date;
      const isEndedToday = booking.bookingDate === date && booking.endTime <= time;

      if (isPastDate || isEndedToday) {
        booking.status = 'completed';
        await booking.save();
        updatedCount += 1;
      }
    }

    if (updatedCount > 0) {
      console.log(`Completion job marked ${updatedCount} booking(s) as completed.`);
    }
  } catch (err) {
    console.error('Completion job error:', err.message);
  }
}

// Start both cron schedules after MongoDB connects
function startJobs() {
  cron.schedule('* * * * *', runReminderJob);
  cron.schedule('*/5 * * * *', runCompletionJob);
  console.log('Scheduled jobs started (reminders every 1m, auto-complete every 5m).');
}

module.exports = { startJobs, runReminderJob, runCompletionJob };
