const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannit un membre du serveur.')
    .addUserOption(opt => opt.setName('user').setDescription('Membre à bannir').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Raison').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'Membre introuvable.', flags: 64 });
    if (!member.bannable) return interaction.reply({ content: 'Je ne peux pas bannir ce membre.', flags: 64 });
    await member.ban({ reason });
    interaction.reply({ content: `✅ ${user.tag} a été banni. (${reason})` });
  }
};