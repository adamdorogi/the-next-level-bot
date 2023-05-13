import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder, WebhookEditMessageOptions } from "discord.js";
import { ListCommand } from "./list";
import { ModCommand } from "./mod";
import { MyCommand } from "./my";
import { EventCommand } from "./scheduledEvent";
import { AnnounceCommand } from "./announce";

export type Command = {
    builder: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
    ephemeral: boolean;
    execute: (interaction: ChatInputCommandInteraction) => Promise<WebhookEditMessageOptions | null>;
}

export const commands: Command[] = [
    EventCommand,
    ListCommand,
    ModCommand,
    MyCommand,
    AnnounceCommand
];
