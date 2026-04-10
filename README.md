# Summer Parenting Scheduler

A lightweight web app to draft a summer parenting-time calendar.

Indiana-specific option included: selectable Indiana guideline holiday overrides (including alternating-year Fourth of July handling).

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

## GitHub Pages (why you may not be seeing changes)

GitHub Pages only serves static files (`index.html`, `app.js`, `styles.css`). It does **not** run `server.js`.

This repo includes a Pages workflow at `.github/workflows/deploy-pages.yml` that deploys automatically on pushes to your default branch (`main` or `master`).

If changes are not showing:

1. Make sure your PR is merged into `main`.
2. In GitHub, go to **Settings → Pages** and ensure **Source = GitHub Actions**.
3. Check the **Actions** tab for a successful `Deploy static site to GitHub Pages` run.
4. Hard refresh your site (`Ctrl+Shift+R` / `Cmd+Shift+R`) to bypass cache.

If you use a custom domain, also confirm DNS still points to GitHub Pages.

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
