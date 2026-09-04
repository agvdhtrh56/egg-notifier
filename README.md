# Egg Notifier

A Discord-integrated Roblox spawn notifier with a web dashboard.

## Setup

1. Copy `backend/.env.example` to `backend/.env` and fill in the Discord OAuth credentials, webhook URL, and session secret.
2. In Discord Developer Portal, add `http://localhost:5000/api/auth/discord/callback` under OAuth2 redirects.
3. Install dependencies:

```powershell
npm.cmd install
npm.cmd --prefix frontend install
npm.cmd --prefix backend install
```

4. Run development servers:

```powershell
npm.cmd run dev
```

Open `http://localhost:5173` and choose **Continue with Discord**.

## Deploy on Railway

Railway hosts the backend API and Vercel hosts the frontend dashboard.

1. Create a Railway service from this repository.
2. Add a Railway volume mounted at `/app/data`.
3. Add these variables to the Railway service:

```dotenv
NODE_ENV=production
SESSION_SECRET=generate_a_long_random_value
DISCORD_CLIENT_ID=your_discord_application_id
DISCORD_CLIENT_SECRET=your_discord_oauth_client_secret
DISCORD_REDIRECT_URI=https://your-railway-domain/api/auth/discord/callback
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_id/your_webhook_token
FRONTEND_URL=https://your-vercel-domain
DATA_DIR=/app/data
```

Set `DISCORD_REDIRECT_URI` to the same public URL shown by Railway, then add that URL under OAuth2 redirects in the Discord Developer Portal. Railway supplies `PORT` automatically; do not override it unless you have a specific reason.

The volume is required because the app stores users, alerts, and sessions in SQLite. Without it, those records are lost whenever Railway redeploys the service.

## Deploy the frontend on Vercel

1. Import this repository into Vercel.
2. Set the project root directory to `frontend`.
3. Use `npm run build` as the build command and `dist` as the output directory.
4. Add this Vercel environment variable:

```dotenv
VITE_API_URL=https://your-railway-domain/api
```

Set `FRONTEND_URL` on Railway to the Vercel deployment URL, then redeploy both services. The Discord callback remains on Railway because the OAuth routes are handled by the backend.

## Spawn Webhook

POST JSON to `http://localhost:5000/api/webhook/spawn`:

```json
{
  "pet": "Cosmic Dragon",
  "egg": "Dragon Egg",
  "rarity": "Legendary",
  "mutation": "Golden",
  "biome": "Cosmic"
}
```

The channel receives the notification directly. Matching alerts are stored in SQLite at `backend/db.sqlite`. OAuth supplies the verified numeric Discord ID used for real mentions.
