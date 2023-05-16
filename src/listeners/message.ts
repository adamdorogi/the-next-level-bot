import { Message, PartialMessage } from "discord.js"


export const onMessageCreate = async (message: Message<boolean>) => {
    if (message.content.includes("discord.gg/") && message.author.id !== message.client.user.id) {
        await message.delete();
    }
}

export const onMessageUpdate = async (_: Message<boolean> | PartialMessage, newMessage: Message<boolean> | PartialMessage) => {
    if (newMessage.content?.includes("discord.gg/") && newMessage.author?.id !== newMessage.client.user.id) {
        await newMessage.delete();
    }
}
