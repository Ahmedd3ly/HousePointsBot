const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("showpermissions")
    .setDescription(
      "Shows all permissions and the roles associated with them."
    ),

  async execute(interaction) {
    const res = await db.query("SELECT permission, role_id FROM permissions");
    const permissions = res.rows;

    let description = "";
    for (const permission of permissions) {
      const role = interaction.guild.roles.cache.get(permission.role_id);
      description += `**${permission.permission}**: ${
        role ? role.name : "Unknown role"
      }\n`;
    }

    await interaction.reply({ content: description, ephemeral: true });
  },
};
