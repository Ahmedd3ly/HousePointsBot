const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listpermissions")
    .setDescription("Lists all available permissions."),

  async execute(interaction) {
    const permissions = [
      { name: "givePoints", description: "Allows giving points to houses" },
      { name: "takePoints", description: "Allows taking points from houses" },
      {
        name: "setPoints",
        description: "Allows setting points for any house or resetting to 0",
      },
      {
        name: "doAllOfTheAbove",
        description: "Allows performing all actions and setting permissions",
      },
    ];

    let description = permissions
      .map((p) => `**${p.name}**: ${p.description}`)
      .join("\n");

    await interaction.reply({ content: description, ephemeral: true });
  },
};
