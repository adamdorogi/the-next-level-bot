import { Client } from "discord.js";
import { commands } from "../commands/command";
import { onGuildScheduledEvent } from "./guildScheduledEvent";

export const onReady = async (client: Client) => {
    if (!client.user || !client.application) {
        return;
    }

    const guild = await client.guilds.fetch(process.env.GUILD_ID!);
    const events = await guild.scheduledEvents.fetch();

    events.forEach(onGuildScheduledEvent);

    guild.commands.set(commands);
}
