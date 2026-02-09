const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { purpleEmbed } = require('../../utils/embed');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Envoie un message de vérification avec un bouton.')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Le rôle à attribuer lors de la vérification')
        .setRequired(true)
    ),
  async execute(interaction) {
    const role = interaction.options.getRole('role');

    // Créer le bouton de vérification
    const verifyButton = new ButtonBuilder()
      .setCustomId(`verify_${role.id}`)
      .setLabel('✅ Verify')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(verifyButton);

    // Créer l'embed avec l'image
    const imagePath = path.join(__dirname, '../../../image/lbstore.png');
    const attachment = new AttachmentBuilder(imagePath, { name: 'verify-image.png' });

    const embed = purpleEmbed(
      'Please verify yourself to access the server.',
      `🇬🇧 : Welcome to LB Store. Please log in to continue.\n🇫🇷 : Bienvenue chez LB Store. Vérifiez-vous pour continuer.`
    ).setImage('attachment://verify-image.png');

    await interaction.channel.send({
      embeds: [embed],
      components: [row],
      files: [attachment]
    });
  }
};
