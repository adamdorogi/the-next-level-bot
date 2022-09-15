import { ChatInputApplicationCommandData, ChatInputCommandInteraction, WebhookEditMessageOptions } from "discord.js";
import { ListCommand } from "./list";
import { ModCommand } from "./mod";
import { EventCommand } from "./scheduledEvent";

export interface Command extends ChatInputApplicationCommandData {
    ephemeral: boolean;
    execute: (interaction: ChatInputCommandInteraction) => Promise<WebhookEditMessageOptions | null>;
}

export const commands: Command[] = [
    EventCommand,
    ListCommand,
    ModCommand
];
