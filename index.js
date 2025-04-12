require("dotenv").config();

const { BOT_TOKEN } = process.env;
const { GUILD_ID } = process.env;
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.color = 0x18e1ee;
client.commandArray = [];

// Load all functions
const functionFolders = fs.readdirSync("./functions");
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles) {
    require(`./functions/${folder}/${file}`)(client);
  }
}

// Handle events and commands
client.handleEvents();
client.handleCommands();

// Assign "doAllOfTheAbove" to the "Headmaster" role on startup
client.once("ready", async () => {
  const guildId = GUILD_ID; 
  await client.assignHeadmasterPermission(guildId);
});

// Login the bot
client.login(BOT_TOKEN);
