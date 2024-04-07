import { IntentsBitField, REST, Routes, Client, Collection } from "discord.js";
import dotenv from "dotenv";
import { Player } from "discord-player";
import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

// Load all commands
const commands = [
  {
    name: "ping",
    description: "Responde com Pong!",
  },
  {
    name: "play",
    description: "Coloque o link da música que deseja ouvir.",
  },
  {
    name: "skip",
    description: "Pulará a música atual e reproduzirei a proxima na queue.",
  },
];

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  client.commands.set(command.data.name, command);
  commands.push(command);
}

client.player = new Player(client, {
  ytdlOptions: {
    qualiy: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

client.on("ready", () => {
  const guild_ids = client.guilds.cache.map((guild) => guild.id);

  const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
  for (const guildId of guild_ids) {
    rest
      .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), {
        body: commands,
      })
      .then(() => console.log(`Added commands to ${guildId}`))
      .catch(console.error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!command) return;

  try {
    await command.execute({ client, interaction });
  } catch (err) {
    console.error(err);
    await interaction.reply("An error occurred while executing that command.");
  }
});
