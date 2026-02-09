const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-start')
    .setDescription('Start a giveaway')
    .addChannelOption(o => o.setName('channel').setDescription('Channel for the giveaway').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('Duration (ex: 1h, 30m)').setRequired(true))
    .addStringOption(o => o.setName('prize').setDescription('Prize').setRequired(true))
    .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ content: 'Permission denied.', flags: 64 });
    try {
      const channel = interaction.options.getChannel('channel');
      const durationStr = interaction.options.getString('duration');
      const prize = interaction.options.getString('prize');
      const winners = interaction.options.getInteger('winners') || 1;
      const duration = ms(durationStr);
      if (!duration || duration <= 0) return interaction.reply({ content: 'Invalid duration.', flags: 64 });
      if (!channel || !channel.isTextBased()) return interaction.reply({ content: 'Invalid channel to send message.', flags: 64 });

      const endTs = Math.floor((Date.now() + duration) / 1000);
      const embed = new EmbedBuilder()
        .setTitle(`🎉 Giveaway — ${prize}`)
        .setDescription(`Ends: <t:${endTs}:F> (<t:${endTs}:R>)\nWinners: ${winners}`)
        .setColor(0x6a0dad);
      const msg = await channel.send({ embeds: [embed] });
      try { await msg.react('🎉'); } catch (e) { console.warn('Could not react to giveaway message:', e); }

      // s'assurer que le message est à jour dans le cache
      const fetched = await msg.fetch().catch(() => msg);

      const gFile = path.join(__dirname, '..', '..', '..', 'data', 'giveaways.json');
      const data = fs.existsSync(gFile) ? JSON.parse(fs.readFileSync(gFile, 'utf8')) : [];
      data.push({ guildId: interaction.guildId, channelId: channel.id, messageId: fetched.id, prize, winners, endsAt: Date.now() + duration, ended: false });
      fs.writeFileSync(gFile, JSON.stringify(data, null, 2));
      interaction.reply({ content: `✅ Giveaway started in ${channel}`, flags: 64 });
    } catch (err) {
      console.error('Error starting giveaway:', err);
      interaction.reply({ content: 'Error starting giveaway.', flags: 64 });
    }
  }
};