const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../database/db"); // Import the database connection
const houseDetails = require("../../utils/houseDetails"); // Import house details

const TARGET_CHANNEL_ID = process.env.CHANNEL_ID; // Replace with your target channel ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName("take_points")
    .setDescription("Takes points from a house.")
    .addStringOption((option) =>
      option
        .setName("house")
        .setDescription("The house to take points from")
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
        .setDescription("The number of points to take")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user from whom the points are deducted") // Make this optional
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for deducting the points") // Make this optional
        .setRequired(false)
    ),

  async execute(interaction) {
    const house = interaction.options.getString("house");
    const points = interaction.options.getInteger("points");
    const deductedUser = interaction.options.getUser("user"); // This is now optional
    const reason = interaction.options.getString("reason"); // This is now optional
    const deductingUser = interaction.user; // The user deducting the points
    const userRoles = interaction.member.roles.cache.map((role) => role.id);

    // Permissions check for both 'takePoints' and 'doAllOfTheAbove'
    const requiredPermissions = ["takePoints", "doAllOfTheAbove"];

    try {
      // Fetch roles with either 'takePoints' or 'doAllOfTheAbove' permission
      const res = await db.query(
        "SELECT role_id FROM permissions WHERE permission = ANY($1::text[])",
        [requiredPermissions]
      );
      const rolesWithPermission = res.rows.map((row) => row.role_id);

      // Check if the user has a role with one of the required permissions
      const hasPermission = userRoles.some((role) =>
        rolesWithPermission.includes(role)
      );

      if (!hasPermission) {
        return interaction.reply({
          content: "You do not have permission to take points.",
          ephemeral: true,
        });
      }

      // Update points in the database
      await db.query(
        "UPDATE house_points SET points = points - $1 WHERE house_name = $2",
        [points, house]
      );

      // Get updated points for all houses
      const leaderboardRes = await db.query(
        "SELECT house_name, points FROM house_points ORDER BY points DESC"
      );
      const leaderboard = leaderboardRes.rows;

      // Determine the leading house
      const leadingHouse = leaderboard[0].house_name;

      // Create the embed for deducted points
      const embed = new EmbedBuilder()
        .setTitle(
          `${houseDetails[house].emoji} **${points} Points from ${house}**`
        )
        .setColor(houseDetails[house].color)
        .setDescription(
          `
        **تم خـصـم النقاط بواسطة** <@${deductingUser.id}>\n
         ${
           reason
             ? `**السبـب**\n
        خصمت النقاط من ${deductedUser ? `<@${deductedUser.id}>` : " "} ${reason}`
             : ""
         }
      `
        )
        .setImage(houseDetails[house].gif)
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

      // Add the leading house in the footer
      embed.setFooter({
        text: `${leadingHouse} is currently in the lead!`,
        iconURL: houseDetails[leadingHouse].image,
      });

      // Send the embed to the designated channel
      const targetChannel = await interaction.client.channels.fetch(
        TARGET_CHANNEL_ID
      );
      await targetChannel.send({ embeds: [embed] });

      // Inform the user in the original command channel
      await interaction.reply({
        content: `Points have been deducted from ${house} and the details have been posted in <#${TARGET_CHANNEL_ID}>.`,
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
