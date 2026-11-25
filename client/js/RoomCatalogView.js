// ---------- Member 3: Hall catalog cards, seats filter, and per-hall daily schedule ----------
function RoomCatalogView(props) {
  const [rooms, setRooms] = useState([]);
  const [minCapacity, setMinCapacity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for viewing one hall's daily schedule
  const [selectedHall, setSelectedHall] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(getTodayDate());
  const [hallBookings, setHallBookings] = useState([]);
  const [scheduleError, setScheduleError] = useState('');

  // Load active halls once
  useEffect(() => {
    async function loadHalls() {
      setLoading(true);
      setError('');
      try {
        const data = await getRooms();
        setRooms(data);
      } catch (err) {
        setError('Could not load halls. Is the server running?');
      } finally {
        setLoading(false);
      }
    }
    loadHalls();
  }, []);

  // Load selected hall schedule when hall, date, or refreshKey changes
  useEffect(() => {
    if (!selectedHall) return;

    async function loadHallSchedule() {
      setScheduleError('');
      try {
        const data = await getBookings({ date: scheduleDate, room: selectedHall._id });
        setHallBookings(data);
      } catch (err) {
        setScheduleError('Could not load schedule for this hall.');
      }
    }
    loadHallSchedule();
  }, [selectedHall, scheduleDate, props.refreshKey]);

  // Find a non-cancelled booking covering a one-hour slot
  function findSlotBooking(hour) {
    const slotStart = `${padTwo(hour)}:00`;
    const slotEnd = `${padTwo(hour + 1)}:00`;
    return hallBookings.find((b) => {
      if (b.status === 'cancelled') return false;
      return b.startTime < slotEnd && b.endTime > slotStart;
    });
  }

  const visibleHalls = rooms.filter((hall) => hall.capacity >= Number(minCapacity || 0));

  if (loading) return <p className="note">Loading halls...</p>;
  if (error) return <p className="banner error">{error}</p>;

  return (
    <section>
      <div className="section-head">
        <h2>Campus Halls &amp; Venues</h2>
        <label className="inline-label" htmlFor="min-seats-filter">
          Seats needed:{' '}
          <input
            id="min-seats-filter"
            name="minCapacity"
            type="number"
            min="1"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            placeholder="Any"
          />
        </label>
      </div>

      {visibleHalls.length === 0 && (
        <p className="note">
          No halls match that seat count. Try a smaller number, or run <code>npm run seed</code> in the server folder.
        </p>
      )}

      <div className="grid">
        {visibleHalls.map((hall) => {
          const isSelected = selectedHall && selectedHall._id === hall._id;
          return (
            <article key={hall._id} className={isSelected ? 'hall-card selected' : 'hall-card'}>
              <img
                className="hall-photo"
                src={hall.imageUrl || '/images/seminar-hall.svg'}
                alt={hall.name}
              />
              <div className="card-body">
                <h3>{hall.name}</h3>
                <p className="meta">
                  {formatFloor(hall.floorNumber)} &middot; {hall.capacity} seats
                </p>
                {hall.purpose && <p className="purpose">{hall.purpose}</p>}
                <div className="tags">
                  {hall.amenities.map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <div className="actions">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => props.onBook({ room: hall })}
                  >
                    Book hall
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setSelectedHall(hall)}
                  >
                    View schedule
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Daily schedule table for the chosen hall */}
      {selectedHall && (
        <div className="panel" style={{ marginTop: '24px' }}>
          <div className="section-head">
            <h3>{selectedHall.name} Daily Schedule</h3>
            <div className="actions">
              <input
                type="date"
                aria-label="Schedule date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
              <button
                type="button"
                className="btn"
                onClick={() => setSelectedHall(null)}
              >
                Close
              </button>
            </div>
          </div>

          {scheduleError && <p className="banner error">{scheduleError}</p>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Booking</th>
                </tr>
              </thead>
              <tbody>
                {TIMETABLE_HOURS.map((hour) => {
                  const booking = findSlotBooking(hour);
                  const slotStart = `${padTwo(hour)}:00`;
                  const slotEnd = `${padTwo(hour + 1)}:00`;
                  let rowClass = 'free';
                  if (booking) {
                    rowClass = booking.status;
                  }

                  return (
                    <tr key={hour} className={rowClass}>
                      <td>{slotStart} - {slotEnd}</td>
                      <td>
                        {booking ? (
                          <span className={`badge ${booking.status}`}>{booking.status}</span>
                        ) : (
                          'Free'
                        )}
                      </td>
                      <td>
                        {booking
                          ? `${booking.meetingTitle} (${booking.bookedBy}, ${booking.startTime}-${booking.endTime})`
                          : 'Available to book'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
