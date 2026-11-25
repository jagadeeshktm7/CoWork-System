// ---------- Member 3: Pop-up booking form for creating and editing a booking ----------
function BookingForm(props) {
  const existing = props.booking;
  const isEdit = Boolean(existing);
  const hall = props.room || (existing ? existing.room : null);

  // Separate useState for each form field
  const [bookedBy, setBookedBy] = useState(
    existing ? existing.bookedBy : props.userName || ''
  );
  const [bookedByEmail, setBookedByEmail] = useState(
    existing ? existing.bookedByEmail : props.userEmail || ''
  );
  const [eventType, setEventType] = useState(
    existing ? existing.eventType : 'Meeting'
  );
  const [meetingTitle, setMeetingTitle] = useState(
    existing ? existing.meetingTitle : ''
  );
  const [attendees, setAttendees] = useState(
    existing ? String(existing.attendees) : '1'
  );
  const [bookingDate, setBookingDate] = useState(
    existing ? existing.bookingDate : props.initialDate || getTodayDate()
  );
  const [startTime, setStartTime] = useState(
    existing ? existing.startTime : props.initialStartTime || '10:00'
  );
  const [endTime, setEndTime] = useState(
    existing ? existing.endTime : props.initialEndTime || '11:00'
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Browser checks before calling the server
  function validateForm() {
    if (!bookedBy.trim()) return 'Enter your name.';
    if (!bookedByEmail.trim()) return 'Enter your email address.';
    if (!bookedByEmail.includes('@') || !bookedByEmail.includes('.')) {
      return 'Enter a valid email address with @ and a dot.';
    }
    if (!eventType) return 'Select an event type.';
    if (!meetingTitle.trim()) return 'Enter a title for the booking.';

    const count = Number(attendees);
    if (!attendees || Number.isNaN(count) || count < 1) {
      return 'Attendees must be at least 1.';
    }
    if (hall && hall.capacity && count > hall.capacity) {
      return `This hall seats only ${hall.capacity} people.`;
    }

    if (!bookingDate) return 'Choose a date.';
    if (!startTime || !endTime) return 'Choose a start and end time.';
    if (startTime >= endTime) return 'End time must be after start time.';

    const today = getTodayDate();
    const nowTime = getCurrentTime();
    if (bookingDate < today || (bookingDate === today && startTime < nowTime)) {
      return 'Booking cannot be in the past.';
    }

    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validateForm();
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateBooking(existing._id, {
          meetingTitle: meetingTitle.trim(),
          eventType,
          attendees: Number(attendees),
          bookingDate,
          startTime,
          endTime,
        });
      } else {
        await createBooking({
          room: hall._id,
          bookedBy: bookedBy.trim(),
          bookedByEmail: bookedByEmail.trim(),
          eventType,
          attendees: Number(attendees),
          bookingDate,
          startTime,
          endTime,
          meetingTitle: meetingTitle.trim(),
        });
      }

      // Save name and email in localStorage and refresh lists
      localStorage.setItem('userName', bookedBy.trim());
      localStorage.setItem('userEmail', bookedByEmail.trim());
      const hallLabel = hall ? hall.name : 'the hall';
      const successText = isEdit
        ? `Your booking "${meetingTitle.trim()}" was updated!`
        : `Your booking was confirmed for ${hallLabel} on ${bookingDate} (${startTime}-${endTime})!`;
      props.onSaved(bookedBy.trim(), bookedByEmail.trim(), successText);
    } catch (err) {
      const status = err.response && err.response.status;
      const serverMsg = err.response && err.response.data && err.response.data.message;
      if (status === 409) {
        setError('This room is already reserved for the selected time slot.');
      } else {
        setError(serverMsg || 'Something went wrong. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={props.onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{isEdit ? 'Edit Booking' : `Book ${hall ? hall.name : 'Hall'}`}</h2>
        {hall && (
          <p className="meta">
            {hall.name}
            {hall.floorNumber !== undefined ? ` - ${formatFloor(hall.floorNumber)}` : ''}
            {hall.capacity ? ` - Seats ${hall.capacity}` : ''}
          </p>
        )}

        {error && <p className="banner error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="booking-name">
            Your name
            <input
              id="booking-name"
              name="bookedBy"
              type="text"
              value={bookedBy}
              disabled={isEdit}
              onChange={(e) => setBookedBy(e.target.value)}
            />
          </label>

          <label htmlFor="booking-email">
            Your email
            <input
              id="booking-email"
              name="bookedByEmail"
              type="email"
              value={bookedByEmail}
              disabled={isEdit}
              onChange={(e) => setBookedByEmail(e.target.value)}
            />
          </label>

          <div className="row">
            <label htmlFor="booking-event-type">
              Event type
              <select
                id="booking-event-type"
                name="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                {EVENT_TYPES.map((typeName) => (
                  <option key={typeName} value={typeName}>
                    {typeName}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="booking-attendees">
              Attendees
              <input
                id="booking-attendees"
                name="attendees"
                type="number"
                min="1"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </label>
          </div>

          <label htmlFor="booking-title">
            Event / Meeting title
            <input
              id="booking-title"
              name="meetingTitle"
              type="text"
              placeholder="e.g. Project Review"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
          </label>

          <label htmlFor="booking-date">
            Date
            <input
              id="booking-date"
              name="bookingDate"
              type="date"
              min={getTodayDate()}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />
          </label>

          <div className="row">
            <label htmlFor="booking-start">
              Start time
              <input
                id="booking-start"
                name="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>

            <label htmlFor="booking-end">
              End time
              <input
                id="booking-end"
                name="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>

          <div className="actions end">
            <button type="button" className="btn" onClick={props.onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Confirm booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
