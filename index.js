const {
  IntentsBitField,
  REST,
  Routes,
  Client,
  Collection,
} = require("discord.js");
const dotenv = require("dotenv");
const { Player } = require("discord-player");
const fs = require("node:fs");
const path = require("node:path");

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
const command = [
  {
    name: "play",
    description: "Coloque o link da música que deseja ouvir.",
  },
  {
    name: "pause",
    description: "Pausará a música atual.",
  },
  {
    name: "resume",
    description: "Retonará a música atual.",
  },
  {
    name: "skip",
    description: "Pulará a música atual e irá para a proxima na fila.",
  },
  {
    name: "queue",
    description: "Mostrará a lista de reprodução.",
  },
  {
    name: "exit",
    description: "Sairei do canal atual.",
  },
];

client.command = new Collection();

const commandsPath = path.join(__dirname, "commands/music");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const commands = require(filePath);

  console.log(command);

  client.command.set(commands.data.name, command);
  command.push(commands.data.toJSON());
}

//Player
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
        body: command,
      })
      .then(() => console.log(`Added commands to ${guildId}`))
      .catch(console.error);
  }
});

//comando errado
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.command.get(interaction.commandName);
  if (!command) return;

  try {
    console.log(command);
    await command.execute({ client, interaction });
  } catch (err) {
    console.error(err);
    await interaction.reply("An error occurred while executing that command.");
  }
});

client.login(process.env.TOKEN);
