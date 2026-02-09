const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-reroll')
    .setDescription('Reroll a giveaway (choose new winners)')
    .addStringOption(o => o.setName('messageid').setDescription('Giveaway message ID').setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ content: 'Permission denied.', flags: 64 });
    try {
      const messageId = interaction.options.getString('messageid');
      const gFile = path.join(__dirname, '..', '..', '..', 'data', 'giveaways.json');
      const data = fs.existsSync(gFile) ? JSON.parse(fs.readFileSync(gFile, 'utf8')) : [];
      const g = data.find(x => x.messageId === messageId && x.ended);
      if (!g) return interaction.reply({ content: 'Giveaway not found or not finished.', flags: 64 });

      const guild = await interaction.client.guilds.fetch(g.guildId);
      const channel = await guild.channels.fetch(g.channelId);
      let message = await channel.messages.fetch(g.messageId);
      message = await message.fetch().catch(() => message);

      const reaction = message.reactions.cache.get('🎉');
      if (!reaction) return interaction.reply({ content: 'No participants (no 🎉 reaction on the message).', flags: 64 });
      const usersCol = await reaction.users.fetch();
      const users = usersCol.filter(u => !u.bot).map(u => u.id) || [];
      if (users.length === 0) return interaction.reply({ content: 'No participants.', flags: 64 });
      const winners = [];
      for (let i=0;i<Math.min(g.winners, users.length); i++) {
        const chosen = users.splice(Math.floor(Math.random()*users.length),1)[0];
        winners.push(`<@${chosen}>`);
      }
      channel.send({ content: `🔁 **Reroll** — New winner(s) for **${g.prize}** : ${winners.join(', ')}` });
      interaction.reply({ content: '✅ Reroll completed.', flags: 64 });
    } catch (err) {
      console.error('Error rerolling giveaway:', err);
      interaction.reply({ content: 'Error while rerolling.', flags: 64 });
    }
  }
};