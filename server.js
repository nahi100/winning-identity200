// ════════════════════════════════════════════════════════════════════
//  server.js — main Express server
//  Wires all 4 systems + auth + tasks, starts the notification worker.
// ════════════════════════════════════════════════════════════════════
const express = require('express');
const cors = require('cors');
const path = require('path');
const { startWorker } = require('./lib/notification-worker');

const app = express();
app.use(cors());
app.use(express.json());

// ── API routes ──
app.use(require('./routes/auth'));
app.use(require('./routes/tasks'));
app.use(require('./routes/coach'));        // System 4: RAG AI Coach
app.use(require('./routes/quotes'));       // System 2: Daily Fuel
app.use(require('./routes/notifications')); // System 1: Push engine
app.use(require('./routes/coupons'));      // System 3: Viral coupons

// ── Health check ──
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ── Serve frontend build (production) ──
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  startWorker(); // System 1: begin checking for due notifications
});
