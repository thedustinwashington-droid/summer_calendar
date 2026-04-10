const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 8080);

app.use(express.static(__dirname, {
  extensions: ['html']
}));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Summer Parenting Scheduler listening on http://localhost:${port}`);
});
