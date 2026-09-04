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
        console.warn('DISCORD_WEBHOOK_URL not set.');
        return;
    }

    const { pet, egg, rarity, mutation, biome, area } = data;
    const users = Array.isArray(user) ? user : user ? [user] : [];
    const discordUsers = users.filter((item) => item.discord_id && /^\d{17,20}$/.test(item.discord_id));
    const mentions = discordUsers.map((item) => `<@${item.discord_id}>`);
    const content = mentions.length ? `${mentions.join(' ')} - your egg just spawned!` : 'A matching egg spawned!';
    const embed = {
        title: `${egg} Spawned!`,
        color: RARITY_COLORS[rarity] || 0x9B59B6,
        thumbnail: { url: 'https://www.bing.com/images/search?view=detailV2&ccid=qZd5Whwj&id=4F991A83925F3C71A775FEBCC538B91C858BEEC5&thid=OIP.qZd5WhwjcA3tKdVJeTxYVwHaHa&mediaurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.a997795a1c23700ded29d549793c5857%3frik%3dxe6LhRy5OMW8%252fg%26riu%3dhttp%253a%252f%252ficons.iconarchive.com%252ficons%252fgoogle%252fnoto-emoji-food-drink%252f1024%252f32390-egg-icon.png%26ehk%3diYh%252bC%252fovct80ZgumQbcyUvYbHBS6PlOvC%252bGJ7aNNja8%253d%26risl%3d%26pid%3dImgRaw%26r%3d0&exph=1024&expw=1024&q=egg+icon&mode=overlay&FORM=IQFRBA&ck=C10B74E9828C0E25C909150EEEF8D555&selectedIndex=0&idpp=serp' },
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
