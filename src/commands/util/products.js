const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { purpleEmbed } = require('../../utils/embed');

const DATA_FILE = path.join(__dirname, '../../..', 'data', 'products.json');

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) || {};
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('products')
    .setDescription('Manage or display products embed')
    .addSubcommand(s => s.setName('show').setDescription('Show the products embed'))
    .addSubcommand(s => s.setName('addfield').setDescription('Add a field to the products embed')
      .addStringOption(o => o.setName('title').setDescription('Field title').setRequired(true))
      .addStringOption(o => o.setName('description').setDescription('Field description').setRequired(true)))
    .addSubcommand(s => s.setName('editfield').setDescription('Edit a field by index')
      .addIntegerOption(o => o.setName('index').setDescription('Field index (starting at 1)').setRequired(true))
      .addStringOption(o => o.setName('title').setDescription('New field title').setRequired(false))
      .addStringOption(o => o.setName('description').setDescription('New field description').setRequired(false)))
    .addSubcommand(s => s.setName('removefield').setDescription('Remove a field by index')
      .addIntegerOption(o => o.setName('index').setDescription('Field index (starting at 1)').setRequired(true)))
    .addSubcommand(s => s.setName('set').setDescription('Set embed title/description')
      .addStringOption(o => o.setName('title').setDescription('Embed title').setRequired(false))
      .addStringOption(o => o.setName('description').setDescription('Embed description').setRequired(false)))
    .addSubcommand(s => s.setName('clear').setDescription('Clear the products embed and fields')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const data = loadData();
    const guildId = interaction.guildId;
    if (!data[guildId]) data[guildId] = { title: 'Products', description: '', fields: [] };

    // permission for manage commands
    const needsManage = ['addfield','editfield','removefield','set','clear'];
    if (needsManage.includes(sub) && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: 'Permission denied.', flags: 64 });
    }

    if (sub === 'show') {
      const cfg = data[guildId];
      const embed = purpleEmbed(cfg.title, cfg.description);
      for (const f of cfg.fields) embed.addFields({ name: f.title, value: f.description });
      // Acknowledge privately then post publicly without leaving a visible reply
      await interaction.deferReply({ flags: 64 });
      await interaction.channel.send({ embeds: [embed] });
      await interaction.deleteReply();
      return;
    }

    if (sub === 'addfield') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      data[guildId].fields.push({ title, description });
      saveData(data);
      return interaction.reply({ content: `Field added (#${data[guildId].fields.length}).`, flags: 64 });
    }

    if (sub === 'editfield') {
      const index = interaction.options.getInteger('index');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const idx = index - 1;
      if (!data[guildId].fields[idx]) return interaction.reply({ content: 'Field not found.', flags: 64 });
      if (title) data[guildId].fields[idx].title = title;
      if (description) data[guildId].fields[idx].description = description;
      saveData(data);
      return interaction.reply({ content: `Field #${index} updated.`, flags: 64 });
    }

    if (sub === 'removefield') {
      const index = interaction.options.getInteger('index');
      const idx = index - 1;
      if (!data[guildId].fields[idx]) return interaction.reply({ content: 'Field not found.', flags: 64 });
      data[guildId].fields.splice(idx, 1);
      saveData(data);
      return interaction.reply({ content: `Field #${index} removed.`, flags: 64 });
    }

    if (sub === 'set') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      if (title !== null && title !== undefined) data[guildId].title = title;
      if (description !== null && description !== undefined) data[guildId].description = description;
      saveData(data);
      return interaction.reply({ content: 'Embed updated.', flags: 64 });
    }

    if (sub === 'clear') {
      data[guildId] = { title: 'Products', description: '', fields: [] };
      saveData(data);
      return interaction.reply({ content: 'Products embed cleared.', flags: 64 });
    }
  }
};
