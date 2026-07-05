'use strict';

// שלב 5: ממשק web לניהול טיוטות - חלופה ל-review.js. API פשוט מעל db.js
// (בלי אימות - מיועד לריצה מקומית בלבד), ועמוד סטטי אחד ב-public/index.html.

const path = require('path');
const express = require('express');
const db = require('./db');

const PORT = process.env.WEB_PORT || 3001;
const HOST = process.env.WEB_HOST || '127.0.0.1';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/deliveries', (req, res) => {
  const status = req.query.status === 'confirmed' ? 'confirmed' : 'draft';
  res.json(db.listByStatus(status));
});

app.patch('/api/deliveries/:id', (req, res) => {
  try {
    const updated = db.updateFields(Number(req.params.id), req.body || {});
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/deliveries/:id/confirm', (req, res) => {
  try {
    const confirmed = db.confirmDelivery(Number(req.params.id));
    res.json(confirmed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`[web] ממשק הניהול זמין בכתובת http://${HOST}:${PORT}`);
});
