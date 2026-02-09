const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('invite').setDescription("Envoie le lien d'invitation du bot."),
  async execute(interaction) {
    const clientId = process.env.CLIENT_ID || interaction.client.user.id;
    const link = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot%20applications.commands&permissions=8`;
    interaction.reply({ content: `Invite le bot: ${link}`, flags: 64 });
  }
};