import { Message, PartialMessage } from "discord.js"


export const onMessageCreate = async (message: Message<boolean>) => {
    console.log(`New message created: ${message.content}`);
    if (message.content.includes("discord.gg/") && !message.author.bot) {
        console.log("Message contains invite link, deleting...");
        await message.delete();
    }
}

export const onMessageUpdate = async (_: Message<boolean> | PartialMessage, newMessage: Message<boolean> | PartialMessage) => {
    console.log("New message updated.");
    if (newMessage.content?.includes("discord.gg/") && !newMessage.author?.bot) {
        console.log("Message contains invite link, deleting...");
        await newMessage.delete();
    }
}
