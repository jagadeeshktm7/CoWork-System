# API Contract

- Dates: `YYYY-MM-DD`. Times: 24-hour `HH:mm`.
- Base URL: `http://localhost:5000/api`
- Errors always look like: `{ "message": "text" }`

## Halls (`/api/rooms`)

- **GET `/api/rooms`** -> `200`: All active halls sorted by `floorNumber` then `name`.
- **GET `/api/rooms/free?date=YYYY-MM-DD&startTime=HH:mm&endTime=HH:mm`** -> `200`: Active halls with no `booked` booking overlapping that window.
- **POST `/api/rooms`** -> `201`: `{ name, floorNumber, capacity, purpose?, amenities?, imageUrl? }`

## Bookings (`/api/bookings`)

- **GET `/api/bookings?date=&bookedBy=&bookedByEmail=&room=&status=`** -> `200`: Filtered bookings populated with hall `name`, `floorNumber`, `capacity`, sorted by `bookingDate`, `startTime`.
- **POST `/api/bookings`** -> `201`: `{ room, bookedBy, bookedByEmail, eventType, attendees, bookingDate, startTime, endTime, meetingTitle }`
  - `400`: Invalid fields, past date/time, `startTime >= endTime`, or `attendees > capacity` (`"This hall seats only N people."`)
  - `404`: Hall not found
  - `409`: Overlapping `booked` booking (`"This room is already reserved for the selected time slot."`). Back-to-back bookings are allowed.
- **PUT `/api/bookings/:id`** -> `200`: Edit `meetingTitle`, `eventType`, `attendees`, `bookingDate`, `startTime`, `endTime` on a `booked` reservation (collision check ignores itself).
- **DELETE `/api/bookings/:id`** -> `200`: Marks `status: "cancelled"` while preserving history.

## Dashboard (`/api/dashboard`)

- **GET `/api/dashboard/stats`** -> `200`: `{ totalHalls, bookingsToday, upcomingBookings, cancelledBookings, completedBookings, freeHallsNow, busiestHall, bookingsPerHall, last7Days, eventTypeCounts }`
