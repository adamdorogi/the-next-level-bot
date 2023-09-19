import { channelMention, EmbedBuilder, NonThreadGuildBasedChannel, SlashCommandBuilder, userMention } from "discord.js";
import { MongoClient } from "mongodb";
import { TodoDocument } from "../db";
import { Command } from "./command";

export const MyCommand: Command = {
    builder: new SlashCommandBuilder()
        .setName("my")
        .setDescription("my")
        .setDMPermission(false)
        .addSubcommand(
            option => option
                .setName("lists")
                .setDescription("List the player lists you have joined.")
        ),
    ephemeral: false,
    execute: async (interaction) => {
        const mongodb = new MongoClient(process.env.MONGODB_ENDPOINT!);
        try {
            await mongodb.connect();
            const collection = mongodb.db(process.env.DB!).collection<TodoDocument>(interaction.guildId!);

            const subcommand = interaction.options.getSubcommand();
            switch (subcommand) {
                case "lists":
                    const field = `entries.${interaction.user.id}`;
                    const results = await collection.find({ [field]: { $exists: true } }).toArray();

                    const promises = results.map(doc => interaction.guild!.channels.fetch(doc._id));

                    const channels = await Promise.all(promises);
                    const mentions = channels
                        .filter((c): c is NonThreadGuildBasedChannel => !!c)
                        .sort((a, b) => a.name.localeCompare(b.name, "en", { ignorePunctuation: true }))
                        .map(c => `‣ ${channelMention(c.id)}`);

                    const message = mentions.length === 0
                        ? `${userMention(interaction.user.id)} is not on any player lists.`
                        : `**Player lists for ${userMention(interaction.user.id)}**\n\n${mentions.join('\n')}`;

                    return {
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xfff000)
                                .setDescription(message)
                        ]
                    }
                default:
                    throw 'unknown subcommand';
            }
        } finally {
            mongodb.close();
        }
    }
}
