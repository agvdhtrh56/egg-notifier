const router = require('express').Router();
const { getDB } = require('../database');

const eggFields = 'uid, pet, egg, asset_category, rarity, mutation, biome, area, value, weight, size, first_seen, last_seen, active';

router.get('/', async (req, res) => {
  const filters = [];
  const values = [];
  for (const field of ['rarity', 'biome', 'mutation']) {
    if (req.query[field]) {
      filters.push(`${field} = ?`);
      values.push(req.query[field]);
    }
  }
  if (req.query.search) {
    filters.push('(pet LIKE ? OR egg LIKE ? OR asset_category LIKE ?)');
    const search = `%${req.query.search}%`;
    values.push(search, search, search);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
  const eggs = await getDB().all(`SELECT ${eggFields} FROM eggs ${where} ORDER BY last_seen DESC LIMIT ?`, ...values, limit);
  res.json(eggs);
});

router.get('/latest', async (_, res) => {
  res.json(await getDB().all(`SELECT ${eggFields} FROM eggs WHERE active = 1 ORDER BY first_seen DESC LIMIT 50`));
});

router.get('/rare', async (_, res) => {
  res.json(await getDB().all(`SELECT ${eggFields} FROM eggs WHERE rarity IN ('Secret', 'Mythic', 'Titan', 'Divine', 'Legendary', 'Eternal') ORDER BY last_seen DESC`));
});

router.get('/stats', async (_, res) => {
  const db = getDB();
  const [today, rarityRows, biomeRows] = await Promise.all([
    db.get("SELECT COUNT(*) AS count FROM eggs WHERE first_seen >= datetime('now', '-1 day')"),
    db.all('SELECT LOWER(rarity) AS key, COUNT(*) AS count FROM eggs GROUP BY rarity'),
    db.all('SELECT LOWER(biome) AS key, COUNT(*) AS count FROM eggs GROUP BY biome')
  ]);
  const stats = { today: today.count };
  for (const row of [...rarityRows, ...biomeRows]) stats[row.key] = row.count;
  res.json(stats);
});

router.get('/:uid', async (req, res) => {
  const egg = await getDB().get(`SELECT ${eggFields} FROM eggs WHERE uid = ?`, req.params.uid);
  if (!egg) return res.status(404).json({ error: 'Egg not found' });
  res.json(egg);
});

module.exports = router;