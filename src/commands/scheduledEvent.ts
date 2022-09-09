import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { removePing } from "../listeners/guildScheduledEvent";
import { Command } from "./command";

export const EventCommand: Command = {
    name: "event",
    description: "Manage events",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "disable-ping",
            description: "Disables the event role ping for the given event",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "event",
                    description: "The event",
                    required: true
                }
            ]
        },
    ],
    execute: async (interaction: ChatInputCommandInteraction) => {
        const id = interaction.options.getString("event");
        if (!id) {
            interaction.reply({ content: 'The event ID is required.', ephemeral: true });
            return;
        }

        var content = removePing(id) ? "Done!" : "No ping scheduled for given event ID.";
        interaction.reply({ content, ephemeral: true });
    }
};
