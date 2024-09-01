import type { Interaction } from "discord.js";

import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from "dotenv";
import { AudioIO, IoStreamRead, SampleFormat16Bit, SampleFormat32Bit, getDevices } from "naudiodon";
import { commands } from "./commands";

import fs from "fs";

config();

console.log(getDevices().filter((d) => d.maxOutputChannels == 0))

const ai = AudioIO({
    inOptions: {
        channelCount: 2,
        sampleFormat: SampleFormat16Bit,
        sampleRate: parseInt(process.env.SAMPLE_RATE || "44100"),
        deviceId: parseInt(process.env.DEVICE_ID || "47"),
        closeOnError: true
    },
});

const runDiscord = (ai: IoStreamRead) => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ]});

    client.once(Events.ClientReady, readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`)
    });

    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const command = commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
    
        try {
            await command.execute(interaction, client, ai);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }    });
    
    client.login(process.env.TOKEN);
}

runDiscord(ai);