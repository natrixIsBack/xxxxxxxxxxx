const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { purpleEmbed } = require('../../utils/embed');

const CONFIG_FILE = path.join(__dirname, '../../..', 'data', 'ticketsConfig.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Configure the ticket system')
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Create the ticket panel')
    )
    .addSubcommand(sub =>
      sub.setName('config')
        .setDescription('Configure tickets (category, logs)')
        .addChannelOption(opt =>
          opt.setName('category')
            .setDescription('Category for tickets')
            .setRequired(true)
        )
        .addChannelOption(opt =>
          opt.setName('logs')
            .setDescription('Channel for ticket logs (optional)')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'config') {
      const category = interaction.options.getChannel('category');
      const logsChannel = interaction.options.getChannel('logs');

      if (category.type !== 4) {
        return interaction.reply({ content: '❌ Please select a valid category.', flags: 64 });
      }

      let config = {};
      if (fs.existsSync(CONFIG_FILE)) {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      }

      config[interaction.guildId] = {
        categoryId: category.id,
        logsChannelId: logsChannel?.id || null,
        panelMessageId: config[interaction.guildId]?.panelMessageId || null
      };

      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      const embed = purpleEmbed('✅ Configuration saved', 
        `**Category:** ${category}\n${logsChannel ? `**Logs:** ${logsChannel}` : ''}`
      );
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    if (subcommand === 'create') {
      let config = {};
      if (fs.existsSync(CONFIG_FILE)) {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      }

      if (!config[interaction.guildId]) {
        return interaction.reply({ 
          content: '❌ Please first configure tickets with `/ticketsetup config`.', 
          flags: 64
        });
      }

      const modal = new ModalBuilder()
        .setCustomId(`ticketModal_${interaction.guildId}`)
        .setTitle('Ticket Panel Configuration');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('ticketTitle')
            .setLabel('Panel title')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Support LB Store')
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('ticketDescription')
            .setLabel('Panel description')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: Click the button to open a ticket')
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('ticketButtonLabel')
            .setLabel('Button text')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Open a ticket')
            .setValue('📩 Open a ticket')
            .setRequired(true)
        )
      );

      await interaction.showModal(modal);
    }
  }
};
