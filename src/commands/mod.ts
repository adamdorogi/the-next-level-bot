import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, EmbedBuilder, escapeMarkdown, GuildMember, userMention } from "discord.js";
import { MongoClient } from "mongodb";
import { TodoDocument } from "../db"
import { Command } from "./command";

export const ModCommand: Command = {
    name: "mod",
    description: "mod",
    dmPermission: false,
    ephemeral: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "list",
            description: "list",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "add",
                    description: "Add a user to this channel's player list.",
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
                    description: "Remove a user from this channel's player list.",
                    options: [
                        {
                            type: ApplicationCommandOptionType.User,
                            name: "user",
                            description: "The user to remove",
                            required: true
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "ping",
                    description: "Ping all users on this channel's player list with a message.",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "message",
                            description: "The message to include when pinging users",
                            required: true
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "clear",
                    description: "Clear this channel's player list."
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "min-players",
                    description: "Set the minimum number of players required to boost.",
                    options: [
                        {
                            type: ApplicationCommandOptionType.Integer,
                            name: "number",
                            description: "The minimum number of players",
                            required: true,
                            minValue: 0,
                            maxValue: 64
                        }
                    ]
                },
            ]
        },
    ],
    execute: async (interaction: ChatInputCommandInteraction) => {
        const mongodb = new MongoClient(process.env.MONGODB_ENDPOINT!);
        try {
            await mongodb.connect();
            const collection = mongodb.db(process.env.DB!).collection<TodoDocument>("todo");

            const subcommandGroup = interaction.options.getSubcommandGroup(true);
            switch (subcommandGroup) {
                case "list":
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
                                const description = (result.modifiedCount == 0 && result.upsertedCount == 0)
                                    ? `**${escapeMarkdown(name)}** is already on the player list.`
                                    : `**${escapeMarkdown(name)}** was added to the player list.`;

                                return {
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(0xfff000)
                                            .setDescription(description)
                                    ]
                                };
                            }
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
                                const description = (result.modifiedCount == 0)
                                    ? `**${escapeMarkdown(name)}** is not on the player list.`
                                    : `**${escapeMarkdown(name)}** was removed from the player list.`;

                                return {
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(0xfff000)
                                            .setDescription(description)
                                    ]
                                };
                            }
                        case "ping":
                            {
                                const result = await collection.findOne({ _id: interaction.channelId });
                                const mentions = Object.keys(result?.entries || {}).map(userMention);
                                if (mentions.length == 0) {
                                    return {
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor(0xfff000)
                                                .setDescription('The player list is empty.')
                                        ]
                                    };
                                }

                                const channel = await interaction.guild!.channels.fetch(interaction.channelId);
                                if (!channel || !channel.isTextBased()) {
                                    throw "can not run command in this channel"
                                }

                                const message = interaction.options.getString("message", true);
                                await channel.send(`${mentions.join(' ')}\n\n${message}`);

                                return null;
                            }
                        case "clear":
                            {
                                await collection.updateOne(
                                    { _id: interaction.channelId },
                                    { $unset: { entries: "" } }
                                );
                                return {
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(0xfff000)
                                            .setDescription('The player list has been cleared.')
                                    ]
                                };
                            }
                        case "min-players":
                            {
                                const number = interaction.options.getInteger("number", true);
                                await collection.updateOne(
                                    { _id: interaction.channelId },
                                    { $set: { needed: number } },
                                    { upsert: true }
                                );
                                return {
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(0xfff000)
                                            .setDescription(`Minimum players set to **${number}**.`)
                                    ]
                                };
                            }
                        default:
                            throw 'unknown subcommand';
                    }
                    break;
                default:
                    throw 'unknown subcommand group';
            }
        } finally {
            mongodb.close();
        }
    }
};
