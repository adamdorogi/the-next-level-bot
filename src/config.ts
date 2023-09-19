export default {
    guilds: {
        "1100837113890607114": {
            inviteCode: "ZZQDr5ZfHZ",
            adminChannel: "1100863922199863440",
            newEventChannel: "1102969897350336595",
            memberInfoChannel:"1105128932912664616",
            newEventRole: "1106569156725325824",
            rolesChannels: {
                "1106197125102051480": {
                    "1107960864880984135": {
                        "1104759325962023012": "1106577125424758884" // PlayStation Plus
                    },
                    "1107961209250123776": {
                        "❔": "1106577693685862523" // Question of the Day
                    },
                    "1107962086560108565": {
                        "🗞️": "1106569156725325824" // New Event
                    },
                    "1107962959566733332": {
                        "📨": "1106577523883638874" // Server Shutdowns
                    },
                    "1107963266967273472": {
                        "🎉": "1106569909422538815" // Birthdays
                    },
                    "1107963605229518909": {
                        "🎈": "1106569964590223440" // Anniversaries
                    },
                    "1107964583462834297": {
                        "1105264499323314216": "1106569428977586258" // Latest completions
                    },
                    "1107965092110274570": {
                        "⏯️": "1106570155850469476" // Let's play
                    },
                    "1107965357689405490": {
                        "🏅": "1106569322068971540" // Sports
                    },
                    "1107966791017320458": {
                        "💯": "1106577628451844096" // Gaming news
                    }
                },
            },
        },
        "1150583645418033172": {
            inviteCode: "FjYZkMWTJm",
            adminChannel: "0",
            newEventChannel: "1151764565223284757",
            memberInfoChannel:"1150712064004853840",
            newEventRole: "0",
            rolesChannels: {
            },
        }
    }
} as {
    guilds: {
        [messageId: string]: {
            inviteCode: string,
            adminChannel: string,
            newEventChannel: string,
            memberInfoChannel:string,
            newEventRole: string,
            rolesChannels: {
                [channelId: string]: {
                    [messageId: string]: {
                        [emoji: string]: string
                    }
                }
            }
        }
    }
}
