const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .name("play")
    .setDescription("Reproduzirá a música.")
    .addSubcommand((subcommand) => {
      subcommand
        .setName("search")
        .setDescription("Pesquise por uma música")
        .addStringOption((option) => {
          option
            .setName("searchterms")
            .setDescription("search keywords")
            .setRequire(true);
        });
    })
    .addSubcommand((subcommand) => {
      subcommand
        .setname("playlist")
        .setDescription("reproduzirá playlist do YouTube")
        .addStringOption((option) => {
          option.setname("url").setDescription("playlist url").setRequire(true);
        });
    })
    .addSubcommand((subcommand) => {
      subcommand
        .setName("song")
        .setDescription("reproduzirá música do YouTube")
        .addStringOption((option) => {
          option
            .setName("url")
            .setDescription("URL de uma música")
            .setRequire(true);
        });
    }),
  //YOUTUBE SONG
  execute: async ({ client, interaction }) => {
    if (!interaction.member.voice.channel) {
      await interaction.reply(
        "Você precisa está em um canal de voz para usar esse comando."
      );
      return;
    }

    const queue = await client.player.createQueue(interaction.guild);

    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);

    let embed = new MessageEmbed();
    if (interaction.options.getSubcommand() === "song") {
      let url = interaction.options.getString("url");

      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_VIDEO,
      });

      if (result.tracks.length === 0) {
        await interaction.reply("nenhum resultado encontrado.");
        return;
      }

      const song = result.tracks[0];
      await queue.addTrack(song);

      embed
        .setDescription(`Adicionado **[${song.title}] (${song.url})** na fila.`)
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duração: ${song.duration}` });
    }
    //YOUTUBE PLAYLIST
    else if (interaction.options.getSubcommand() === "playlist") {
      let url = interaction.options.getString("url");

      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_PLAYLIST,
      });

      if (result.tracks.length === 0) {
        await interaction.reply("nenhuma playlist encontrada.");
        return;
      }

      const playlist = result.playlist;
      await queue.addTracks(playlist);

      embed
        .setDescription(
          `Adicionado **[${playlist.title}] (${playlist.url})** na fila.`
        )
        .setThumbnail(playlist.thumbnail)
        .setFooter({ text: `Duração: ${playlist.duration}` });
    } else if (interaction.options.getSubcommand() === "searchterms") {
      let url = interaction.options.getString("url");

      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (result.tracks.length === 0) {
        await interaction.reply("nenhum resultado encontrado.");
        return;
      }

      const song = result.song;
      await queue.addTracks(song);

      embed
        .setDescription(`Adicionado **[${song.title}] (${song.url})** na fila.`)
        .setThumbnail(playlist.thumbnail)
        .setFooter({ text: `Duração: ${song.duration}` });
    }

    //PARAR AS MÚSICAS
    if (!queue.playing) await queue.play();

    await interaction.reply({
      embeds: [embed],
    });
  },
};
