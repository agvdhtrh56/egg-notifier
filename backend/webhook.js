const axios = require('axios');

const RARITY_COLORS = {
    Common: 0x808080, Uncommon: 0x00AA00, Rare: 0x0055FF,
    Epic: 0xAA00FF, Legendary: 0xFF8000, Mythic: 0xFF00FF,
    Cosmic: 0x00FFFF, Secret: 0xFF0000, Eternal: 0xFFD700,
    Divine: 0xFFFFFF, Titan: 0xFF4500, Golden: 0xFFD700,
    Silver: 0xC0C0C0, Rainbow: 0xFF00FF, Huge: 0x00FFAA,
    Mutated: 0x88FF88, Exclusive: 0x678431, Exotic: 0xFF1D00,
    Superior: 0xC3FFFF, Celestial: 0x00DD42
};

async function sendDiscordNotification(user, data) {
    if (!process.env.DISCORD_WEBHOOK_URL) {
        console.warn('DISCORD_WEBHOOK_URL not set. Skipping notification.');
        return;
    }

    const { pet, egg, rarity, mutation, biome, area } = data;
    const users = Array.isArray(user) ? user : user ? [user] : [];
    const discordUsers = users.filter((item) => item.discord_id && /^\d{17,20}$/.test(item.discord_id));
    const mentions = discordUsers.map((item) => `<@${item.discord_id}>`);
    const content = mentions.length ? `${mentions.join(' ')} - your egg just spawned!` : 'A matching egg spawned!';
    const embed = {
        title: `Egg Spawned: ${pet}`,
        color: RARITY_COLORS[rarity] || 0x9B59B6,
        thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/4315/4315605.png' },
        fields: [
            { name: 'Pet', value: pet, inline: true },
            { name: 'Egg', value: egg, inline: true },
            { name: 'Rarity', value: rarity || 'Unknown', inline: true },
            { name: 'Mutation', value: mutation || 'None', inline: true },
            { name: 'Biome', value: biome || 'Unknown', inline: true },
            { name: 'Area', value: area || 'Unknown', inline: true }
        ],
        footer: { text: 'Steal an Egg Notifier' },
        timestamp: new Date().toISOString()
    };

    try {
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {
            content,
            embeds: [embed],
            allowed_mentions: { users: discordUsers.map((item) => item.discord_id) }
        });
        console.log(`Discord notification sent (${discordUsers.length} users).`);
    } catch (error) {
        console.error('Discord webhook error:', error.message);
    }
}

module.exports = { sendDiscordNotification };
