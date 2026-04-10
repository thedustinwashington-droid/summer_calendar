# Summer Parenting Scheduler

A lightweight web app to draft a summer parenting-time calendar.

## Simplest deployment (no code, ~2 minutes)

If you want this live quickly without dealing with servers:

1. Go to **Netlify Drop**: https://app.netlify.com/drop
2. Drag and drop these 3 files from this repo:
   - `index.html`
   - `app.js`
   - `styles.css`
3. Netlify gives you a live URL immediately.

That’s it.

---

## Simplest "real" deployment with login-ready backend path

If you want a URL now and room to grow later:

1. Push this repo to GitHub.
2. On **Render.com** create a new **Web Service** from the repo.
3. Use these settings:
   - Build command: `npm install`
   - Start command: `npm start`
4. Deploy.

Render provides a public URL and runs `server.js` for you.

---

## Local run

```bash
npm install
npm start
```

Open `http://localhost:8080`.

---

## Docker (optional)

```bash
docker build -t summer-parenting-scheduler .
docker run --rm -p 8080:8080 summer-parenting-scheduler
```

Open `http://localhost:8080`.

---

## Important note

Current login is UI-only (no real auth/database yet). The app is good for drafting schedules, but not yet production-grade legal recordkeeping.
