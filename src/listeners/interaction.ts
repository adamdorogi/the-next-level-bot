import { ActionRowBuilder, Colors, EmbedBuilder, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { commands } from "../commands/command";

export const onInteractionCreate = async (interaction: Interaction) => {
    if (interaction.isModalSubmit()) {
        if (interaction.customId !== "announcementModal") {
            return
        }
        const announcement = interaction.fields.getTextInputValue("announcementInput");

        const channel = interaction.channel;
        if (channel) {
            await channel.send(announcement);
        }
        await interaction.reply({content: "Announcement successful.", ephemeral: true})
    };

    if (!interaction.isChatInputCommand()) {
        return;
    }

    if (interaction.commandName === "announce") {
		const modal = new ModalBuilder()
			.setCustomId("announcementModal")
			.setTitle("Make an announcement");

		const announcementInput = new TextInputBuilder()
			.setCustomId("announcementInput")
			.setLabel("Announcement")
            .setRequired(true)
			.setStyle(TextInputStyle.Paragraph);

		const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(announcementInput);

		modal.addComponents(actionRow);

		await interaction.showModal(modal);
        return;
	}

    const command = commands.find(command => command.builder.name === interaction.commandName);
    if (!command) {
        return;
    }

    try {
        await interaction.deferReply({ ephemeral: command.ephemeral });
        const reply = await command.execute(interaction);
        reply == null
            ? await interaction.deleteReply()
            : await interaction.editReply(reply);
    } catch (error) {
        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`:exclamation: ${error}`);
        await interaction.editReply({ embeds: [embed] });
    }
}
