const router = require('express').Router();
const passport = require('passport');
router.get('/discord', passport.authenticate('discord'));
router.get('/discord/callback', (req, res, next) => passport.authenticate('discord', (error, user) => {
	if (error) {
		console.warn('Discord token exchange failed:', JSON.stringify({ name: error.name, message: error.message, code: error.code, statusCode: error.statusCode, data: error.data, oauthError: error.oauthError?.data }));
		return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_token_exchange`);
	}
	if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_denied`);
	req.logIn(user, (loginError) => {
		if (loginError) return next(loginError);
		res.redirect(`${process.env.FRONTEND_URL}/preferences`);
	});
})(req, res, next));
router.get('/logout', (req, res) => req.session.destroy(() => res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173')));
router.get('/me', (req, res) => req.isAuthenticated() ? res.json({ user: req.user }) : res.status(401).json({ error: 'Not authenticated' }));
module.exports = router;
