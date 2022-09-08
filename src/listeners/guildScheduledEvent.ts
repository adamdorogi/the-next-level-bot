import { GuildScheduledEvent, User } from "discord.js";

const minute = 1000 * 60;

type GuildScheduledEventReminder = {
    event: GuildScheduledEvent
    timeouts: NodeJS.Timeout[]
}

const reminders: Record<string, GuildScheduledEventReminder | undefined> = {};

const pings: Record<string, NodeJS.Timeout | undefined> = {};

const getEventChannel = async (scheduledEvent: GuildScheduledEvent) => {
    const channelName = scheduledEvent.entityMetadata.location?.replace(/#/, '').trim().toLowerCase();
    const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);
    const activeThreads = await guild.channels.fetchActiveThreads();
    var thread = activeThreads.threads.find(t => t.name.toLowerCase() === channelName);
    if (thread) {
        return thread;
    }
    const channels = await guild.channels.fetch();
    return channels.find(c => c.name === channelName);
}

const remindInDM = async (scheduledEvent: GuildScheduledEvent) => {
    const subscribers = await scheduledEvent.fetchSubscribers({ withMember: true });
    const mentions = subscribers.map(subscriber => `${subscriber.member?.displayName || subscriber.user.username}`).join('\n');

    const channel = await getEventChannel(scheduledEvent);
    const location = channel ? `${channel}` : scheduledEvent.entityMetadata.location;

    const message = `
Event Reminder:
This is a reminder for the **${scheduledEvent.name}** event that starts in 1 hour and 30 minutes. Please get ready and be on time for the session. Once you the ready, join the applicable voice channel to let others know that you are ready.

If you expect to be late, please inform how late you will be. Or if you expect to be absent, please remove your name from the event within the next 30 minutes and inform in the ${location} channel.
Removing your name within the hour before start of the session, failing to inform of any lateness or absenteeism may result in a warning. Please read our <#934632329421398026>, specifically rule 11.

If you require any assistance, please head over to the <#874388042205499422> channel and ask for it. Tagging one of the online staff members will get you a faster response.

Confirmed Members:
${mentions}`

    subscribers.forEach(subscriber => {
        subscriber.user
            .send(message)
            .catch(async (error) => {
                const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);
                const adminChannel = await guild.channels.fetch(process.env.ADMIN_CHANNEL!)
                if (!adminChannel || !adminChannel.isText()) {
                    return;
                }
                adminChannel.send({
                    embeds: [
                        {
                            color: "ORANGE",
                            description: `Unable to send reminder DM to ${subscriber.user} for the **${scheduledEvent.name}** session.`
                        }
                    ]
                });
            });
    });
}

const remindInChannel = async (scheduledEvent: GuildScheduledEvent) => {
    const channel = await getEventChannel(scheduledEvent);
    if (!channel || !(channel.isText() || channel.isThread())) {
        return;
    }

    const subscribers = await scheduledEvent.fetchSubscribers();
    const mentions = subscribers.map(subscriber => `${subscriber.user}`).join('\n');

    const message = `
Your event will start in 10 minutes. Please join the applicable VC now to get started. Typically the voice channel is created by the host, so look for a VC with the host's name. Or create one of your own by pressing <#964545089852543046>. If you need assistance, ask in the <#874388042205499422> channel.

${mentions}`

    channel
        .send(message)
        .catch(async (error) => {
            console.log(`ERROR: Unable to send reminder to channel ${channel.name}`)
        });
}

const pingInChannel = async (scheduledEvent: GuildScheduledEvent) => {
    const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);
    const channel = await guild.channels.fetch(process.env.NEW_EVENT_CHANNEL!);
    if (!channel || !channel.isText()) {
        console.error("ERROR: unable to fetch new event channel");
        return;
    }
    const role = await guild.roles.fetch(process.env.NEW_EVENT_ROLE!);
    if (!role) {
        console.error("ERROR: unable to fetch new event role");
        return;
    }

    const message = `
${role}
https://discord.gg/${process.env.INVITE_CODE!}?event=${scheduledEvent.id}`;

    channel
        .send(message)
        .catch(async (error) => {
            console.log(`ERROR: Unable to send ping to channel ${channel.name}`)
        });
}

const removePing = (id: string) => {
    const timeout = pings[id];
    if (!timeout) {
        return
    }
    clearTimeout(timeout);
    delete pings[id];
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

    reminders[scheduledEvent.id] = {
        event: scheduledEvent,
        timeouts: remindForTime(scheduledEvent.scheduledStartAt.getTime(), scheduledEvent)
    }
}

export const onGuildScheduledEventCreate = async (scheduledEvent: GuildScheduledEvent) => {
    onGuildScheduledEvent(scheduledEvent);

    const now = Date.now();
    const delay = 30 * minute;

    if (scheduledEvent.scheduledStartAt.getTime() - delay < now) {
        return;
    }

    pings[scheduledEvent.id] = setTimeout(pingInChannel, delay, scheduledEvent);
}

export const onGuildScheduledEventDelete = async (scheduledEvent: GuildScheduledEvent) => {
    removePing(scheduledEvent.id);
    removeReminder(scheduledEvent.id);
}

export const onGuildScheduledEventUpdate = async (_: GuildScheduledEvent, newScheduledEvent: GuildScheduledEvent) => onGuildScheduledEvent(newScheduledEvent);

export const onGuildScheduledEventUserAdd = async (scheduledEvent: GuildScheduledEvent, user: User) => {
    const timeDifference = scheduledEvent.scheduledStartAt.getTime() - Date.now()
    if (!scheduledEvent.isScheduled() || timeDifference >= (60 * minute)) {
        return;
    }
    const eventChannel = await getEventChannel(scheduledEvent);
    if (!eventChannel || !(eventChannel.isText() || eventChannel.isThread())) {
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
                color: "BLUE",
                title: "Late Addition",
                description: `**${member.displayName}** has signed up for the event. They are considered a backup if the session is already full.`
            }
        ]
    });
}

export const onGuildScheduledEventUserRemove = async (scheduledEvent: GuildScheduledEvent, user: User) => {
    const timeDifference = scheduledEvent.scheduledStartAt.getTime() - Date.now()
    if (!scheduledEvent.isScheduled() || timeDifference >= (60 * minute)) {
        return;
    }

    const guild = await scheduledEvent.client.guilds.fetch(scheduledEvent.guildId);

    const eventChannel = await getEventChannel(scheduledEvent);
    if (eventChannel && (eventChannel.isText() || eventChannel.isThread())) {
        const member = await guild.members.fetch(user);
        if (!member) {
            return;
        }
        eventChannel.send({
            embeds: [
                {
                    color: "RED",
                    title: "Late Removal",
                    description: `**${member.displayName}** has removed their name from the session.`
                }
            ]
        });
    }

    const adminChannel = await guild.channels.fetch(process.env.ADMIN_CHANNEL!);
    if (adminChannel && adminChannel.isText()) {
        adminChannel.send({
            embeds: [
                {
                    color: "RED",
                    description: `${user} has removed their name from the **${scheduledEvent.name}** session less than an hour before start.`
                }
            ]
        });
    }
}
