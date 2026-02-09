const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute un membre en lui ajoutant le rôle Muted.')
    .addUserOption(o => o.setName('user').setDescription('Membre').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Raison'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'Membre introuvable.', flags: 64 });
    let muteRole = interaction.guild.roles.cache.find(r => r.name === 'Muted');
    if (!muteRole) {
      muteRole = await interaction.guild.roles.create({ name: 'Muted', reason: 'Role de mute automatique', permissions: [] });
      // Bloque l'envoi de messages dans les channels textuels
      for (const [id, channel] of interaction.guild.channels.cache) {
        try {
          if (channel.isTextBased && channel.permissionsFor) {
            await channel.permissionOverwrites.edit(muteRole, { SendMessages: false, AddReactions: false, Speak: false });
          }
        } catch (e) {}
      }
    }
    await member.roles.add(muteRole, reason);
    interaction.reply({ content: `✅ ${user.tag} a été mute. (${reason})` });
  }
};