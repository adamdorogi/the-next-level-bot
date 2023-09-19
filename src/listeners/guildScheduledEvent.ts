import { Colors, GuildScheduledEvent, User } from "discord.js";
import config from "../config";

const minute = 1000 * 60;

type GuildScheduledEventReminder = {
    event: GuildScheduledEvent
    timeouts: NodeJS.Timeout[]
}

const reminders: Record<string, GuildScheduledEventReminder | undefined> = {};

const pings: Record<string, NodeJS.Timeout | undefined> = {};

const getEventChannel = async (scheduledEvent: GuildScheduledEvent) => {
    if (!scheduledEvent.entityMetadata) {
        return;
    }
    const channelName = scheduledEvent.entityMetadata.location?.replace(/#/, '').trim().toLowerCase();
    const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);
    const activeThreads = await guild.channels.fetchActiveThreads();
    var thread = activeThreads.threads.find(t => t.name.toLowerCase() === channelName);
    if (thread) {
        return thread;
    }
    const channels = await guild.channels.fetch();
    return channels.find(c => !!c && c.name === channelName);
}

const remindInDM = async (scheduledEvent: GuildScheduledEvent) => {
    const subscribers = await scheduledEvent.fetchSubscribers({ withMember: true });
    const mentions = subscribers.map(subscriber => `${subscriber.member?.displayName || subscriber.user.username}`).join('\n');

    const channel = await getEventChannel(scheduledEvent);
    if (!channel) {
        const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);
        const adminChannelId = config.guilds[guild.id].adminChannel;
        const adminChannel = await guild.channels.fetch(adminChannelId)
        if (adminChannel && adminChannel.isTextBased()) {
            adminChannel.send({
                embeds: [
                    {
                        color: Colors.Red,
                        description: `Unable to find the channel for the **${scheduledEvent.name}** session. DM reminders have not been sent.`
                    }
                ]
            });
        }
        return;
    }

    const message = `
This is an event reminder for a upcoming session for **${scheduledEvent.name}**. It is starting in one hour and thirty minutes (1hr 30mins) from this message. 

If you are going to be late, it is best to say now so others are aware. If you can't be in the session then please let someone know ASAP, The earlier the better.

Please join the applicable VC 10 minutes before the event starts.

If you can not make the session then tag a helper to get things sorted out. If the helper doesn't respond then a Mod or Admin can help.

Player list, 
${mentions}`

    subscribers.forEach(subscriber => {
        subscriber.user
            .send(message)
            .catch(async (error) => {
                const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);
                const adminChannelId = config.guilds[guild.id].adminChannel;
                const adminChannel = await guild.channels.fetch(adminChannelId)
                if (!adminChannel || !adminChannel.isTextBased()) {
                    return;
                }
                adminChannel.send({
                    embeds: [
                        {
                            color: Colors.Orange,
                            description: `Unable to send reminder DM to ${subscriber.user} for the **${scheduledEvent.name}** session.`
                        }
                    ]
                });
            });
    });
}

const remindInChannel = async (scheduledEvent: GuildScheduledEvent) => {
    const channel = await getEventChannel(scheduledEvent);
    if (!channel || !channel.isTextBased()) {
        const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);
        const adminChannelId = config.guilds[guild.id].adminChannel;
        const adminChannel = await guild.channels.fetch(adminChannelId)
        if (adminChannel && adminChannel.isTextBased()) {
            adminChannel.send({
                embeds: [
                    {
                        color: Colors.Red,
                        description: `Unable to find the channel for the **${scheduledEvent.name}** session. Channel reminder has not been sent.`
                    }
                ]
            });
        }
        return;
    }

    const subscribers = await scheduledEvent.fetchSubscribers();
    const mentions = subscribers.map(subscriber => `${subscriber.user}`).join('\n');

    const message = `
Your event will start in 10 minutes. Please join the applicable VC now to get started. Typically the voice channel is created by the event host, so look for a VC with the event host's name.

${mentions}`

    channel
        .send(message)
        .catch(async (error) => {
            console.log(`ERROR: Unable to send reminder to channel ${channel.name}`)
        });
}

const pingInChannel = async (scheduledEvent: GuildScheduledEvent, channelId: string, includeMention: boolean) => {
    const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);
    const channel = await guild.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
        console.error("ERROR: unable to fetch new event channel");
        return;
    }

    const inviteCode = config.guilds[guild.id].inviteCode;
    let message = `https://discord.gg/${inviteCode}?event=${scheduledEvent.id}`;
    if (includeMention) {
        const newEventRoleId = config.guilds[guild.id].newEventRole;
        const role = await guild.roles.fetch(newEventRoleId);
        if (role) {
            message = `${role}\n${message}`;
        } else {
            console.error("ERROR: unable to fetch new event role");
        }
    }

    channel
        .send(message)
        .catch(async (error) => {
            console.log(`ERROR: Unable to send ping to channel ${channel.name}`)
        });
}

export const removePing = (id: string) => {
    const timeout = pings[id];
    if (!timeout) {
        return false;
    }
    clearTimeout(timeout);
    delete pings[id];
    return true;
}

const removeReminder = (id: string) => {
    const reminder = reminders[id];
    if (!reminder) {
        return
    }
    delete reminders[id];
    reminder.timeouts.forEach(timeout => clearTimeout(timeout));
}

const remindForTime = (eventTime: number, scheduledEvent: GuildScheduledEvent) => {
    const now = Date.now();
    const firstTimeout = eventTime - (90 * minute) - now;
    const secondTimeout = eventTime - (10 * minute) - now;
    if (secondTimeout > 0x7FFFFFFF) {
        return [
            setTimeout(function () { onGuildScheduledEvent(scheduledEvent); }, 0x7FFFFFFF)
        ];
    }
    const timeouts: NodeJS.Timeout[] = [];
    if (firstTimeout > 0) {
        timeouts.push(setTimeout(remindInDM, firstTimeout, scheduledEvent))
    }
    if (secondTimeout > 0) {
        timeouts.push(setTimeout(remindInChannel, secondTimeout, scheduledEvent))
    }
    return timeouts;
}

export const onGuildScheduledEvent = async (scheduledEvent: GuildScheduledEvent) => {
    removeReminder(scheduledEvent.id);

    if (!scheduledEvent.isScheduled()) {
        return;
    }

    if (!scheduledEvent.scheduledStartAt) {
        return;
    }

    reminders[scheduledEvent.id] = {
        event: scheduledEvent,
        timeouts: remindForTime(scheduledEvent.scheduledStartAt.getTime(), scheduledEvent)
    }
}

export const onGuildScheduledEventCreate = async (scheduledEvent: GuildScheduledEvent) => {
    onGuildScheduledEvent(scheduledEvent);

    const channel = await getEventChannel(scheduledEvent);
    if (channel) {
        await pingInChannel(scheduledEvent, channel.id, false);
    }

    const now = Date.now();
    const delay = 30 * minute;

    if (!scheduledEvent.scheduledStartAt || scheduledEvent.scheduledStartAt.getTime() - delay < now) {
        return;
    }

    const newEventChannelId = config.guilds[scheduledEvent.guildId].newEventChannel;
    pings[scheduledEvent.id] = setTimeout(pingInChannel, delay, scheduledEvent, newEventChannelId, true);
}

export const onGuildScheduledEventDelete = async (scheduledEvent: GuildScheduledEvent) => {
    removePing(scheduledEvent.id);
    removeReminder(scheduledEvent.id);
}

export const onGuildScheduledEventUpdate = async (_: GuildScheduledEvent | null, newScheduledEvent: GuildScheduledEvent) => onGuildScheduledEvent(newScheduledEvent);

export const onGuildScheduledEventUserAdd = async (scheduledEvent: GuildScheduledEvent, user: User) => {
    if (!scheduledEvent.scheduledStartAt) {
        return;
    }
    const timeDifference = scheduledEvent.scheduledStartAt.getTime() - Date.now()
    if (!scheduledEvent.isScheduled() || timeDifference >= (60 * minute)) {
        return;
    }
    const eventChannel = await getEventChannel(scheduledEvent);
    if (!eventChannel || !eventChannel.isTextBased()) {
        return;
    }
    const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);
    const member = await guild.members.fetch(user);
    if (!member) {
        return;
    }
    eventChannel.send({
        embeds: [
            {
                color: Colors.Blue,
                title: "Late Addition",
                description: `**${member.displayName}** has signed up for the event. They are considered a backup if the session is already full.`
            }
        ]
    });
}

export const onGuildScheduledEventUserRemove = async (scheduledEvent: GuildScheduledEvent, user: User) => {
    if (!scheduledEvent.scheduledStartAt) {
        return;
    }
    const timeDifference = scheduledEvent.scheduledStartAt.getTime() - Date.now()
    if (!scheduledEvent.isScheduled() || timeDifference >= (60 * minute)) {
        return;
    }

    const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);

    const eventChannel = await getEventChannel(scheduledEvent);
    if (eventChannel && eventChannel.isTextBased()) {
        const member = await guild.members.fetch(user);
        if (!member) {
            return;
        }
        eventChannel.send({
            embeds: [
                {
                    color: Colors.Red,
                    title: "Late Removal",
                    description: `**${member.displayName}** has removed their name from the session.`
                }
            ]
        });
    }

    const adminChannelId = config.guilds[guild.id].adminChannel;
    const adminChannel = await guild.channels.fetch(adminChannelId)
    if (adminChannel && adminChannel.isTextBased()) {
        adminChannel.send({
            embeds: [
                {
                    color: Colors.Red,
                    description: `${user} has removed their name from the **${scheduledEvent.name}** session less than an hour before start.`
                }
            ]
        });
    }
}
