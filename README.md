# CoWork - Hall & Venue Booking System

A MERN-stack web application for booking campus halls and venues. Users can view the live dashboard, browse halls, search for free halls by date and time, click slots on a daily timetable, manage all bookings, edit or cancel their bookings, and receive email notifications. The backend prevents overlapping bookings (HTTP 409) and runs scheduled jobs for reminders and auto-completion.

**Stack:** Plain HTML + CSS + React 18 (loaded via script tags, Babel 7, Axios) served by Express + Node.js + MongoDB + Mongoose + Nodemailer + node-cron.

## Folder Structure & What Each File Does

```
CoWork-System/
├── .gitignore
├── API_CONTRACT.md                   # API endpoints, payloads, and status codes
├── README.md                         # Project guide, setup, and team ownership
├── server/
│   ├── server.js                     # Starts Express, serves /client, connects MongoDB, starts cron jobs
│   ├── seed.js                       # Clears bookings & halls, then seeds the 7 halls
│   ├── sampleData.js                 # Inserts 20 demo bookings (last 7 days to next 3 days, no emails)
│   ├── mailer.js                     # Sends Gmail SMTP emails (or prints EMAIL TEST MODE if unconfigured)
│   ├── jobs.js                       # Cron jobs: 60-min email reminders (1m) and auto-complete past bookings (5m)
│   ├── .env.example                  # Sample environment variables (copy to .env)
│   ├── package.json                  # Server dependencies and npm scripts
│   ├── models/
│   │   ├── Room.js                   # Mongoose schema for halls (name, floor, capacity, purpose, amenities, imageUrl)
│   │   └── Booking.js                # Mongoose schema for bookings (eventType, attendees, status, reminderSent, timestamps)
│   └── routes/
│       ├── rooms.js                  # GET /api/rooms, GET /api/rooms/free, POST /api/rooms
│       ├── bookings.js               # GET, POST, PUT, DELETE (soft cancel) /api/bookings with collision checks
│       └── dashboard.js              # GET /api/dashboard/stats for dashboard cards and bar charts
└── client/
    ├── index.html                    # Loads React 18 UMD, Babel 7, Axios, helpers.js, and components
    ├── style.css                     # Multicolour pastel theme, hall card tones, badges, CSS bar charts, responsive rules
    ├── images/                       # SVG placeholder images for all 7 halls
    └── js/
        ├── helpers.js                # React hooks, API base URL, Axios calls, and local date/time helpers
        ├── App.js                    # Top navigation bar, page switching, saved name/email, modal host
        ├── DashboardPage.js          # Stat cards, CSS bar charts, Free right now list, Next 5 upcoming bookings
        ├── RoomCatalogView.js        # Hall cards, seats filter, and per-hall daily schedule table
        ├── FreeHallsPage.js          # Search free halls by date/time or "Free right now"
        ├── TimetablePage.js          # Daily 08:00-19:00 timetable grid across all halls with quick booking
        ├── BookingDashboardPage.js   # Full bookings table with filters, counts, Edit, and Cancel
        ├── MyBookingsPage.js         # Bookings filtered by saved user name/email with Edit and Cancel
        └── BookingForm.js            # Pop-up form for creating and editing bookings with validation
```

## Who Owns What

| Member | Files |
|---|---|
| Member 1 | `server/server.js`, `server/models/*`, `server/routes/rooms.js` (including free halls), `server/routes/dashboard.js`, `server/seed.js`, `server/sampleData.js` |
| Member 2 | `server/routes/bookings.js`, `server/mailer.js`, `server/jobs.js` |
| Member 3 | `client/index.html`, `client/style.css`, `client/js/App.js`, `client/js/RoomCatalogView.js`, `client/js/FreeHallsPage.js`, `client/js/BookingForm.js` |
| Member 4 | `client/js/helpers.js`, `client/js/DashboardPage.js`, `client/js/TimetablePage.js`, `client/js/BookingDashboardPage.js`, `client/js/MyBookingsPage.js` |

## How to Run the Project

You need Node.js 18+ and a MongoDB database (local MongoDB or MongoDB Atlas).

1. Go into the `server` folder and install packages:
   ```bash
   cd server
   npm install
   ```
2. Create `server/.env` from `server/.env.example` and set your MongoDB connection string (`MONGO_URI` or `MONGODB_URI`) and `PORT=5000`.
3. Seed the 7 halls (clears old bookings and halls):
   ```bash
   npm run seed
   ```
4. (Optional) Insert 20 sample demo bookings across the last 7 days and next 3 days:
   ```bash
   npm run seed:demo
   ```
5. Start the server (Express serves both the API and the `/client` website):
   ```bash
   npm start
   ```
6. Open your browser to:
   **http://localhost:5000**

Never commit `server/.env` or `node_modules`.

## How to Set Up Gmail Notifications

Email notifications use Gmail SMTP via Nodemailer (`server/mailer.js`).

1. Open your Google Account settings and turn on **2-Step Verification**.
2. Go to **Security -> App passwords** and generate a 16-character App Password for Mail.
3. In `server/.env`, set:
   ```env
   EMAIL_USER=youraddress@gmail.com
   EMAIL_PASS=your16charapppassword
   ```
4. Restart the server.

If `EMAIL_USER` or `EMAIL_PASS` is left empty, the server does not crash — it prints every email in the terminal under **EMAIL TEST MODE**.
