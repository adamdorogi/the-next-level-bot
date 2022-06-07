import { Guild } from "discord.js";
import { onGuildScheduledEvent } from "./guildScheduledEvent";

export const onGuildCreate = async (guild: Guild) => {
    const events = await guild.scheduledEvents.fetch();
    events.forEach(onGuildScheduledEvent);
}
