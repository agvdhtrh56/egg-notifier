const router = require('express').Router();
const passport = require('passport');
router.get('/discord', passport.authenticate('discord'));
router.get('/discord/callback', passport.authenticate('discord', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=1`, successRedirect: `${process.env.FRONTEND_URL}/preferences` }));
router.get('/logout', (req, res) => req.logout(() => res.redirect(process.env.FRONTEND_URL)));
router.get('/me', (req, res) => req.user ? res.json({ user: req.user }) : res.status(401).json({ error: 'Not authenticated' }));
module.exports = router;
