import { DMChannel, NonThreadGuildBasedChannel } from "discord.js";
import { MongoClient } from "mongodb";
import { TodoDocument } from "../db";

export const onChannelDelete = async (channel: DMChannel | NonThreadGuildBasedChannel) => {
    const mongodb = new MongoClient(process.env.MONGODB_ENDPOINT!);
    try {
        await mongodb.connect();
        await mongodb
            .db(process.env.DB!)
            .collection<TodoDocument>((channel as NonThreadGuildBasedChannel).guildId)
            .deleteOne({ _id: channel.id });
    } finally {
        mongodb.close();
    }
}
