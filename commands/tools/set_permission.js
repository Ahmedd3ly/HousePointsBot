const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setpermission")
    .setDescription("Assigns a permission to a role.")
    .addStringOption((option) =>
      option
        .setName("permission")
        .setDescription("The permission to assign")
        .setRequired(true)
        .addChoices(
          { name: "givePoints", value: "givePoints" },
          { name: "takePoints", value: "takePoints" },
          { name: "setPoints", value: "setPoints" },
          { name: "doAllOfTheAbove", value: "doAllOfTheAbove" }
        )
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to assign the permission to")
        .setRequired(true)
    ),

  async execute(interaction) {
    const permission = interaction.options.getString("permission");
    const role = interaction.options.getRole("role");

    // Check if the user has the 'doAllOfTheAbove' permission
    const userRoles = interaction.member.roles.cache;
    const requiredPermission = "doAllOfTheAbove";
    const res = await db.query(
      "SELECT role_id FROM permissions WHERE permission = $1",
      [requiredPermission]
    );
    const rolesWithPermission = res.rows.map((row) => row.role_id);

    const hasPermission = userRoles.some((r) =>
      rolesWithPermission.includes(r.id)
    );

    if (!hasPermission) {
      return interaction.reply({
        content: "You do not have permission to set permissions.",
        ephemeral: true,
      });
    }

    // Add the permission to the role
    await db.query(
      "INSERT INTO permissions (permission, role_id) VALUES ($1, $2)",
      [permission, role.id]
    );
    await interaction.reply({
      content: `Permission '${permission}' has been assigned to role ${role.name}.`,
      ephemeral: true,
    });
  },
};
