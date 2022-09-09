import { Interaction } from "discord.js";
import { commands } from "../commands/command";

export const onInteractionCreate = async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = commands.find(command => command.name === interaction.commandName);
    if (!command) {
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) {
            console.error(error);
        }
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}
