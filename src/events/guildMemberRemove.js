const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
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
        await voiceChannel.setName(newName).catch(err => console.error('Erreur mise à jour nom vocal:', err.message));
      }
    } catch (err) {
      console.error('Erreur guildMemberRemove:', err);
    }
  }
};
