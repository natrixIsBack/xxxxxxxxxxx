const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulse un membre du serveur.')
    .addUserOption(opt => opt.setName('user').setDescription('Membre à expulser').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Raison').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'Membre introuvable.', flags: 64 });
    if (!member.kickable) return interaction.reply({ content: 'Je ne peux pas expulser ce membre.', flags: 64 });
    await member.kick(reason);
    interaction.reply({ content: `✅ ${user.tag} a été expulsé. (${reason})` });
  }
};