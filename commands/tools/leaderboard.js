const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../database/db"); // Adjust the path as needed
const houseDetails = require("../../utils/houseDetails"); // Import house details

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Returns the current houses leaderboard."),

  async execute(interaction, client) {
    try {
      // Fetch house points from your PostgreSQL database
      const result = await db.query(
        "SELECT * FROM house_points ORDER BY points DESC"
      );

      if (result.rows.length === 0) {
        await interaction.reply({
          content: "No house points found.",
          ephemeral: true,
        });
        return;
      }

      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle("Leaderboard - ترتيب نقاط المنازل")
        .setColor(client.color)
        .setImage("https://i.imgur.com/iAWN3vT.png") // General image for the leaderboard
        .setTimestamp(Date.now())
        .setAuthor({
          name: "Hourglass - سـاعة الـنقـاط",
        });

      // Add fields for each house
      let leadHouse = result.rows[0]; // First row has the house with the highest points
      result.rows.forEach((house) => {
        const houseDetail = houseDetails[house.house_name]; // Get the corresponding house details
        const houseEmoji = houseDetail ? houseDetail.emoji : ""; // Get the emoji
        const houseImage = houseDetail ? houseDetail.image : ""; // Get the image

        // Add the house name, points, and emoji to the embed fields
        embed.addFields({
          name: `${houseEmoji} ${house.house_name}`,
          value: `${house.points} points`,
          inline: true,
        });
      });

      // Set the footer with the leading house's name and image
      const leadingHouseDetail = houseDetails[leadHouse.house_name];
      const leadingHouseEmoji = leadingHouseDetail
        ? leadingHouseDetail.emoji
        : "";
      embed.setFooter({
        text: `${leadHouse.house_name} is in the lead!`, // Indicate which house is in the lead
        iconURL: leadingHouseDetail ? leadingHouseDetail.image : "", // Use the correct image for the leading house
      });

      // Reply with the embed
      await interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while fetching the leaderboard.",
        ephemeral: true,
      });
    }
  },
};
