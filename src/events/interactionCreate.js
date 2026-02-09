const fs = require('fs');
const path = require('path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { purpleEmbed } = require('../utils/embed');

const CONFIG_FILE = path.join(__dirname, '../../data/ticketsConfig.json');
const TICKETS_FILE = path.join(__dirname, '../../data/tickets.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Gestion des commandes slash
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return interaction.reply({ content: 'Command not found.', flags: 64 });
      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(err);
        if (interaction.replied || interaction.deferred) {
          interaction.followUp({ content: 'Error executing command.', flags: 64 });
        } else {
          interaction.reply({ content: 'Error executing command.', flags: 64 });
        }
      }
    }

    // Gestion des modals pour tickets
    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('ticketModal_')) {
        const guildId = interaction.customId.replace('ticketModal_', '');
        const title = interaction.fields.getTextInputValue('ticketTitle');
        const description = interaction.fields.getTextInputValue('ticketDescription');
        const buttonLabel = interaction.fields.getTextInputValue('ticketButtonLabel');

        let config = {};
        if (fs.existsSync(CONFIG_FILE)) {
          config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }

        if (!config[guildId]) {
          return interaction.reply({ content: '❌ Configuration not found.', flags: 64 });
        }

        // Créer l'embed du panel
        const panelEmbed = purpleEmbed(title, description);

        // Créer le bouton
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticketCreate')
            .setLabel(buttonLabel)
            .setStyle(ButtonStyle.Primary)
        );

        try {
          // Envoyer le message dans le canal courant
          const message = await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
          
          // Sauvegarder la configuration
          config[guildId].panelMessageId = message.id;
          fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

          interaction.reply({ 
            content: `✅ Ticket panel created successfully!`,
            flags: 64
          });
        } catch (err) {
          console.error('Erreur création panel:', err);
          interaction.reply({ content: '❌ Error creating panel.', flags: 64 });
        }
      }

      if (interaction.customId === 'ticketReason') {
        const reason = interaction.fields.getTextInputValue('reason');
        const userId = interaction.user.id;

        let config = {};
        if (fs.existsSync(CONFIG_FILE)) {
          config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }

        const guildConfig = config[interaction.guildId];
        if (!guildConfig) {
          return interaction.reply({ content: '❌ Configuration not found.', flags: 64 });
        }

        try {
          const category = await interaction.guild.channels.fetch(guildConfig.categoryId);
          
          // Créer le ticket
          const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${userId.slice(0, 5)}`,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
              {
                id: interaction.guildId,
                deny: ['ViewChannel'],
              },
              {
                id: userId,
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
              },
              {
                id: client.user.id,
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'],
              }
            ]
          });

          // Sauvegarder les infos du ticket
          let tickets = {};
          if (fs.existsSync(TICKETS_FILE)) {
            tickets = JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf8'));
          }

          tickets[ticketChannel.id] = {
            userId: userId,
            guildId: interaction.guildId,
            reason: reason,
            createdAt: new Date().toISOString(),
            closed: false
          };

          fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2));

          // Envoyer le message de bienvenue
          const ticketEmbed = purpleEmbed(
            `🎫 Ticket Created`,
            `**User:** <@${userId}>\n**Reason:** ${reason}\n\nWe will help you as soon as possible!`
          );

          const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticketClose')
              .setLabel('🔒 Close')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('ticketClaim')
              .setLabel('👤 Claim')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('ticketTranscript')
              .setLabel('📋 Transcript')
              .setStyle(ButtonStyle.Secondary)
          );

          await ticketChannel.send({ embeds: [ticketEmbed], components: [buttons] });

          interaction.reply({ 
            content: `✅ Ticket created: ${ticketChannel}`,
            flags: 64
          });
        } catch (err) {
          console.error('Erreur création ticket:', err);
          interaction.reply({ content: '❌ Error creating ticket.', flags: 64 });
        }
      }
    }

    // Gestion des boutons de vérification
    if (interaction.isButton()) {
      if (interaction.customId === 'ticketCreate') {
        const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
        
        const modal = new ModalBuilder()
          .setCustomId('ticketReason')
          .setTitle('Create a ticket');

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('reason')
              .setLabel('Ticket reason')
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder('Explain your problem in detail...')
              .setMinLength(10)
              .setMaxLength(1000)
              .setRequired(true)
          )
        );

        await interaction.showModal(modal);
      }

      if (interaction.customId === 'ticketClose') {
        let tickets = {};
        if (fs.existsSync(TICKETS_FILE)) {
          tickets = JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf8'));
        }

        const ticket = tickets[interaction.channelId];
        if (!ticket) {
          return interaction.reply({ content: '❌ Ticket not found.', flags: 64 });
        }

        if (interaction.user.id !== ticket.userId && !interaction.member.permissions.has('ManageChannels')) {
          return interaction.reply({ content: '❌ Vous n\'avez pas la permission.', flags: 64 });
        }

        try {
          let config = {};
          if (fs.existsSync(CONFIG_FILE)) {
            config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
          }

          const logsChannelId = config[interaction.guildId]?.logsChannelId;
          
          if (logsChannelId) {
            const logsChannel = await interaction.guild.channels.fetch(logsChannelId).catch(() => null);
            if (logsChannel) {
              const logEmbed = purpleEmbed(
                '🔒 Ticket fermé',
                `**Ticket:** <#${interaction.channelId}>\n**Utilisateur:** <@${ticket.userId}>\n**Raison:** ${ticket.reason}\n**Fermé par:** <@${interaction.user.id}>`
              );
              await logsChannel.send({ embeds: [logEmbed] });
            }
          }

          ticket.closed = true;
          ticket.closedAt = new Date().toISOString();
          ticket.closedBy = interaction.user.id;
          fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2));

          await interaction.reply({ content: 'Ticket closing in 5 seconds...', flags: 64 });
          
          setTimeout(() => {
            interaction.channel.delete().catch(err => console.error('Error deleting channel:', err));
          }, 5000);
        } catch (err) {
          console.error('Error closing ticket:', err);
          interaction.reply({ content: '❌ Error closing ticket.', flags: 64 });
        }
      }

      if (interaction.customId === 'ticketClaim') {
        let tickets = {};
        if (fs.existsSync(TICKETS_FILE)) {
          tickets = JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf8'));
        }

        const ticket = tickets[interaction.channelId];
        if (!ticket) {
          return interaction.reply({ content: '❌ Ticket not found.', flags: 64 });
        }

        ticket.claimedBy = interaction.user.id;
        ticket.claimedAt = new Date().toISOString();
        fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2));

        const claimEmbed = purpleEmbed(
          '👤 Ticket Claimed',
          `This ticket is now managed by <@${interaction.user.id}>`
        );

        interaction.reply({ embeds: [claimEmbed] });
      }

      if (interaction.customId.startsWith('verify_')) {
        const roleId = interaction.customId.replace('verify_', '');
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
          return interaction.reply({ content: 'Role does not exist.', flags: 64 });
        }

        try {
          await interaction.member.roles.add(role);
          interaction.reply({
            content: `🇬🇧 You are now verified and have access to the server!\n🇫🇷 Vous êtes maintenant vérifié et avez accès au serveur !`,
            flags: 64
          });
        } catch (err) {
          console.error(err);
          interaction.reply({
            content: 'Error assigning role.',
            flags: 64
          });
        }
      }
    }
  }
};
