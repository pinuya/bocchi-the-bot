const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("exit")
    .setDescription("Sairei do canal de voz."),
  execute: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guild);

    if (!queue) {
      await interaction.reply("Não tem música sendo reproduzida");
      return;
    }

    queue.destroy();

    await interaction.reply("Saindo do canal, até a proxima!.");
  },
};
