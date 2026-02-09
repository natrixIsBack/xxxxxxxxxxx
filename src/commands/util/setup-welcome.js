const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-welcome')
    .setDescription('Configure the welcome channel for new members.')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel for welcome messages').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const cfgPath = path.join(process.cwd(), 'data', 'guildConfig.json');
    const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : {};
    cfg[interaction.guildId] = cfg[interaction.guildId] || {};
    cfg[interaction.guildId].welcomeChannel = channel.id;
    fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
    interaction.reply({ content: `Welcome channel configured: ${channel}`, flags: 64 });
  }
};