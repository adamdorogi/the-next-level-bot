import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, EmbedBuilder, escapeMarkdown, GuildMember } from "discord.js";
import { MongoClient } from "mongodb";
import { TodoDocument } from "../db"
import { Command } from "./command";

export const ListCommand: Command = {
    name: "list",
    description: "list",
    ephemeral: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "add",
            description: "add",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "me",
                    description: "Add yourself to the player list for this channel.",
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "remove",
            description: "remove",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "me",
                    description: "Remove yourself from the player list for this channel.",
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "view",
            description: "View the player list for this channel.",
        },
    ],
    execute: async (interaction: ChatInputCommandInteraction) => {
        const mongodb = new MongoClient(process.env.MONGODB_ENDPOINT!);
        try {
            await mongodb.connect();
            const collection = mongodb.db(process.env.DB!).collection<TodoDocument>("todo");

            const embed = new EmbedBuilder().setColor(0xfff000);

            const subcommand = interaction.options.getSubcommandGroup(false) || interaction.options.getSubcommand(false);
            switch (subcommand) {
                case "add":
                    {
                        let member: GuildMember;
                        try {
                            member = await interaction.guild!.members.fetch(interaction.user);
                        } catch {
                            throw `**${escapeMarkdown(interaction.user.username)}#${interaction.user.discriminator}** is not in the server.`;
                        }
                        const name = member.nickname || interaction.user.username;
                        const result = await collection.updateOne(
                            { _id: interaction.channelId },
                            { $set: { [`entries.${interaction.user.id}`]: name } },
                            { upsert: true }
                        );
                        result.modifiedCount == 0
                            ? embed.setDescription(`**${escapeMarkdown(name)}** is already on the player list.`)
                            : embed.setDescription(`**${escapeMarkdown(name)}** was added to the player list.`);
                    }
                    break;
                case "remove":
                    {
                        let member: GuildMember | null = null;
                        try {
                            member = await interaction.guild!.members.fetch(interaction.user);
                        } catch { }
                        const name = member?.nickname || interaction.user.username;
                        const result = await collection.updateOne(
                            { _id: interaction.channelId },
                            { $unset: { [`entries.${interaction.user.id}`]: "" } },
                            { upsert: true }
                        );
                        result.modifiedCount == 0
                            ? embed.setDescription(`**${escapeMarkdown(name)}** is not on the player list.`)
                            : embed.setDescription(`**${escapeMarkdown(name)}** was removed from the player list.`);
                    }
                    break;
                case "view":
                    const result = await collection.findOne({ _id: interaction.channelId });
                    const playerList = Object.values(result?.entries || {}).map(e => escapeMarkdown(e));
                    embed
                        .setDescription(`**Player list for <#${interaction.channelId}>**\n\n${playerList.join('\n')}`)
                        .setFooter({ text: `${playerList.length} player${playerList.length == 1 ? '' : 's'}` });
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
