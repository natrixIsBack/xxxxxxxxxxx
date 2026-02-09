const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { purpleEmbed } = require('../../utils/embed');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rewards')
    .setDescription('Affiche les récompenses disponibles selon le nombre d\'invites.'),
  async execute(interaction) {
    const embed = purpleEmbed(
      'LB Store - Rewards',
      '<:purple_arrow1:1470138964122931231> **2 invites = 500 instagram followers**\n\n' +
      '<:purple_arrow1:1470138964122931231> **5 invites = 2,000 instagram followers**\n\n' +
      '<:purple_arrow1:1470138964122931231> **10 invites = 8,000 instagram followers**\n\n' +
      '<:purple_arrow1:1470138964122931231> **20 invites = 15,000 instagram followers + nitro __1 month__**\n\n' +
      '<:purple_arrow1:1470138964122931231> **50+ invites = 35,000 instagram followers + nitro __1 year__**'
    )
    .setImage('attachment://rewards1.png');

    const imagePath = path.join(__dirname, '../../..', 'image', 'rewards1.png');
    const attachment = new AttachmentBuilder(imagePath, { name: 'rewards1.png' });

    await interaction.channel.send({ embeds: [embed], files: [attachment] });
  }
};
