const axios = require('axios');
async function sendDiscordNotification(user, data) {
  if (!process.env.DISCORD_WEBHOOK_URL) return;
  const embed = { title: 'New Spawn Detected!', color: 0x9B59B6, fields: [{ name: 'Pet', value: data.pet, inline: true }, { name: 'Egg', value: data.egg, inline: true }, { name: 'Rarity', value: data.rarity || 'Unknown', inline: true }, { name: 'Mutation', value: data.mutation || 'None', inline: true }, { name: 'Biome', value: data.biome || 'Unknown', inline: true }], timestamp: new Date() };
  await axios.post(process.env.DISCORD_WEBHOOK_URL, { content: `<@${user.discord_id}> Your saved pet spawned!`, embeds: [embed] });
}
module.exports = { sendDiscordNotification };
