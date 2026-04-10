# Summer Parenting Scheduler

A lightweight single-page web app to draft a summer parenting-time calendar.

## Features

- Login screen (demo-only, no backend auth).
- Summer date-range inputs.
- Split templates:
  - 50/50 alternating week.
  - 2-2-3 rotation.
  - fully manual editing mode.
- Holiday overrides using date-to-parent tokens (`YYYY-MM-DD:A` or `YYYY-MM-DD:B`).
- State selector with guidance reminder text.
- Interactive color-coded calendar where each day can be toggled between parents.
- Running overnight totals for each parent.
- Shareable link that serializes the current schedule into the URL hash.
- PDF export via browser print dialog.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Notes

This tool is for planning support only and does not replace legal advice or a court order.
