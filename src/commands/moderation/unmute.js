const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Retire le rôle Muted d\'un membre.')
    .addUserOption(o => o.setName('user').setDescription('Membre').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'Membre introuvable.', flags: 64 });
    const muteRole = interaction.guild.roles.cache.find(r => r.name === 'Muted');
    if (!muteRole || !member.roles.cache.has(muteRole.id)) return interaction.reply({ content: "Ce membre n'est pas mute.", flags: 64 });
    await member.roles.remove(muteRole);
    interaction.reply({ content: `✅ ${user.tag} a été unmute.` });
  }
};