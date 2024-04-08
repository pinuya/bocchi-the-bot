const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pausará a música atual."),
  execute: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guild);

    if (!queue) {
      await interaction.reply("Não tem música sendo reproduzida");
      return;
    }

    queue.setPauseed(true);

    await interaction.reply("A música atual foi pausada.");
  },
};
