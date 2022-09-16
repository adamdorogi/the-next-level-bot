import { AnyThreadChannel } from "discord.js";
import { MongoClient } from "mongodb";
import { TodoDocument } from "../db";

export const onThreadDelete = async (thread: AnyThreadChannel) => {
    const mongodb = new MongoClient(process.env.MONGODB_ENDPOINT!);
    try {
        await mongodb.connect();
        await mongodb
            .db(process.env.DB!)
            .collection<TodoDocument>("todo")
            .deleteOne({ _id: thread.id });
    } finally {
        mongodb.close();
    }
}
