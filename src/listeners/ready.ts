import { Client, TextBasedChannel } from "discord.js";
import { commands } from "../commands/command";
import { onGuildScheduledEvent } from "./guildScheduledEvent";
import config from "../config";

export const onReady = async (client: Client) => {
    if (!client.user || !client.application) {
        return;
    }

    for (const [guildId, guildConfig] of Object.entries(config.guilds)) {
        console.log(`Caching for guild ${guildId}...`)

        try {
            const guild = await client.guilds.fetch(guildId);
            const events = await guild.scheduledEvents.fetch();
            events.forEach(onGuildScheduledEvent);
        } catch (error) {
            console.log(`ERROR: Unable to fetch guild ${guildId}...`);
            continue;
        }

        client.application.commands.set(commands.map(c => c.builder));
    
        // Cache reaction role messages
        for (const [channelId, messages] of Object.entries(guildConfig.rolesChannels)) {
            console.log(`Caching for channel ${channelId}...`)
            const channel = await client.channels.fetch(channelId) as TextBasedChannel
            for (const messageId of Object.keys(messages)) {
                console.log(`Caching message ${messageId}...`)
                await channel.messages.fetch(messageId)
            }
        }
    }

    console.log("Ready.")
}
