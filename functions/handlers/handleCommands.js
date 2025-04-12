const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.handleCommands = async () => {
    client.commands = new Map();
    client.commandArray = [];

    const commandFolders = fs.readdirSync("./commands");

    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        try {
          const command = require(path.join(
            __dirname,
            `../../commands/${folder}/${file}`
          ));
          client.commands.set(command.data.name, command);
          client.commandArray.push(command.data.toJSON());
          console.log(
            `Command: ${command.data.name} has been passed through the handler`
          );
        } catch (error) {
          console.error(`Error loading command ${file}:`, error);
        }
      }
    }

    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;
    const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN);

    try {
      console.log("Started refreshing application (/) commands.");
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: client.commandArray,
      });
      console.log("Successfully reloaded application (/) commands.");
      console.log(`Loaded ${client.commandArray.length} commands.`);
    } catch (error) {
      console.error(error);
    }
  };
};
