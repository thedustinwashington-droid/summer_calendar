# Summer Parenting Scheduler

A lightweight web app to draft a summer parenting-time calendar with interactive day-by-day editing.

## What this includes today

- Login screen (UI only; no real authentication backend yet).
- Inputs for:
  - summer start date / last day of school
  - first day of next school year
  - schedule split (alternating week, 2-2-3, custom)
  - state selector (guidance reminders)
  - parent names and colors
  - holiday overrides (`YYYY-MM-DD:A` or `YYYY-MM-DD:B`)
- Interactive, color-coded calendar with click-to-toggle day ownership.
- Running overnight totals for each parent.
- Shareable URL (state encoded in hash).
- PDF export through browser print.

---

## Run in a real local environment (recommended)

### 1) Install prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm (included with Node)

### 2) Install dependencies

```bash
npm install
```

### 3) Start the app

```bash
npm start
```

This starts an Express server on `http://localhost:8080` by default.

### 4) Open in browser

Visit:

- `http://localhost:8080`
- Health check: `http://localhost:8080/health`

---

## Run with Docker

### Build

```bash
docker build -t summer-parenting-scheduler .
```

### Run

```bash
docker run --rm -p 8080:8080 summer-parenting-scheduler
```

Then open `http://localhost:8080`.

---

## Deploy to a hosted environment

You can deploy this app as a standard Node web service on Render, Railway, Fly.io, Azure Web Apps, AWS Elastic Beanstalk, etc.

### Generic deployment settings

- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment variable:** `PORT` (most hosts provide this automatically)
- **Health check path:** `/health`

---

## Important production notes

The current app is intentionally lightweight and **not yet production-grade** for legal workflows.

Before using for actual parent-facing/legal coordination, add:

1. Real authentication (e.g., Auth0/Clerk/Firebase Auth/AWS Cognito).
2. Persistent storage (PostgreSQL or similar) for schedules and audit history.
3. Role-based access and invitation flow (both parents, mediator, attorney).
4. Server-side encryption and secure backups.
5. Immutable change history / revision tracking.
6. Clear legal disclaimer and jurisdiction-specific rule engine reviewed by counsel.

---

## Validation checks

```bash
npm run check
```

## Legal note

This tool is for planning support only and does not replace legal advice, a signed agreement, or a court order.
