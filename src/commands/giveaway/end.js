const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-end')
    .setDescription('Force end of a giveaway (by message id)')
    .addStringOption(o => o.setName('messageid').setDescription('Giveaway message ID').setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ content: 'Permission denied.', flags: 64 });
    try {
      const messageId = interaction.options.getString('messageid');
      const gFile = path.join(__dirname, '..', '..', '..', 'data', 'giveaways.json');
      const data = fs.existsSync(gFile) ? JSON.parse(fs.readFileSync(gFile, 'utf8')) : [];
      const g = data.find(x => x.messageId === messageId && !x.ended);
      if (!g) return interaction.reply({ content: 'Giveaway not found or already ended.', flags: 64 });
      g.ended = true;
      fs.writeFileSync(gFile, JSON.stringify(data, null, 2));
      // pick winners
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
      channel.send({ content: `🎉 **Giveaway ended** — **${g.prize}**\nWinners: ${winners.join(', ')}` });
      interaction.reply({ content: '✅ Giveaway ended and winner(s) announced.', flags: 64 });
    } catch (err) {
      console.error('Error ending giveaway:', err);
      interaction.reply({ content: 'Error ending giveaway.', flags: 64 });
    }
  }
};