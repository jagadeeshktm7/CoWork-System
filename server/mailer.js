// ---------- Member 2: Email notifications with Gmail SMTP (or console test mode) ----------
const nodemailer = require('nodemailer');

// Show Floor 0 as "Ground floor"
function formatFloorText(floorNumber) {
  if (floorNumber === 0) return 'Ground floor';
  return `Floor ${floorNumber}`;
}

// Build a plain-text summary of the booking
function buildBookingText(booking, room, introLine) {
  const hallName = room ? room.name : 'Hall';
  const floorText = room ? formatFloorText(room.floorNumber) : '';
  return [
    `Hello ${booking.bookedBy},`,
    '',
    introLine,
    '',
    `Title: ${booking.meetingTitle}`,
    `Event type: ${booking.eventType}`,
    `Hall: ${hallName}${floorText ? ' (' + floorText + ')' : ''}`,
    `Date: ${booking.bookingDate}`,
    `Time: ${booking.startTime} - ${booking.endTime}`,
    `Attendees: ${booking.attendees}`,
    '',
    'Thank you,',
    'CoWork Hall Booking System',
  ].join('\n');
}

// Send one email using Gmail SMTP, or log in EMAIL TEST MODE when credentials are empty
async function sendEmail(to, subject, text) {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.log('--- EMAIL TEST MODE ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(text);
      console.log('-----------------------');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: user,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    // Never fail a booking if email sending fails
    console.error('Email failed:', err.message);
  }
}

async function sendConfirmation(booking, room) {
  const hallName = room ? room.name : 'Hall';
  const subject = `Booking Confirmed: ${booking.meetingTitle} (${hallName})`;
  const text = buildBookingText(booking, room, 'Your hall booking has been confirmed.');
  await sendEmail(booking.bookedByEmail, subject, text);
}

async function sendUpdated(booking, room) {
  const hallName = room ? room.name : 'Hall';
  const subject = `Booking Updated: ${booking.meetingTitle} (${hallName})`;
  const text = buildBookingText(booking, room, 'Your hall booking details have been updated.');
  await sendEmail(booking.bookedByEmail, subject, text);
}

async function sendCancelled(booking, room) {
  const hallName = room ? room.name : 'Hall';
  const subject = `Booking Cancelled: ${booking.meetingTitle} (${hallName})`;
  const text = buildBookingText(booking, room, 'Your hall booking has been cancelled.');
  await sendEmail(booking.bookedByEmail, subject, text);
}

async function sendReminder(booking, room) {
  const hallName = room ? room.name : 'Hall';
  const subject = `Reminder: ${booking.meetingTitle} starts soon (${hallName})`;
  const text = buildBookingText(booking, room, 'Reminder: your hall booking starts within the next 60 minutes.');
  await sendEmail(booking.bookedByEmail, subject, text);
}

module.exports = {
  sendEmail,
  sendConfirmation,
  sendUpdated,
  sendCancelled,
  sendReminder,
};
