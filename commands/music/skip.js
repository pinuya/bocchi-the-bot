const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Pulará a música atual."),
  execute: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guild);

    if (!queue) {
      await interaction.reply("Não tem música sendo reproduzida");
      return;
    }
    const currentSong = queue.current;

    queue.skip();

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setDescription(`Skipped **${currentSong.title}**`)
          .setThumbnail(currentSong.thumbnail),
      ],
    });
  },
};
