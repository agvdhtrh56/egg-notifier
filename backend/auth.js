const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

function setupAuth(app) {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => done(null, user.discord_id));
  passport.deserializeUser(async (id, done) => {
    try { done(null, await require('./database').getDB().get('SELECT * FROM users WHERE discord_id = ?', id)); }
    catch (error) { done(error); }
  });
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.DISCORD_REDIRECT_URI) return;
  passport.use(new DiscordStrategy({ clientID: process.env.DISCORD_CLIENT_ID, clientSecret: process.env.DISCORD_CLIENT_SECRET, callbackURL: process.env.DISCORD_REDIRECT_URI, scope: ['identify', 'email'] }, async (accessToken, refreshToken, profile, done) => {
    try {
      const db = require('./database').getDB();
      const existing = await db.get('SELECT discord_id FROM users WHERE discord_id = ?', profile.id);
      if (!existing) await db.run('INSERT INTO users (discord_id, username, avatar, access_token, refresh_token) VALUES (?, ?, ?, ?, ?)', profile.id, profile.username, profile.avatar, accessToken, refreshToken);
      else await db.run('UPDATE users SET username = ?, avatar = ?, access_token = ?, refresh_token = ? WHERE discord_id = ?', profile.username, profile.avatar, accessToken, refreshToken, profile.id);
      done(null, await db.get('SELECT * FROM users WHERE discord_id = ?', profile.id));
    } catch (error) { done(error); }
  }));
}
function ensureAuth(req, res, next) { if (req.isAuthenticated()) return next(); res.status(401).json({ error: 'Unauthorized' }); }
module.exports = { setupAuth, ensureAuth };
