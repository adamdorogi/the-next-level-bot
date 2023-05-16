import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js"
import roleConfig from "../roleConfig"

export const addRole = async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    const messageId = roleConfig[reaction.message.channelId]?.[reaction.message.id]
    if (!messageId) {
        // Not a reaction to one of our messages specified in the config, so ignore it.
        return;
    }

    const roleId = messageId[(reaction.emoji.id || reaction.emoji.name)!];
    if (!roleId) {
        // A reaction to one of our messages specified in the config, but with an invalid emoji, so remove it.
        console.log(`Invalid emoji specified. Emoji ID: ${reaction.emoji.id}, Emoji name: ${reaction.emoji.name}`)
        await reaction.remove();
        return;
    }

    try {
        const guild = reaction.message.guild!;
        const reactingMember = await guild.members.fetch(user.id);
        await reactingMember.roles.add(roleId);
        console.log(`Successfully assigned role ${roleId} to user ${user.id}.`);
    } catch (error) {
        console.log("Unable to assign role to user.", error);
        await reaction.remove();
        return;
    }
}

export const removeRole = async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    const roleId = roleConfig[reaction.message.channelId]?.[reaction.message.id]?.[(reaction.emoji.id || reaction.emoji.name)!];
    if (!roleId) {
        // Not a reaction remove from one of our messages specified in the config, so ignore it.
        // Or IS a reaction remove from one of our messages specified in the config, but with an invalid emoji, so ignore. Shouldn't really happen.
        return;
    }

    try {
        const guild = reaction.message.guild!;
        const reactingMember = await guild.members.fetch(user.id);
        await reactingMember.roles.remove(roleId);
        console.log(`Successfully removed role ${roleId} from user ${user.id}.`);
    } catch (error) {
        console.log("Unable to remove role from user.", error);
        return;
    }
}
