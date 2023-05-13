import { SlashCommandBuilder } from "discord.js";
import { Command } from "./command";

export const AnnounceCommand: Command = {
    builder: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Make an announcement on this channel.")
        .addStringOption(
            option => option
            .setName("message")
            .setDescription("The message to announce.")
            .setRequired(true)
        )
        .setDMPermission(false),
    ephemeral: false,
    execute: async (interaction) => {
        const message = interaction.options.getString("message", true);
        const channel = interaction.channel

        if (channel !== null) {
            await channel.send(message);
        }

        return null;
    }
};
