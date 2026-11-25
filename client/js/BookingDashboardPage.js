// ---------- Member 4: All bookings table with filters, counts, Edit and Cancel ----------
function BookingDashboardPage(props) {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load halls for the dropdown filter
  useEffect(() => {
    async function loadHalls() {
      try {
        const roomList = await getRooms();
        setRooms(roomList);
      } catch (err) {
        // Ignore here; main bookings error banner covers server issues
      }
    }
    loadHalls();
  }, []);

  // Load bookings when backend filters or refreshKey change
  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (filterDate) params.date = filterDate;
        if (filterRoom) params.room = filterRoom;
        if (filterStatus) params.status = filterStatus;
        const data = await getBookings(params);
        setBookings(data);
      } catch (err) {
        setError('Could not load bookings.');
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [filterDate, filterRoom, filterStatus, props.refreshKey]);

  // Cancel a booking after asking for confirmation
  async function handleCancelBooking(id) {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      props.onChanged('Your booking was cancelled.');
    } catch (err) {
      setError('Could not cancel the booking. Please try again.');
    }
  }

  // Filter by name or title in memory
  const query = searchText.trim().toLowerCase();
  const visibleBookings = bookings.filter((b) => {
    if (!query) return true;
    const matchesName = b.bookedBy.toLowerCase().includes(query);
    const matchesTitle = b.meetingTitle.toLowerCase().includes(query);
    return matchesName || matchesTitle;
  });

  // Count statuses for the summary pills above the table
  let bookedCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  for (let i = 0; i < visibleBookings.length; i++) {
    if (visibleBookings[i].status === 'booked') bookedCount += 1;
    if (visibleBookings[i].status === 'completed') completedCount += 1;
    if (visibleBookings[i].status === 'cancelled') cancelledCount += 1;
  }

  return (
    <section>
      <h2>All Bookings Dashboard</h2>

      {/* Filter bar */}
      <div className="panel inline-filters">
        <label htmlFor="all-filter-date">
          Date
          <input
            id="all-filter-date"
            name="filterDate"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </label>

        <label htmlFor="all-filter-room">
          Hall
          <select
            id="all-filter-room"
            name="filterRoom"
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
          >
            <option value="">All halls</option>
            {rooms.map((hall) => (
              <option key={hall._id} value={hall._id}>
                {hall.name}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="all-filter-status">
          Status
          <select
            id="all-filter-status"
            name="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label htmlFor="all-search-text">
          Search name or title
          <input
            id="all-search-text"
            name="searchText"
            type="text"
            placeholder="e.g. Seminar or Priya"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="btn"
          onClick={() => {
            setFilterDate('');
            setFilterRoom('');
            setFilterStatus('');
            setSearchText('');
          }}
        >
          Clear filters
        </button>
      </div>

      {/* Counts above the table */}
      <div className="counts-bar">
        <span className="count-pill">Total: {visibleBookings.length}</span>
        <span className="count-pill">Booked: {bookedCount}</span>
        <span className="count-pill">Completed: {completedCount}</span>
        <span className="count-pill">Cancelled: {cancelledCount}</span>
      </div>

      {error && <p className="banner error">{error}</p>}
      {loading && <p className="note">Loading bookings...</p>}

      {!loading && visibleBookings.length === 0 && (
        <p className="note">No bookings match your filters.</p>
      )}

      {!loading && visibleBookings.length > 0 && (
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hall</th>
                <th>Title</th>
                <th>Booked by</th>
                <th>Date</th>
                <th>Time</th>
                <th>Attendees</th>
                <th>Event type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.room ? b.room.name : 'Hall'}</td>
                  <td>{b.meetingTitle}</td>
                  <td>{b.bookedBy}</td>
                  <td>{b.bookingDate}</td>
                  <td>{b.startTime} - {b.endTime}</td>
                  <td>{b.attendees}</td>
                  <td>{b.eventType}</td>
                  <td>
                    <span className={`badge ${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    {b.status === 'booked' ? (
                      <div className="actions">
                        <button
                          type="button"
                          className="btn small"
                          onClick={() => props.onEdit(b)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn danger small"
                          onClick={() => handleCancelBooking(b._id)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="meta">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
