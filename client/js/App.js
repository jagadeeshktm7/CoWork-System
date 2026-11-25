// ---------- Member 3: Main App component with page tabs and user info ----------
function App() {
  const [page, setPage] = useState('dashboard');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-hide the green confirmation banner after 6 seconds
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 6000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  function handleNameChange(e) {
    const val = e.target.value;
    setUserName(val);
    localStorage.setItem('userName', val);
  }

  function handleEmailChange(e) {
    const val = e.target.value;
    setUserEmail(val);
    localStorage.setItem('userEmail', val);
  }

  function handleSaved(savedName, savedEmail, message) {
    setUserName(savedName);
    setUserEmail(savedEmail);
    setModalData(null);
    setSuccessMsg(message || 'Your booking was confirmed!');
    setRefreshKey((k) => k + 1);
  }

  function handleChanged(message) {
    if (message) {
      setSuccessMsg(message);
    }
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>CoWork Halls</h1>
          <p>Campus Hall &amp; Venue Booking</p>
        </div>

        <nav className="tabs" aria-label="Main navigation">
          <button
            type="button"
            className={page === 'dashboard' ? 'tab active' : 'tab'}
            onClick={() => setPage('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={page === 'rooms' ? 'tab active' : 'tab'}
            onClick={() => setPage('rooms')}
          >
            Halls
          </button>
          <button
            type="button"
            className={page === 'free' ? 'tab active' : 'tab'}
            onClick={() => setPage('free')}
          >
            Free Halls
          </button>
          <button
            type="button"
            className={page === 'timetable' ? 'tab active' : 'tab'}
            onClick={() => setPage('timetable')}
          >
            Timetable
          </button>
          <button
            type="button"
            className={page === 'all-bookings' ? 'tab active' : 'tab'}
            onClick={() => setPage('all-bookings')}
          >
            Booking Dashboard
          </button>
          <button
            type="button"
            className={page === 'mine' ? 'tab active' : 'tab'}
            onClick={() => setPage('mine')}
          >
            My Bookings
          </button>
        </nav>

        <div className="user-bar">
          <input
            aria-label="Your name"
            name="savedUserName"
            placeholder="Your name"
            value={userName}
            onChange={handleNameChange}
          />
          <input
            aria-label="Your email"
            name="savedUserEmail"
            placeholder="Your email"
            value={userEmail}
            onChange={handleEmailChange}
          />
        </div>
      </header>

      <main>
        {successMsg && (
          <div className="banner success" role="status">
            <span>{successMsg}</span>
            <button
              type="button"
              className="btn small"
              onClick={() => setSuccessMsg('')}
            >
              OK
            </button>
          </div>
        )}

        {page === 'dashboard' && (
          <DashboardPage
            refreshKey={refreshKey}
            onBook={(info) => setModalData(info)}
          />
        )}

        {page === 'rooms' && (
          <RoomCatalogView
            refreshKey={refreshKey}
            onBook={(info) => setModalData(info)}
          />
        )}

        {page === 'free' && (
          <FreeHallsPage
            refreshKey={refreshKey}
            onBook={(info) => setModalData(info)}
          />
        )}

        {page === 'timetable' && (
          <TimetablePage
            refreshKey={refreshKey}
            onBook={(info) => setModalData(info)}
          />
        )}

        {page === 'all-bookings' && (
          <BookingDashboardPage
            refreshKey={refreshKey}
            onEdit={(booking) => setModalData({ booking, room: booking.room })}
            onChanged={handleChanged}
          />
        )}

        {page === 'mine' && (
          <MyBookingsPage
            userName={userName}
            userEmail={userEmail}
            refreshKey={refreshKey}
            onEdit={(booking) => setModalData({ booking, room: booking.room })}
            onChanged={handleChanged}
          />
        )}
      </main>

      {modalData && (
        <BookingForm
          room={modalData.room}
          booking={modalData.booking}
          initialDate={modalData.initialDate}
          initialStartTime={modalData.initialStartTime}
          initialEndTime={modalData.initialEndTime}
          userName={userName}
          userEmail={userEmail}
          onClose={() => setModalData(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
