// ---------- Member 4: Personal bookings by saved name/email with Edit and Cancel ----------
function MyBookingsPage(props) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trimmedEmail = props.userEmail.trim();
  const trimmedName = props.userName.trim();

  // Load bookings matching the saved email or name
  useEffect(() => {
    if (!trimmedEmail && !trimmedName) {
      setBookings([]);
      return;
    }

    async function loadMine() {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (trimmedEmail) {
          params.bookedByEmail = trimmedEmail;
        } else {
          params.bookedBy = trimmedName;
        }
        const data = await getBookings(params);
        setBookings(data);
      } catch (err) {
        setError('Could not load your bookings.');
      } finally {
        setLoading(false);
      }
    }
    loadMine();
  }, [trimmedEmail, trimmedName, props.refreshKey]);

  // Cancel booking with confirmation
  async function handleCancel(id) {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      props.onChanged('Your booking was cancelled.');
    } catch (err) {
      setError('Could not cancel the booking. Try again.');
    }
  }

  if (!trimmedEmail && !trimmedName) {
    return (
      <section>
        <h2>My Bookings</h2>
        <p className="note">
          Enter your name or email in the top bar (or make a booking) to see your bookings here.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>My Bookings</h2>
      <p className="meta" style={{ marginBottom: '14px' }}>
        Showing bookings for {trimmedEmail || trimmedName}
      </p>

      {error && <p className="banner error">{error}</p>}
      {loading && <p className="note">Loading your bookings...</p>}

      {!loading && bookings.length === 0 && !error && (
        <p className="note">You have no bookings yet. Pick a hall to book one.</p>
      )}

      <ul className="list">
        {bookings.map((b) => (
          <li key={b._id}>
            <div>
              <strong>{b.meetingTitle}</strong>{' '}
              <span className={`badge ${b.status}`}>{b.status}</span>
              <p className="meta">
                {b.room ? b.room.name : 'Hall'} &middot; {b.bookingDate} &middot; {b.startTime}-{b.endTime}
              </p>
              <p className="meta">
                {b.eventType} &middot; {b.attendees} attendees &middot; {b.bookedByEmail}
              </p>
            </div>

            {b.status === 'booked' && (
              <div className="actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => props.onEdit(b)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => handleCancel(b._id)}
                >
                  Cancel
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
