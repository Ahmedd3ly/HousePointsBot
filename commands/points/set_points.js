const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../database/db"); // Import the database connection
const houseDetails = require("../../utils/houseDetails"); // Import house details

const TARGET_CHANNEL_ID = process.env.CHANNEL_ID; // Replace with your target channel ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set_points")
    .setDescription("Sets or resets points for each house.")
    .addStringOption((option) =>
      option
        .setName("house")
        .setDescription("The house to set/reset points for")
        .setRequired(true)
        .addChoices(
          { name: "Gryffindor", value: "Gryffindor" },
          { name: "Hufflepuff", value: "Hufflepuff" },
          { name: "Ravenclaw", value: "Ravenclaw" },
          { name: "Slytherin", value: "Slytherin" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("points")
        .setDescription("The number of points to set (use 0 to reset)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const house = interaction.options.getString("house");
    const points = interaction.options.getInteger("points");
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
          content: "You do not have permission to set points.",
          ephemeral: true,
        });
      }

      // Update points in PostgreSQL
      await db.query(
        "UPDATE house_points SET points = $1 WHERE house_name = $2",
        [points, house]
      );

      // Get updated points for all houses
      const leaderboardRes = await db.query(
        "SELECT house_name, points FROM house_points ORDER BY points DESC"
      );
      const leaderboard = leaderboardRes.rows;

      // Create the embed for the updated points
      const embed = new EmbedBuilder()
        .setTitle(`${house} Points Updated`)
        .setColor(houseDetails[house].color) // Set color based on the house
        .setDescription(`Points for ${house} have been set to **${points}**.`)
        .setTimestamp();

      // Add the leaderboard
      embed.addFields({ name: "Leaderboard - ترتيب نقاط المنازل", value: " " });
      leaderboard.forEach((entry) => {
        embed.addFields({
          name: `${houseDetails[entry.house_name].emoji} ${entry.house_name}`,
          value: `${entry.points} points`,
          inline: true,
        });
      });

      // Send the embed to the designated channel
      const targetChannel = await interaction.client.channels.fetch(
        TARGET_CHANNEL_ID
      );
      await targetChannel.send({ embeds: [embed] });

      // Inform the user in the original command channel
      await interaction.reply({
        content: `Points for ${house} has been set and the details have been posted in <#${TARGET_CHANNEL_ID}>.`,
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
