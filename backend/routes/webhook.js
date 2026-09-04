const router = require('express').Router();
const crypto = require('crypto');
const { getDB } = require('../database');
const { sendDiscordNotification } = require('../webhook');

router.post('/spawn', async (req, res) => {
	const configuredKey = process.env.ROBLOX_API_KEY;
	if (configuredKey) {
		const suppliedKey = req.get('x-api-key') || '';
		const keysMatch = suppliedKey.length === configuredKey.length && crypto.timingSafeEqual(Buffer.from(suppliedKey), Buffer.from(configuredKey));
		if (!keysMatch) return res.status(401).json({ error: 'Invalid API key' });
	}
	const { uid, pet, egg, asset_category, rarity, mutation, biome, area, value, weight, size } = req.body;
	if (!pet || !egg) return res.status(400).json({ error: 'Missing pet or egg' });
	const eggUid = String(uid || `${pet}:${egg}:${area || biome || 'unknown'}`);
	const db = getDB();
	await db.run(`INSERT INTO eggs (uid, pet, egg, asset_category, rarity, mutation, biome, area, value, weight, size, first_seen, last_seen, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1) ON CONFLICT(uid) DO UPDATE SET pet = excluded.pet, egg = excluded.egg, asset_category = excluded.asset_category, rarity = excluded.rarity, mutation = excluded.mutation, biome = excluded.biome, area = excluded.area, value = excluded.value, weight = excluded.weight, size = excluded.size, last_seen = CURRENT_TIMESTAMP, active = 1`, eggUid, pet, egg, asset_category || null, rarity || null, mutation || null, biome || null, area || null, value ?? null, weight ?? null, size ?? null);
	if (!process.env.DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL.includes('your_webhook_')) return res.status(503).json({ error: 'DISCORD_WEBHOOK_URL is not configured' });
	const users = await db.all('SELECT * FROM users');
	const matchingUsers = users.filter((user) => { const prefs = JSON.parse(user.preferences); return prefs.notifications && (prefs.eggs.length === 0 || prefs.eggs.includes(egg)) && (prefs.pets.length === 0 || prefs.pets.includes(pet)) && (prefs.rarities.length === 0 || prefs.rarities.includes(rarity)) && (prefs.mutations.length === 0 || prefs.mutations.includes(mutation)); });
	 try { await sendDiscordNotification(matchingUsers, { pet, egg, rarity, mutation, biome, area }); } catch (error) { console.warn('Failed to send Discord channel notification:', error.message); return res.status(502).json({ error: 'Discord webhook delivery failed' }); }
	 for (const user of matchingUsers) await db.run('INSERT INTO alerts (user_id, pet, egg, rarity, mutation) VALUES (?, ?, ?, ?, ?)', user.discord_id, pet, egg, rarity, mutation);
	 res.json({ success: true, uid: eggUid, notified: matchingUsers.length, channelNotified: Boolean(process.env.DISCORD_WEBHOOK_URL) });
});
module.exports = router;
