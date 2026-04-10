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

## Deploy this project to a brand-new GitHub repository

If you created a new repo (for example `Summer`), use this exact flow:

1. Push this code into that new repository.
2. Confirm these files exist in the new repo:
   - `.github/workflows/deploy-pages.yml`
   - `.nojekyll`
   - `index.html`, `app.js`, `styles.css`
3. In the new repo, open **Settings → Pages** and set **Source = GitHub Actions**.
4. Push one small commit (or use **Actions → Deploy static site to GitHub Pages → Run workflow**).
5. Wait for a green deploy run, then open:
   - `https://<your-username>.github.io/<repo-name>/`

If the new site still looks stale, hard refresh (`Ctrl/Cmd + Shift + R`).

---

## GitHub Pages (why you may not be seeing changes)

GitHub Pages only serves static files (`index.html`, `app.js`, `styles.css`). It does **not** run `server.js`.

This repo includes a Pages workflow at `.github/workflows/deploy-pages.yml` that deploys automatically on **every branch push** so updates appear as soon as commits are pushed.

If changes are not showing:

1. In GitHub, go to **Settings → Pages** and ensure **Source = GitHub Actions**.
2. Check the **Actions** tab for a successful `Deploy static site to GitHub Pages` run after your latest push.
3. Hard refresh your site (`Ctrl+Shift+R` / `Cmd+Shift+R`) to bypass cache.
4. Confirm the change exists on the `main` branch file view (if a commit is only in a PR branch, it will not appear live).

If you use a custom domain, also confirm DNS still points to GitHub Pages.

Note: The Pages workflow appends a commit-hash query string to CSS/JS on deploy to force browsers to fetch fresh assets.

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
