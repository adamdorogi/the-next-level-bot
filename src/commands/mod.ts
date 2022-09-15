import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, EmbedBuilder, escapeMarkdown, GuildMember, userMention, WebhookEditMessageOptions } from "discord.js";
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
                    name: "clear",
                    description: "Clear this channel's player list."
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "min-players",
                    description: "Set the minimum number of players required to boost.",
                    options: [
                        {
                            type: ApplicationCommandOptionType.Number,
                            name: "number",
                            description: "The minimum number of players",
                            required: true
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

            const response: WebhookEditMessageOptions = {};

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

                                response.embeds = [
                                    new EmbedBuilder()
                                        .setColor(0xfff000)
                                        .setDescription(description)
                                ];
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
                                const description = (result.modifiedCount == 0)
                                    ? `**${escapeMarkdown(name)}** is not on the player list.`
                                    : `**${escapeMarkdown(name)}** was removed from the player list.`;

                                response.embeds = [
                                    new EmbedBuilder()
                                        .setColor(0xfff000)
                                        .setDescription(description)
                                ];
                            }
                            break;
                        case "clear":
                            {
                                await collection.deleteOne({ _id: interaction.channelId });
                                response.embeds = [
                                    new EmbedBuilder()
                                        .setColor(0xfff000)
                                        .setDescription('The player list has been cleared.')
                                ];
                            }
                            break;
                        case "min-players":
                            {
                                const number = interaction.options.getNumber("number", true);
                                await collection.updateOne(
                                    { _id: interaction.channelId },
                                    { $set: { needed: number } },
                                    { upsert: true }
                                );
                                response.embeds = [
                                    new EmbedBuilder()
                                        .setColor(0xfff000)
                                        .setDescription(`Minimum players set to **${number}**.`)
                                ];
                            }
                            break;
                        default:
                            throw 'unknown subcommand';
                    }
                    break;
                default:
                    throw 'unknown subcommand group';
            }

            return response;
        } finally {
            mongodb.close();
        }
    }
};
