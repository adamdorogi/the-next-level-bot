import { SlashCommandBuilder } from "discord.js";
import { Command } from "./command";

export const AnnounceCommand: Command = {
    builder: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Make an announcement on this channel.")
        .setDMPermission(false),
    ephemeral: false,
    execute: async () => null
};
