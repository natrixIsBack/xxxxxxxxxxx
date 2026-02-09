const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('texttoimage')
    .setDescription('Crée une image avec un texte style Fortnite')
    .addStringOption(option =>
      option.setName('texte')
        .setDescription('Le texte à afficher')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption(option =>
      option.setName('couleur')
        .setDescription('Couleur du texte (hex code, par défaut: #FFD700)')
        .setRequired(false)
        .setMaxLength(7)
    ),
  async execute(interaction) {
    const texte = interaction.options.getString('texte').toUpperCase();
    const couleur = interaction.options.getString('couleur') || '#FFD700';

    try {
      // Créer un canvas de 1200x400
      const canvas = createCanvas(1200, 400);
      const ctx = canvas.getContext('2d');

      // Fond dégradé noir/gris foncé (style Fortnite)
      const gradient = ctx.createLinearGradient(0, 0, 1200, 400);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 400);

      // Configuration du texte style Fortnite
      ctx.font = 'bold italic 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Ajouter un contour noir (effet Fortnite caractéristique)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 8;
      ctx.strokeText(texte, 600, 200);

      // Texte couleur principale
      ctx.fillStyle = couleur;
      ctx.fillText(texte, 600, 200);

      // Ajouter un effet de brillance
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = 'bold italic 120px Arial';
      ctx.fillText(texte, 598, 198);

      // Convertir en attachment
      const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'fortnite-text.png' });

      await interaction.reply({ files: [attachment] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Erreur lors de la création de l\'image.', flags: 64 });
    }
  }
};
