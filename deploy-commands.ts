import { commands } from "./src/commands";
import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js"
require("dotenv").config();
const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;

const commandDatas: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
commands.forEach((value) => {
	commandDatas.push(value.data.toJSON());
})

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(TOKEN!);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commandDatas.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID!, GUILD_ID!),
			{ body: commandDatas },
		);

		console.log(`Successfully reloaded application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
