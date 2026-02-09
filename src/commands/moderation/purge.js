const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Supprime plusieurs messages (1-100).')
    .addIntegerOption(opt => opt.setName('count').setDescription('Nombre de messages').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const count = interaction.options.getInteger('count');
    if (count < 1 || count > 100) return interaction.reply({ content: 'Le nombre doit être entre 1 et 100.', flags: 64 });
    const fetched = await interaction.channel.bulkDelete(count, true).catch(err => null);
    interaction.reply({ content: `✅ ${fetched?.size || 0} messages supprimés.`, flags: 64 });
  }
};