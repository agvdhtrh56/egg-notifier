const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
let db;

async function initDB() {
  db = await open({ filename: path.join(__dirname, 'db.sqlite'), driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (discord_id TEXT PRIMARY KEY, username TEXT, avatar TEXT, access_token TEXT, refresh_token TEXT, preferences TEXT DEFAULT '{"eggs":[],"pets":[],"rarities":[],"mutations":[],"notifications":true}', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, pet TEXT, egg TEXT, rarity TEXT, mutation TEXT, sent_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
  return db;
}
function getDB() { return db; }
module.exports = { initDB, getDB };
