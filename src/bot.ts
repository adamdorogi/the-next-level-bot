import 'dotenv/config'
import { Client, Events, GatewayIntentBits } from "discord.js";
import { onGuildScheduledEventCreate, onGuildScheduledEventDelete, onGuildScheduledEventUpdate, onGuildScheduledEventUserAdd, onGuildScheduledEventUserRemove } from './listeners/guildScheduledEvent';
import { onReady } from './listeners/ready';
import { onInteractionCreate } from './listeners/interaction';

const client = new Client({
    intents: GatewayIntentBits.GuildScheduledEvents
});

client.on(Events.Debug, async (info: string) => console.log(info));
client.on(Events.Error, async (error: Error) => console.error(error));

client.on(Events.ClientReady, onReady);
client.on(Events.GuildScheduledEventCreate, onGuildScheduledEventCreate);
client.on(Events.GuildScheduledEventDelete, onGuildScheduledEventDelete);
client.on(Events.GuildScheduledEventUpdate, onGuildScheduledEventUpdate);
client.on(Events.GuildScheduledEventUserAdd, onGuildScheduledEventUserAdd);
client.on(Events.GuildScheduledEventUserRemove, onGuildScheduledEventUserRemove);
client.on(Events.InteractionCreate, onInteractionCreate);

client.login(process.env.DISCORD_TOKEN);
