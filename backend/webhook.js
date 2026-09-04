const axios = require('axios');
async function sendDiscordNotification(user, data) {
  if (!process.env.DISCORD_WEBHOOK_URL) return;
  const embed = { title: 'New Spawn Detected!', color: 0x9B59B6, fields: [{ name: 'Pet', value: data.pet, inline: true }, { name: 'Egg', value: data.egg, inline: true }, { name: 'Rarity', value: data.rarity || 'Unknown', inline: true }, { name: 'Mutation', value: data.mutation || 'None', inline: true }, { name: 'Biome', value: data.biome || 'Unknown', inline: true }], timestamp: new Date() };
  const users = Array.isArray(user) ? user : user ? [user] : [];
  const mentions = users.map((item) => /^\d{17,20}$/.test(item.discord_id) ? `<@${item.discord_id}>` : `@${item.username}`);
  const content = mentions.length ? `${mentions.join(' ')} Your saved pet spawned!` : 'A matching spawn was detected.';
  await axios.post(process.env.DISCORD_WEBHOOK_URL, { content, embeds: [embed], allowed_mentions: { users: users.filter((item) => /^\d{17,20}$/.test(item.discord_id)).map((item) => item.discord_id) } });
}
module.exports = { sendDiscordNotification };
