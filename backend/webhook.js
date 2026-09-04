const axios = require('axios');

async function sendDiscordNotification(user, data) {
    if (!process.env.DISCORD_WEBHOOK_URL) {
        console.warn("⚠️ DISCORD_WEBHOOK_URL not set. Skipping notification.");
        return;
    }

    const embed = {
        title: 'New Spawn Detected!',
        color: 0x9B59B6,
        fields: [
            { name: 'Pet', value: data.pet, inline: true },
            { name: 'Egg', value: data.egg, inline: true },
            { name: 'Rarity', value: data.rarity || 'Unknown', inline: true },
            { name: 'Mutation', value: data.mutation || 'None', inline: true },
            { name: 'Biome', value: data.biome || 'Unknown', inline: true }
        ],
        timestamp: new Date()
    };

    const users = Array.isArray(user) ? user : user ? [user] : [];
    const mentions = users.map((item) =>
        /^\d{17,20}$/.test(item.discord_id)
            ? `<@${item.discord_id}>`
            : `@${item.username}`
    );
    const content = mentions.length
        ? `${mentions.join(' ')} Your saved pet spawned!`
        : 'A matching spawn was detected.';

    try {
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {
            content,
            embeds: [embed],
            allowed_mentions: {
                users: users
                    .filter((item) => /^\d{17,20}$/.test(item.discord_id))
                    .map((item) => item.discord_id)
            }
        });
        console.log("✅ Discord notification sent.");
    } catch (error) {
        console.error("❌ Discord webhook error:", error.message);
    }
}

module.exports = { sendDiscordNotification };
