import 'dotenv/config'
import { Client, Constants } from "discord.js";
// import fs from "fs";
import { onGuildScheduledEvent, onGuildScheduledEventUpdate, onGuildScheduledEventUserAdd, onGuildScheduledEventUserRemove } from './listeners/guildScheduledEvent';
// import { interactionCreate } from './listeners/interaction';
import { onReady } from './listeners/ready';
import { onGuildCreate } from './listeners/guild';

// fs.readFile('scheduled-event-data.json', 'utf8', (err, data) => {
//     if (err) {
//         console.log(err);
//     }
//     const database = JSON.parse(data);
// });

const client = new Client({
    intents: ['GUILD_SCHEDULED_EVENTS']
});

client.on(Constants.Events.DEBUG, async (info: string) => console.log(info));
client.on(Constants.Events.ERROR, async (error: Error) => console.error(error));

client.on(Constants.Events.CLIENT_READY, onReady);
client.on(Constants.Events.GUILD_CREATE, onGuildCreate);
// client.on(Constants.Events.INTERACTION_CREATE, interactionCreate)
client.on(Constants.Events.GUILD_SCHEDULED_EVENT_CREATE, onGuildScheduledEvent);
client.on(Constants.Events.GUILD_SCHEDULED_EVENT_DELETE, onGuildScheduledEvent);
client.on(Constants.Events.GUILD_SCHEDULED_EVENT_UPDATE, onGuildScheduledEventUpdate);
client.on(Constants.Events.GUILD_SCHEDULED_EVENT_USER_ADD, onGuildScheduledEventUserAdd);
client.on(Constants.Events.GUILD_SCHEDULED_EVENT_USER_REMOVE, onGuildScheduledEventUserRemove);

client.login(process.env.DISCORD_TOKEN);
