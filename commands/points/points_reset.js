const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../database/db"); // Import the database connection

const TARGET_CHANNEL_ID = process.env.CHANNEL_ID; // Replace with your target channel ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName("points_reset")
    .setDescription("Resets all house points to 0."),

  async execute(interaction) {
    const userRoles = interaction.member.roles.cache.map((role) => role.id);

    // Permissions required for this command
    const requiredPermissions = ["setPoints", "doAllOfTheAbove"];

    try {
      // Fetch roles with the required permissions
      const rolesWithPermissions = [];

      for (const permission of requiredPermissions) {
        const res = await db.query(
          "SELECT role_id FROM permissions WHERE permission = $1",
          [permission]
        );
        rolesWithPermissions.push(...res.rows.map((row) => row.role_id));
      }

      // Check if the user has a role with any of the required permissions
      const hasPermission = userRoles.some((role) =>
        rolesWithPermissions.includes(role)
      );

      if (!hasPermission) {
        return await interaction.reply({
          content: "You do not have permission to reset points.",
          ephemeral: true,
        });
      }

      // Reset points in PostgreSQL for all houses
      await db.query("UPDATE house_points SET points = 0");

      // Create the embed for the reset action
      const embed = new EmbedBuilder()
        .setTitle("Points Reset")
        .setDescription("All house points have been reset to **0**.")
        .setColor(0x00ae86) // You can set a default color for the embed
        .setTimestamp();

      // Send the embed to the designated channel
      const targetChannel = await interaction.client.channels.fetch(
        TARGET_CHANNEL_ID
      );
      await targetChannel.send({ embeds: [embed] });

      // Inform the user in the original command channel
      await interaction.reply({
        content: `All Points have been set to 0 and the details have been posted in <#${TARGET_CHANNEL_ID}>.`,
        ephemeral: true,
      });
    } catch (err) {
      console.error("Error executing givePoints command:", err);
      await interaction.reply({
        content:
          "An error occurred while updating points. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
