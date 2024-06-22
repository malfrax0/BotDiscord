import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js"
import { IoStreamRead } from "naudiodon";

export type SlashCommandInstance = {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction, client: Client, ai: IoStreamRead) => Promise<void>
}