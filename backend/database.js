const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
let db;

async function initDB() {
  const dataDir = process.env.DATA_DIR || __dirname;
  fs.mkdirSync(dataDir, { recursive: true });
  db = await open({ filename: path.join(dataDir, 'db.sqlite'), driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (discord_id TEXT PRIMARY KEY, username TEXT, avatar TEXT, access_token TEXT, refresh_token TEXT, preferences TEXT DEFAULT '{"eggs":[],"pets":[],"rarities":[],"mutations":[],"notifications":true}', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, pet TEXT, egg TEXT, rarity TEXT, mutation TEXT, sent_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
  return db;
}
function getDB() { return db; }
async function getOrCreateUser(identifier) {
  const discordId = /^\d{17,20}$/.test(identifier) ? identifier : `local:${identifier.toLowerCase()}`;
  let user = await db.get('SELECT * FROM users WHERE discord_id = ?', discordId);
  if (!user) { await db.run('INSERT INTO users (discord_id, username) VALUES (?, ?)', discordId, identifier); user = await db.get('SELECT * FROM users WHERE discord_id = ?', discordId); }
  return user;
}
module.exports = { initDB, getDB, getOrCreateUser };
