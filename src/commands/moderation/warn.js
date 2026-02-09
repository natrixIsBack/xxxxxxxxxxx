const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Donne un avertissement à un membre.')
    .addUserOption(opt => opt.setName('user').setDescription('Membre à avertir').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Raison').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
    const pathWarn = path.join(process.cwd(), 'data', 'warns.json');
    const warns = fs.existsSync(pathWarn) ? JSON.parse(fs.readFileSync(pathWarn, 'utf8')) : {};
    warns[user.id] = warns[user.id] || [];
    warns[user.id].push({ moderator: interaction.user.id, reason, date: new Date().toISOString() });
    fs.writeFileSync(pathWarn, JSON.stringify(warns, null, 2));
    try { await user.send(`Tu as reçu un avertissement sur ${interaction.guild.name} : ${reason}`); } catch(e){}
    interaction.reply({ content: `✅ ${user.tag} a été averti.`, flags: 64 });
  }
};