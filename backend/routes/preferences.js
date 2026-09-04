const router = require('express').Router();
const { getDB } = require('../database');
const { ensureAuth } = require('../auth');
router.use(ensureAuth);
router.get('/', async (req, res) => { const user = await getDB().get('SELECT preferences FROM users WHERE discord_id = ?', req.user.discord_id); if (!user) return res.status(404).json({ error: 'User not found' }); res.json({ preferences: JSON.parse(user.preferences) }); });
router.post('/', async (req, res) => { const { eggs, pets, rarities, mutations, notifications } = req.body; const preferences = { eggs: eggs || [], pets: pets || [], rarities: rarities || [], mutations: mutations || [], notifications: notifications !== false }; await getDB().run('UPDATE users SET preferences = ? WHERE discord_id = ?', JSON.stringify(preferences), req.user.discord_id); res.json({ success: true, preferences }); });
module.exports = router;
