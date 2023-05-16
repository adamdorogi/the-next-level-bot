import { Message, PartialMessage } from "discord.js"


export const onMessageCreate = async (message: Message<boolean>) => {
    console.log("New message created.");
    if (message.content.includes("discord.gg/") && message.author.id !== message.client.user.id) {
        console.log("Message contains invite link, deleting...");
        await message.delete();
    }
}

export const onMessageUpdate = async (_: Message<boolean> | PartialMessage, newMessage: Message<boolean> | PartialMessage) => {
    console.log("New message updated.");
    if (newMessage.content?.includes("discord.gg/") && newMessage.author?.id !== newMessage.client.user.id) {
        console.log("Message contains invite link, deleting...");
        await newMessage.delete();
    }
}
