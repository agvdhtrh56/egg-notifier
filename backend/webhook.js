const router = require("express").Router();
const { sendDiscordNotification } = require("../webhook"); // adjust path to your helper

// In-memory database for demo – replace with actual DB (SQLite, PostgreSQL, etc.)
// Structure: { discord_id: { eggs: [], rarities: [], mutations: [] } }
let userPreferences = {};

// For production, use a real database. This is just for testing.
// You can load from a file or use SQLite.

router.post("/spawn", async (req, res) => {
    try {
        const { pet, egg, rarity, mutation, biome, area } = req.body;
        console.log("📥 Received spawn:", { pet, egg, rarity, mutation, biome, area });

        // Find all users who want this egg, rarity, or mutation
        const matchingUsers = [];
        for (const [discordId, prefs] of Object.entries(userPreferences)) {
            const { eggs = [], rarities = [], mutations = [] } = prefs;
            const eggMatch = eggs.length === 0 || eggs.includes(egg);
            const rarityMatch = rarities.length === 0 || rarities.includes(rarity);
            const mutationMatch = mutations.length === 0 || mutations.includes(mutation);
            if (eggMatch && rarityMatch && mutationMatch) {
                matchingUsers.push({ discord_id: discordId, username: "User" }); // store username separately
            }
        }

        // Send Discord notifications
        if (matchingUsers.length > 0) {
            await sendDiscordNotification(matchingUsers, { pet, egg, rarity, mutation, biome });
            console.log(`✅ Notified ${matchingUsers.length} users.`);
        } else {
            console.log("ℹ️ No users matched this spawn.");
        }

        res.json({ success: true, notified: matchingUsers.length });
    } catch (error) {
        console.error("❌ Error in /spawn:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// (Optional) Endpoint to set user preferences (for testing)
router.post("/preferences", (req, res) => {
    const { discord_id, eggs, rarities, mutations } = req.body;
    if (!discord_id) {
        return res.status(400).json({ success: false, error: "Missing discord_id" });
    }
    userPreferences[discord_id] = { eggs: eggs || [], rarities: rarities || [], mutations: mutations || [] };
    res.json({ success: true });
});

module.exports = router;
