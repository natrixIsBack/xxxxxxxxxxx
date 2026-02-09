const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    try {
      const configPath = path.join(__dirname, '..', '..', 'data', 'voiceConfig.json');
      if (!fs.existsSync(configPath)) return;
      
      const voiceConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const voiceChannelId = voiceConfig[newMember.guild.id];
      
      if (!voiceChannelId) return;

      const channel = await newMember.guild.channels.fetch(voiceChannelId).catch(() => null);
      if (!channel) return;

      // Mettre à jour le nom du salon avec le compteur
      const memberCount = newMember.guild.memberCount;
      const newName = `👥 ${memberCount} members`;
      
      if (channel.name !== newName) {
        await channel.setName(newName).catch(err => console.error('Erreur mise à jour nom vocal:', err.message));
      }
    } catch (err) {
      console.error('Erreur guildMemberUpdate:', err);
    }
  }
};
