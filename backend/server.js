require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');
const { initDB } = require('./database');
const { setupAuth, ensureAuth } = require('./auth');
const { getDB } = require('./database');
const authRoutes = require('./routes/auth');
const preferenceRoutes = require('./routes/preferences');
const webhookRoutes = require('./routes/webhook');

function createServer() {
  const app = express();
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    })
  );

  app.use(express.json());

  if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
  const dataDir = process.env.DATA_DIR || __dirname;
  fs.mkdirSync(dataDir, { recursive: true });
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'development-secret',
      resave: false,
      saveUninitialized: false,
      store: new SQLiteStore({ db: 'sessions.sqlite', dir: dataDir }),
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400000, // 1 day
      },
    })
  );

  setupAuth(app);

  // Health check
  app.get('/api/health', (_, res) => res.json({ ok: true }));

  // Auth routes (login, callback, logout, me)
  app.use('/api/auth', authRoutes);

  // User preferences (protected)
  app.use('/api/preferences', preferenceRoutes);

  // Activity feed (protected)
  app.get('/api/activity', ensureAuth, async (req, res) => {
    try {
      const alerts = await getDB().all(
        `SELECT id, pet, egg, rarity, mutation, sent_at
         FROM alerts
         WHERE user_id = ?
         ORDER BY sent_at DESC
         LIMIT 50`,
        req.user.discord_id
      );
      res.json(
        alerts.map((alert) => ({
          id: String(alert.id),
          type: 'hatch',
          title: `${alert.pet} spawned`,
          detail: `${alert.egg} · ${alert.rarity || 'Unknown'} · ${alert.mutation || 'None'}`,
          time: alert.sent_at,
          status: 'Delivered',
        }))
      );
    } catch (err) {
      console.error('Activity fetch error:', err);
      res.status(500).json({ error: 'Failed to load activity' });
    }
  });

  // Webhook receiver (no auth – external source)
  app.use('/api/webhook', webhookRoutes);

  // Serve frontend static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('*', (_, res) =>
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
    );
  }

  // 404 fallback
  app.use((_, res) => res.status(404).json({ error: 'Not found' }));

  return app;
}

async function startServer() {
  await initDB();
  const port = process.env.PORT || 5000;
  return createServer().listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

if (require.main === module) startServer();
module.exports = { createServer, startServer };
