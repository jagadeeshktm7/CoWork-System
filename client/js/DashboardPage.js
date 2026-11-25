// ---------- Member 4: Overview dashboard with stats, CSS charts, free now, and upcoming ----------
function DashboardPage(props) {
  const [stats, setStats] = useState(null);
  const [freeNow, setFreeNow] = useState([]);
  const [upcomingList, setUpcomingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load stats, currently free halls, and next 5 upcoming bookings
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const today = getTodayDate();
        let nowStart = getCurrentTime();
        if (nowStart === '23:59') {
          nowStart = '23:58';
        }
        const nowEnd = addOneHour(nowStart);

        const statsData = await getDashboardStats();
        const freeHallsData = await getFreeRooms(today, nowStart, nowEnd);
        const bookedData = await getBookings({ status: 'booked' });

        // Keep only bookings that are not already finished today
        const currentTime = getCurrentTime();
        const futureOnly = bookedData.filter((b) => {
          if (b.bookingDate > today) return true;
          if (b.bookingDate === today && b.endTime > currentTime) return true;
          return false;
        });

        setStats(statsData);
        setFreeNow(freeHallsData);
        setUpcomingList(futureOnly.slice(0, 5));
      } catch (err) {
        setError('Could not load dashboard data. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [props.refreshKey]);

  if (loading) return <p className="note">Loading dashboard...</p>;
  if (error) return <p className="banner error">{error}</p>;
  if (!stats) return null;

  const maxHallCount = getMaxBarCount(stats.bookingsPerHall);
  const maxDayCount = getMaxBarCount(stats.last7Days);
  const maxTypeCount = getMaxBarCount(stats.eventTypeCounts);

  return (
    <section>
      <div className="section-head">
        <h2>Dashboard Overview</h2>
        <span className="count-pill">
          Busiest hall: {stats.busiestHall.name} ({stats.busiestHall.count})
        </span>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Halls</div>
          <div className="stat-value">{stats.totalHalls}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Bookings Today</div>
          <div className="stat-value">{stats.bookingsToday}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Upcoming</div>
          <div className="stat-value">{stats.upcomingBookings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Free Right Now</div>
          <div className="stat-value">{stats.freeHallsNow}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats.completedBookings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cancelled</div>
          <div className="stat-value">{stats.cancelledBookings}</div>
        </div>
      </div>

      {/* CSS Bar Charts */}
      <div className="dashboard-columns">
        <div className="panel">
          <h3>Bookings per Hall</h3>
          <div className="bar-chart">
            {stats.bookingsPerHall.map((item) => {
              const widthPercent = Math.round((item.count / maxHallCount) * 100);
              return (
                <div className="bar-row" key={item.name}>
                  <span className="bar-label">{item.name}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${widthPercent}%` }}></div>
                  </div>
                  <span className="bar-count">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <h3>Last 7 Days</h3>
          <div className="bar-chart">
            {stats.last7Days.map((item) => {
              const widthPercent = Math.round((item.count / maxDayCount) * 100);
              return (
                <div className="bar-row" key={item.date}>
                  <span className="bar-label">{item.date}</span>
                  <div className="bar-track">
                    <div className="bar-fill mint" style={{ width: `${widthPercent}%` }}></div>
                  </div>
                  <span className="bar-count">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <h3>Bookings by Event Type</h3>
          <div className="bar-chart">
            {stats.eventTypeCounts.map((item) => {
              const widthPercent = Math.round((item.count / maxTypeCount) * 100);
              return (
                <div className="bar-row" key={item.eventType}>
                  <span className="bar-label">{item.eventType}</span>
                  <div className="bar-track">
                    <div className="bar-fill peach" style={{ width: `${widthPercent}%` }}></div>
                  </div>
                  <span className="bar-count">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Free right now & Next 5 upcoming */}
      <div className="dashboard-columns">
        <div className="panel">
          <h3>Free Right Now</h3>
          {freeNow.length === 0 && <p className="note">All halls are currently busy.</p>}
          <ul className="list">
            {freeNow.map((hall) => (
              <li key={hall._id}>
                <div>
                  <strong>{hall.name}</strong>
                  <p className="meta">
                    {formatFloor(hall.floorNumber)} &middot; {hall.capacity} seats
                  </p>
                </div>
                <button
                  type="button"
                  className="btn primary small"
                  onClick={() => props.onBook({ room: hall })}
                >
                  Book
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3>Next 5 Upcoming Bookings</h3>
          {upcomingList.length === 0 && <p className="note">No upcoming bookings yet.</p>}
          <ul className="list">
            {upcomingList.map((b) => (
              <li key={b._id}>
                <div>
                  <strong>{b.meetingTitle}</strong>
                  <p className="meta">
                    {b.room ? b.room.name : 'Hall'} &middot; {b.bookingDate} &middot; {b.startTime}-{b.endTime}
                  </p>
                  <p className="meta">
                    {b.bookedBy} &middot; {b.eventType} &middot; {b.attendees} people
                  </p>
                </div>
                <span className={`badge ${b.status}`}>{b.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
