import { Colors, GuildMember } from "discord.js";
import moment from "moment";

export const onMemberJoin = async (member: GuildMember) => {
    const guild = await member.client.guilds.fetch(process.env.GUILD_ID!);
    const memberInfoChannel = await guild.channels.fetch(process.env.MEMBER_INFO_CHANNEL!)

    if (memberInfoChannel && memberInfoChannel.isTextBased()) {
        memberInfoChannel.send({
            embeds: [
                {
                    color: Colors.Green,
                    description: `<@${member.user.id}> ${member.user.tag}`,
                    author: {
                        name: "Member Joined",
                        icon_url: member.displayAvatarURL(),
                    },
                    thumbnail: {
                        url: member.displayAvatarURL(),
                    },
                    fields: [
                        {
                            name: "**Account Age**",
                            value: getDuration(member.user.createdAt),
                        },
                    ],
                    footer: {
                        text: `ID: ${member.user.id}`,
                    },
                }
            ]
        });
    }
}

const getDuration = (date: Date) : string => {
    const duration = moment.duration(moment().diff(moment(date)))
    const durationYears = duration.years()
    const durationYearsText = durationYears == 0 ? undefined : durationYears == 1 ? `${durationYears} year` : `${durationYears} years`
    const durationMonths = duration.months()
    const durationMonthsText = durationMonths == 0 ? undefined : durationMonths == 1 ? `${durationMonths} month` : `${durationMonths} months`
    const durationDays = duration.days()
    const durationDaysText = durationDays == 0 ? undefined : durationDays == 1 ? `${durationDays} day` : `${durationDays} days`
    
    const filteredArray = [durationYearsText, durationMonthsText, durationDaysText].filter(text => text !== undefined)
    if (filteredArray.length === 0) {
        return "0 days"
    }
    return filteredArray.join(", ")
}
