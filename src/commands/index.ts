import { Collection } from "discord.js"
import connect from "./utility/connect"
import { SlashCommandInstance } from "./type"

export const commands = new Collection<string, SlashCommandInstance>([
    [connect.data.name, connect]
]);