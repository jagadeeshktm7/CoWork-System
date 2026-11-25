// ---------- Member 3: Find free halls for a date/time window or right now ----------
function FreeHallsPage(props) {
  const [date, setDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [freeHalls, setFreeHalls] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search free halls for the given date, start, and end times
  async function searchFreeHalls(targetDate, targetStart, targetEnd) {
    setError('');
    if (!targetDate || !targetStart || !targetEnd) {
      setError('Please pick a date, start time, and end time.');
      return;
    }
    if (targetStart >= targetEnd) {
      setError('End time must be after start time.');
      return;
    }

    setLoading(true);
    try {
      const results = await getFreeRooms(targetDate, targetStart, targetEnd);
      setFreeHalls(results);
      setSearched(true);
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Could not search free halls.');
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    searchFreeHalls(date, startTime, endTime);
  }

  // Fill current date and time and run search immediately
  function handleFreeNow() {
    const today = getTodayDate();
    let nowStart = getCurrentTime();
    if (nowStart === '23:59') {
      nowStart = '23:58';
    }
    const nowEnd = addOneHour(nowStart);

    setDate(today);
    setStartTime(nowStart);
    setEndTime(nowEnd);
    searchFreeHalls(today, nowStart, nowEnd);
  }

  // Reload results when bookings change after a search
  useEffect(() => {
    if (searched) {
      searchFreeHalls(date, startTime, endTime);
    }
  }, [props.refreshKey]);

  return (
    <section>
      <h2>Find Free Halls</h2>

      <form className="panel" onSubmit={handleFormSubmit}>
        <div className="inline-filters">
          <label htmlFor="free-date">
            Date
            <input
              id="free-date"
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label htmlFor="free-start">
            Start time
            <input
              id="free-start"
              name="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <label htmlFor="free-end">
            End time
            <input
              id="free-end"
              name="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
          <div className="actions">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Searching...' : 'Find free halls'}
            </button>
            <button type="button" className="btn" onClick={handleFreeNow} disabled={loading}>
              Free right now
            </button>
          </div>
        </div>
      </form>

      {error && <p className="banner error">{error}</p>}

      {searched && !loading && freeHalls.length === 0 && (
        <p className="note">No halls are free during {date} ({startTime} - {endTime}).</p>
      )}

      {searched && freeHalls.length > 0 && (
        <div>
          <p className="meta" style={{ marginBottom: '12px' }}>
            Showing {freeHalls.length} free hall(s) for {date} ({startTime} - {endTime}):
          </p>
          <div className="grid">
            {freeHalls.map((hall) => (
              <article className="hall-card" key={hall._id}>
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
                  <div className="actions">
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() =>
                        props.onBook({
                          room: hall,
                          initialDate: date,
                          initialStartTime: startTime,
                          initialEndTime: endTime,
                        })
                      }
                    >
                      Book
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
