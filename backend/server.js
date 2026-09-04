require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { initDB } = require('./database');
const { setupAuth, ensureAuth } = require('./auth');
const { getDB } = require('./database');
const authRoutes = require('./routes/auth');
const preferenceRoutes = require('./routes/preferences');
const webhookRoutes = require('./routes/webhook');

function createServer() {
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
  app.use(express.json());
  app.use(session({ secret: process.env.SESSION_SECRET || 'development-secret', resave: false, saveUninitialized: false, cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 86400000 } }));
  setupAuth(app);
  app.get('/api/health', (_, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/preferences', preferenceRoutes);
  app.get('/api/activity', ensureAuth, async (req, res) => {
    const alerts = await getDB().all('SELECT id, pet, egg, rarity, mutation, sent_at FROM alerts WHERE user_id = ? ORDER BY sent_at DESC LIMIT 50', req.user.discord_id);
    res.json(alerts.map((alert) => ({ id: String(alert.id), type: 'hatch', title: `${alert.pet} spawned`, detail: `${alert.egg} · ${alert.rarity || 'Unknown'} · ${alert.mutation || 'None'}`, time: alert.sent_at, status: 'Delivered' })));
  });
  app.use('/api/webhook', webhookRoutes);
  if (process.env.NODE_ENV === 'production') { app.use(express.static(path.join(__dirname, '../frontend/dist'))); app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))); }
  app.use((_, res) => res.status(404).json({ error: 'Not found' }));
  return app;
}

if (require.main === module) initDB().then(() => createServer().listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`)));
module.exports = { createServer };
