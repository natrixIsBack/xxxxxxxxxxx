const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('massrole')
    .setDescription('Assign a role to all members')
    .addSubcommand(sub => sub.setName('give').setDescription('Give a role to all members')
      .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true))
      .addBooleanOption(o => o.setName('dry').setDescription('Dry run (do not assign, only count)').setRequired(false))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'give') {
      const role = interaction.options.getRole('role');
      const dry = interaction.options.getBoolean('dry') || false;

      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: 'Permission denied.', flags: 64 });
      }

      // Check bot role position
      const me = interaction.guild.members.me;
      if (!me) {
        return interaction.reply({ content: 'Could not fetch bot member info.', flags: 64 });
      }
      if (me.roles.highest.comparePositionTo(role) <= 0) {
        return interaction.reply({ content: 'I cannot assign that role because it is higher or equal to my highest role.', flags: 64 });
      }

      await interaction.reply({ content: 'Starting role assignment (this may take a while)...', flags: 64 });

      const members = await interaction.guild.members.fetch();
      let added = 0;
      let skipped = 0;
      let failed = 0;

      for (const member of members.values()) {
        if (member.user.bot) continue;
        if (member.roles.cache.has(role.id)) {
          skipped++;
          continue;
        }
        if (dry) {
          added++;
          continue;
        }
        try {
          await member.roles.add(role, `Mass role assigned by ${interaction.user.tag}`);
          added++;
        } catch (err) {
          failed++;
        }
      }

      await interaction.followUp({ content: `Done. Assigned role to ${added} members. Skipped ${skipped}. Failed ${failed}.`, flags: 64 });
    }
  }
};
