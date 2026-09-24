# Aura — Smart Event Planning and Resource Allocation

PG mini project: MERN stack campus event studio. Departments request halls and equipment; Aura detects booking conflicts, prevents over-allocation, and walks requests through approval → reservation → closure.

## Stack

- MongoDB, Express 5, React 19, Node
- Vite 8 + Tailwind CSS v4 (`@import "tailwindcss"`, no `tailwind.config.js`)
- JWT + bcrypt, TanStack Query, Zustand, React Hook Form, Framer Motion, Lucide, Lottie, Recharts

## Run locally

MongoDB must be running on `127.0.0.1:27017`.

```bash
cd server
npm install
npm run dev
```

The backend creates the default admin account on startup if it does not already exist. Run `npm run seed` only when you want to reset and populate the complete demo dataset.

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@aura.edu | Aura@123 |
| CSE department | cse@aura.edu | Aura@123 |
| IT department | it@aura.edu | Aura@123 |

## What to show in viva

1. Landing (Aura editorial) and login (split illustration).
2. Admin creates department / user / venue / equipment.
3. Department user requests an event; overlapping hall time is rejected with alternative halls.
4. Equipment quantity that exceeds remaining stock is rejected.
5. Admin approves → resources reserved → calendar + matrices update.
6. Close event, collect feedback, issue PDF certificates and closure report.
7. Dark mode, ⌘K search, notification drawer.

## API

`GET /api/health` · auth, departments, users, venues (availability + matrix), equipment (availability + matrix), events (CRUD, review, progress, participants, feedback, certificates, report PDF), dashboard (overview, search, notifications, announcements).
