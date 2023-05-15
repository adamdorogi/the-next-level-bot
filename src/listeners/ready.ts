import { Client, TextBasedChannel } from "discord.js";
import { commands } from "../commands/command";
import { onGuildScheduledEvent } from "./guildScheduledEvent";
import roleConfig from "../roleConfig";

export const onReady = async (client: Client) => {
    if (!client.user || !client.application) {
        return;
    }

    const guild = await client.guilds.fetch(process.env.GUILD_ID!);
    const events = await guild.scheduledEvents.fetch();

    events.forEach(onGuildScheduledEvent);

    client.application.commands.set(commands.map(c => c.builder));

    // Cache reaction role messages
    for (const [channelId, messageIds] of Object.entries(roleConfig)) {
        const channel = await client.channels.fetch(channelId) as TextBasedChannel
        for (const messageId of Object.keys(messageIds)) {
            console.log(`Caching message ${messageId} for channel ${channelId}...`)
            await channel.messages.fetch(messageId)
        }
    }
    console.log("Ready.")
}
