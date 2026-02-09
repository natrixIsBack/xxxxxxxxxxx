const { SlashCommandBuilder } = require('discord.js');
const { purpleEmbed } = require('../../utils/embed');
module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Affiche la liste des commandes.'),
  async execute(interaction) {
    const embed = purpleEmbed('Aide — Commandes', `**Modération:** /kick /ban /mute /unmute /purge /warn\n**Giveaway:** /giveaway start end reroll\n**Utilitaires:** /ping /invite /setup-welcome`)
      .setFooter({ text: 'Utilise /deploy pour mettre à jour les commandes si tu modifies le code.' });
    interaction.reply({ embeds: [embed], flags: 64 });
  }
};