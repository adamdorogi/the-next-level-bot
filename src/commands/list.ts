import { EmbedBuilder, escapeMarkdown, GuildMember, SlashCommandBuilder } from "discord.js";
import { MongoClient } from "mongodb";
import { TodoDocument } from "../db";
import { Command } from "./command";

export const ListCommand: Command = {
    builder: new SlashCommandBuilder()
        .setName("list")
        .setDescription("list")
        .setDMPermission(false)
        .addSubcommandGroup(
            option => option
                .setName("add")
                .setDescription("add")
                .addSubcommand(
                    option => option
                        .setName("me")
                        .setDescription("Add yourself to the player list for this channel.")
                )
        )
        .addSubcommandGroup(
            option => option
                .setName("remove")
                .setDescription("remove")
                .addSubcommand(
                    option => option
                        .setName("me")
                        .setDescription("Remove yourself from the player list for this channel.")
                )
        )
        .addSubcommand(
            option => option
                .setName("view")
                .setDescription("View the player list for this channel.")
        ),
    ephemeral: false,
    execute: async (interaction) => {
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
                        result.modifiedCount == 0 && result.upsertedCount == 0
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
                    const playerList = Object.values(result?.entries || {}).map(e => `‣ ${escapeMarkdown(e)}`);
                    let footer = `${playerList.length} player${playerList.length == 1 ? '' : 's'}`;
                    if (result && result.needed > 0) {
                        footer += ` (minimum ${result.needed} required)`;
                    }
                    embed
                        .setDescription(`**Player list for <#${interaction.channelId}>**\n\n${playerList.join('\n')}`)
                        .setFooter({ text: footer });
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
