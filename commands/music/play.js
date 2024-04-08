const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduzirá uma música do YouTube.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("search")
        .setDescription("Procura uma música e a reproduz.")
        .addStringOption((option) =>
          option
            .setName("searchterms")
            .setDescription("Procure palavras-chave")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("playlist")
        .setDescription("Reproduz uma playlist do YouTube")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("a URL da playlist")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("song")
        .setDescription("Reproduz uma única música do YouTube")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("URL da música")
            .setRequired(true)
        )
    ),
  execute: async ({ client, interaction }) => {
    // Certifique-se de que o usuário esteja dentro de um canal de voz
    if (!interaction.member.voice.channel)
      return interaction.reply("Você precisa está em um canal de voz.");

    // Crie uma fila de reprodução para o servidor
    const queue = await client.player.createQueue(interaction.guild);

    // Espere até estar conectado ao canal
    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);

    let embed = new MessageEmbed();

    if (interaction.options.getSubcommand() === "song") {
      let url = interaction.options.getString("url");

      // Procure a música usando o discord-player
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_VIDEO,
      });

      // terminar se nenhuma faixa for encontrada
      if (result.tracks.length === 0)
        return interaction.reply("Sem resultados.");

      // Adicione a faixa à fila
      const song = result.tracks[0];
      await queue.addTrack(song);
      embed
        .setDescription(
          `**[${song.title}](${song.url})** foi adicionado na fila`
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duração: ${song.duration}` });
    } else if (interaction.options.getSubcommand() === "playlist") {
      // Procure a playlist usando o discord-player
      let url = interaction.options.getString("url");
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_PLAYLIST,
      });

      if (result.tracks.length === 0)
        return interaction.reply(`Nenhuma playlist encontrada com ${url}`);

      // Adicione as faixas à fila
      const playlist = result.playlist;
      await queue.addTracks(result.tracks);
      embed
        .setDescription(
          `**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** foi adicionado na fila`
        )
        .setThumbnail(playlist.thumbnail);
    } else if (interaction.options.getSubcommand() === "search") {
      // Procure a música usando o discord-player
      let url = interaction.options.getString("searchterms");
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      // terminar se nenhuma faixa for encontrada
      if (result.tracks.length === 0)
        return interaction.editReply("No results");

      // Adicione a faixa à fila
      const song = result.tracks[0];
      await queue.addTrack(song);
      embed
        .setDescription(
          `**[${song.title}](${song.url})** foi adicionado na fila`
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duração: ${song.duration}` });
    }

    // Toque a música
    if (!queue.playing) await queue.play();

    // Responda com a incorporação contendo informações sobre o jogador
    await interaction.reply({
      embeds: [embed],
    });
  },
};
