import { SlashCommandBuilder } from "discord.js";
import { removePing } from "../listeners/guildScheduledEvent";
import { Command } from "./command";

export const EventCommand: Command = {
    builder: new SlashCommandBuilder()
        .setName("event")
        .setDescription("event")
        .setDMPermission(false)
        .addSubcommand(
            option => option
                .setName("disable-ping")
                .setDescription("Disable pinging the event role for the given event.")
                .addStringOption(
                    option => option
                        .setName("event")
                        .setDescription("The event")
                        .setRequired(true)
                )
        ),
    ephemeral: true,
    execute: async (interaction) => {
        const id = interaction.options.getString("event", true);
        var content = removePing(id) ? "Done!" : "No ping scheduled for given event ID.";
        return { content };
    }
};
