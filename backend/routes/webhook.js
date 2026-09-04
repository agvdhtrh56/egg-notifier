const router = require('express').Router();
const { getDB } = require('../database');
const { sendDiscordNotification } = require('../webhook');

router.post('/spawn', async (req, res) => {
	const { pet, egg, rarity, mutation, biome } = req.body;
	if (!pet || !egg) return res.status(400).json({ error: 'Missing pet or egg' });
	if (!process.env.DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL.includes('your_webhook_')) return res.status(503).json({ error: 'DISCORD_WEBHOOK_URL is not configured' });
	const users = await getDB().all('SELECT * FROM users');
	const matchingUsers = users.filter((user) => { const prefs = JSON.parse(user.preferences); return prefs.notifications && (prefs.eggs.length === 0 || prefs.eggs.includes(egg)) && (prefs.pets.length === 0 || prefs.pets.includes(pet)) && (prefs.rarities.length === 0 || prefs.rarities.includes(rarity)) && (prefs.mutations.length === 0 || prefs.mutations.includes(mutation)); });
	 try { await sendDiscordNotification(matchingUsers, { pet, egg, rarity, mutation, biome }); } catch (error) { console.warn('Failed to send Discord channel notification:', error.message); return res.status(502).json({ error: 'Discord webhook delivery failed' }); }
	 for (const user of matchingUsers) await getDB().run('INSERT INTO alerts (user_id, pet, egg, rarity, mutation) VALUES (?, ?, ?, ?, ?)', user.discord_id, pet, egg, rarity, mutation);
	 res.json({ success: true, notified: matchingUsers.length, channelNotified: Boolean(process.env.DISCORD_WEBHOOK_URL) });
});
module.exports = router;
