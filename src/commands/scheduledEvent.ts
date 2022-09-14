import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { removePing } from "../listeners/guildScheduledEvent";
import { Command } from "./command";

export const EventCommand: Command = {
    name: "event",
    description: "Manage events",
    dmPermission: false,
    ephemeral: true,
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
        const id = interaction.options.getString("event", true);
        var content = removePing(id) ? "Done!" : "No ping scheduled for given event ID.";
        return { content };
    }
};
