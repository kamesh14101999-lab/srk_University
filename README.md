# SKR University Management Portal

A full-stack web portal for SKR University, Vizag (Visakhapatnam), Andhra Pradesh — where the Principal/Admin, teachers, and students manage and view students, faculty, academics, attendance, exams, results, events, fests, cluster activities, sports, and clubs in one place.

**Live demo:** _add your deployed URL here after deploying (see [Deploy](#deploy))_

## Features

- **Public site** — home, about, departments, courses, events, fests, contact, with a role-based login
- **Admin** — full CRUD over students, teachers, departments, courses, subjects, academic years, teaching assignments, events/fests/clusters/sports/clubs, timetable (with clash detection), academic calendar, announcements; attendance analytics; exam publishing; marks & grading rule management; result generation and publish/unpublish; PDF/Excel reports; university info and settings editor; user account management
- **Teacher** — own classes, attendance marking sheet, marks entry (locked once an exam is published), student remarks, class results & analytics, own timetable, announcements to own class
- **Student** — own profile, attendance %, subjects, marks, grades, published results with SGPA/CGPA, timetable, exams, events (with registration), fests, activities, sports, clubs, announcements
- Server-side role + scope enforcement on every route (not just hidden UI) — teachers only see their own assignments' students, students only see their own data

## Stack

- **Frontend:** React 19 (Vite), React Router, Tailwind CSS v4, Axios, Recharts
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas, Mongoose
- **Auth:** JWT (localStorage/sessionStorage), bcrypt password hashing
- **Reports:** ExcelJS (Excel) and PDFKit (PDF), generated server-side
- **Deploy:** Frontend on Vercel, backend on Render

## Repo structure

```
SKR University/
  client/   # React (Vite) frontend
  server/   # Express API + MongoDB models + seed script
  PROJECT.md
  README.md
```

See `PROJECT.md` for the full data model, API, and screen specification this app was built from.

## Demo logins

After seeding (see below), all accounts share the password set in `SEED_DEFAULT_PASSWORD` (default: `Passw0rd!2026`).

| Role | Identifier | Password |
|---|---|---|
| Admin | `admin@skruniversity.edu` | `Passw0rd!2026` |
| Teacher | any seeded Employee ID (e.g. `SKRT001`) or their email | `Passw0rd!2026` |
| Student | any seeded Student ID (e.g. `SKR2026BTEC001`) or their email | `Passw0rd!2026` |

Teacher and student emails follow `firstname.lastnameN@skruniversity.edu`; the seed log prints a running count, or you can look up any record via MongoDB Atlas's Data Explorer / Compass.

## Local setup

### Prerequisites

- Node.js 18+ and npm
- A MongoDB Atlas cluster (free tier is fine) — see [MongoDB Atlas setup](https://www.mongodb.com/docs/atlas/getting-started/) if you don't have one. Create a database user and allow your IP (or `0.0.0.0/0` for local dev) in Network Access.

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/skr-university
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SEED_DEFAULT_PASSWORD=Passw0rd!2026
```

Seed demo data (wipes and reloads the database):

```bash
npm run seed
```

This creates 1 admin, 9 departments, ~13 courses, ~30 teachers with a clash-free timetable, ~300 students, two semesters of attendance/exams/marks, one semester of published results, plus events, fests, cluster activities, sports/tournaments/teams/fixtures, 8 clubs, achievements, an academic calendar, and announcements.

Start the API:

```bash
npm run dev     # with nodemon
# or
npm start
```

The API runs at `http://localhost:5000`; health check at `GET /api/health`.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
```

`client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Build order this project followed

See `PROJECT.md` → **Build order** for the 25-step sequence (server scaffold → models → seed → auth → CRUD resources → attendance → exams/marks → results → activities → timetable → announcements → dashboards → reports → client scaffold → public site → dashboards per role → polish → deploy).

## Deploy

1. **Backend (Render):** New Web Service → point at `server/`, build command `npm install`, start command `npm start`. Add the same env vars as `server/.env`, with `CLIENT_URL` set to your deployed frontend URL.
2. **Frontend (Vercel):** New Project → point at `client/`, framework preset Vite. Add `VITE_API_URL` pointing at your deployed backend's `/api` path.
3. Re-run `npm run seed` against the production `MONGO_URI` once, from your machine or a one-off Render job, to populate demo data.

## Out of scope (v1)

Email/SMS sending, self-service password reset by email, file uploads, fee management, admissions workflow, library circulation, hostel allotment, online payments, OAuth, dark mode, mobile apps, multi-campus.
