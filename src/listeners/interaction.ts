import { ActionRowBuilder, Colors, EmbedBuilder, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { commands } from "../commands/command";

export const onInteractionCreate = async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = commands.find(command => command.builder.name === interaction.commandName);
    if (!command) {
        return;
    }

    try {
        await interaction.deferReply({ ephemeral: command.ephemeral });
        const reply = await command.execute(interaction);
        reply == null
            ? await interaction.deleteReply()
            : await interaction.editReply(reply);
    } catch (error) {
        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`:exclamation: ${error}`);
        await interaction.editReply({ embeds: [embed] });
    }
}
