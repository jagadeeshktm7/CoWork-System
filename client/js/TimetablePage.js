// ---------- Member 4: Daily timetable grid across all halls (08:00 to 19:00) ----------
function TimetablePage(props) {
  const [date, setDate] = useState(getTodayDate());
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load halls and all bookings for the chosen date
  useEffect(() => {
    async function loadTimetable() {
      setLoading(true);
      setError('');
      try {
        const roomList = await getRooms();
        const bookingList = await getBookings({ date });
        setRooms(roomList);
        setBookings(bookingList);
      } catch (err) {
        setError('Could not load timetable.');
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, [date, props.refreshKey]);

  // Find active or completed booking for a hall and hour slot (ignore cancelled)
  function findCellBooking(roomId, hour) {
    const slotStart = `${padTwo(hour)}:00`;
    const slotEnd = `${padTwo(hour + 1)}:00`;
    return bookings.find((b) => {
      if (b.status === 'cancelled') return false;
      if (!b.room || b.room._id !== roomId) return false;
      return b.startTime < slotEnd && b.endTime > slotStart;
    });
  }

  return (
    <section>
      <div className="section-head">
        <h2>Daily Hall Timetable</h2>
        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={() => setDate(addDaysToDate(date, -1))}
          >
            Previous day
          </button>
          <input
            type="date"
            aria-label="Timetable date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            type="button"
            className="btn"
            onClick={() => setDate(addDaysToDate(date, 1))}
          >
            Next day
          </button>
        </div>
      </div>

      {error && <p className="banner error">{error}</p>}
      {loading && <p className="note">Loading timetable...</p>}

      {!loading && !error && (
        <div className="panel table-wrap">
          <table className="timetable-table">
            <thead>
              <tr>
                <th>Hour</th>
                {rooms.map((hall) => (
                  <th key={hall._id}>{hall.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE_HOURS.map((hour) => {
                const slotStart = `${padTwo(hour)}:00`;
                const slotEnd = `${padTwo(hour + 1)}:00`;

                return (
                  <tr key={hour}>
                    <td className="timetable-time">{slotStart} - {slotEnd}</td>
                    {rooms.map((hall) => {
                      const booking = findCellBooking(hall._id, hour);

                      if (!booking) {
                        return (
                          <td key={hall._id} className="cell-free">
                            <button
                              type="button"
                              className="cell-free-btn"
                              onClick={() =>
                                props.onBook({
                                  room: hall,
                                  initialDate: date,
                                  initialStartTime: slotStart,
                                  initialEndTime: slotEnd,
                                })
                              }
                            >
                              Free
                            </button>
                          </td>
                        );
                      }

                      const cellClass =
                        booking.status === 'completed' ? 'cell-completed' : 'cell-booked';

                      return (
                        <td key={hall._id} className={cellClass}>
                          <div>{booking.meetingTitle}</div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 400 }}>
                            {booking.bookedBy} ({booking.startTime}-{booking.endTime})
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
