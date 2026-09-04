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
