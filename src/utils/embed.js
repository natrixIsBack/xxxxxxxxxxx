const { EmbedBuilder } = require('discord.js');
const PURPLE = '#6a0dad';
module.exports.purpleEmbed = (title, description) => {
  const e = new EmbedBuilder().setColor(PURPLE);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  return e;
};