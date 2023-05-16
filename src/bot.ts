import 'dotenv/config'
import { Client, Events, GatewayIntentBits } from "discord.js";
import { onGuildScheduledEventCreate, onGuildScheduledEventDelete, onGuildScheduledEventUpdate, onGuildScheduledEventUserAdd, onGuildScheduledEventUserRemove } from './listeners/guildScheduledEvent';
import { onReady } from './listeners/ready';
import { onInteractionCreate } from './listeners/interaction';
import { onChannelDelete } from './listeners/channel';
import { onThreadDelete } from './listeners/thread';
import { onMemberJoin } from './listeners/member';
import { addRole, removeRole } from './listeners/role';
import { onMessageCreate, onMessageUpdate } from './listeners/message';

const client = new Client({
    allowedMentions: { parse: ['users', 'roles'] },
    intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildScheduledEvents | GatewayIntentBits.GuildMembers | GatewayIntentBits.GuildMessageReactions | GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent
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
client.on(Events.ChannelDelete, onChannelDelete);
client.on(Events.ThreadDelete, onThreadDelete);
client.on(Events.GuildMemberAdd, onMemberJoin)
client.on(Events.MessageReactionAdd, addRole)
client.on(Events.MessageReactionRemove, removeRole)
client.on(Events.MessageCreate, onMessageCreate)
client.on(Events.MessageUpdate, onMessageUpdate)

client.login(process.env.DISCORD_TOKEN);
