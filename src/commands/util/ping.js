const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Affiche la latence du bot.'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pong...', fetchReply: true });
    interaction.editReply(`Pong! Latence API: ${Math.round(interaction.client.ws.ping)}ms — Réponse: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
  }
};