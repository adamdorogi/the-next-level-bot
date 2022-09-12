import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, EmbedBuilder, escapeMarkdown, GuildMember } from "discord.js";
import { MongoClient } from "mongodb";
import { TodoDocument } from "../db"
import { Command } from "./command";

export const ModCommand: Command = {
    name: "mod",
    description: "mod",
    ephemeral: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add",
            description: "Add a user to the player list for this channel.",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "The user to add",
                    required: true
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove",
            description: "Remove a user from the player list for this channel.",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "The user to remove",
                    required: true
                }
            ]
        },
        // {
        //     type: ApplicationCommandOptionType.Subcommand,
        //     name: "purge",
        //     description: "Remove all non-server users from the player list for this channel.",
        // },
    ],
    execute: async (interaction: ChatInputCommandInteraction) => {
        const mongodb = new MongoClient(process.env.MONGODB_ENDPOINT!);
        try {
            await mongodb.connect();
            const collection = mongodb.db(process.env.DB!).collection<TodoDocument>("todo");

            const embed = new EmbedBuilder().setColor(0xfff000);

            const subcommand = interaction.options.getSubcommand(true);
            switch (subcommand) {
                case "add":
                    {
                        const user = interaction.options.getUser("user", true);
                        let member: GuildMember;
                        try {
                            member = await interaction.guild!.members.fetch(user);
                        } catch {
                            throw `**${escapeMarkdown(user.username)}#${user.discriminator}** is not in the server.`;
                        }
                        const name = member.nickname || user.username;
                        const result = await collection.updateOne(
                            { _id: interaction.channelId },
                            { $set: { [`entries.${user.id}`]: name } },
                            { upsert: true }
                        );
                        result.modifiedCount == 0
                            ? embed.setDescription(`**${escapeMarkdown(name)}** is already on the player list.`)
                            : embed.setDescription(`**${escapeMarkdown(name)}** was added to the player list.`);
                    }
                    break;
                case "remove":
                    {
                        const user = interaction.options.getUser("user", true);
                        let member: GuildMember | null = null;
                        try {
                            member = await interaction.guild!.members.fetch(user);
                        } catch { }
                        const name = member?.nickname || user.username;
                        const result = await collection.updateOne(
                            { _id: interaction.channelId },
                            { $unset: { [`entries.${user.id}`]: "" } },
                            { upsert: true }
                        );
                        result.modifiedCount == 0
                            ? embed.setDescription(`**${escapeMarkdown(name)}** is not on the player list.`)
                            : embed.setDescription(`**${escapeMarkdown(name)}** was removed from the player list.`);
                    }
                    break;
                case "purge":
                    const result = await collection.findOne({ _id: interaction.channelId });
                    const entries = Object.values(result?.entries || {})
                    const playerList = entries.length > 0 ? entries.join('\n') : null;
                    embed
                        .setTitle(`Player List for ${interaction.channel}`)
                        .setDescription(playerList);
                    break;
                default:
                    throw 'unknown subcommand';
            }

            return { embeds: [embed] };
        } finally {
            mongodb.close();
        }
    }
};
