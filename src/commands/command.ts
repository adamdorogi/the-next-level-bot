import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import { EventCommand } from "./scheduledEvent";

export interface Command extends ChatInputApplicationCommandData {
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export const commands: Command[] = [
    EventCommand
];
