const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { purpleEmbed } = require('../utils/embed');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      const cfgPath = path.join(__dirname, '..', '..', 'data', 'guildConfig.json');
      if (!fs.existsSync(cfgPath)) return;
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')) || {};
      const gCfg = cfg[member.guild.id];
      if (!gCfg || !gCfg.welcomeChannel) return;
      const channel = await member.guild.channels.fetch(gCfg.welcomeChannel).catch(() => null);
      if (!channel) return;
      const embed = purpleEmbed(`Welcome ${member.user.username}!`, `Welcome to **${member.guild.name}** — ${member} \nWe are now **${member.guild.memberCount}** members.`)
        .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 512 }))
        .setFooter({ text: `ID: ${member.id}` });
      channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Error in welcome event:', err);
    }

    // Mettre à jour le salon vocal avec le nouveau compteur
    try {
      const voiceConfigPath = path.join(__dirname, '..', '..', 'data', 'voiceConfig.json');
      if (!fs.existsSync(voiceConfigPath)) return;
      
      const voiceConfig = JSON.parse(fs.readFileSync(voiceConfigPath, 'utf8'));
      const voiceChannelId = voiceConfig[member.guild.id];
      
      if (!voiceChannelId) return;

      const voiceChannel = await member.guild.channels.fetch(voiceChannelId).catch(() => null);
      if (!voiceChannel) return;

      const memberCount = member.guild.memberCount;
      const newName = `👥 ${memberCount} members`;
      
      if (voiceChannel.name !== newName) {
        await voiceChannel.setName(newName).catch(err => console.error('Error updating voice channel name:', err.message));
      }
    } catch (err) {
      console.error('Error updating voice channel on guildMemberAdd:', err);
    }
  }
};