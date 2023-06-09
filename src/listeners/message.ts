import { Message, PartialMessage } from "discord.js"


export const onMessageCreate = async (message: Message<boolean>) => {
    console.log("Message created in server.");
    if (message.content.includes("discord.gg/") && !message.member?.permissions.has("Administrator")) {
        console.log("Message contains invite link, deleting...");
        await message.delete();
    }
}

export const onMessageUpdate = async (_: Message<boolean> | PartialMessage, newMessage: Message<boolean> | PartialMessage) => {
    console.log("Message updated in server.");
    if (newMessage.content?.includes("discord.gg/") && !newMessage.member?.permissions.has("Administrator")) {
        console.log("New message contains invite link, deleting...");
        await newMessage.delete();
    }
}
