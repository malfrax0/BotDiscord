import { SlashCommandInstance } from "../type";

import { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice"
import { Encoding, SlashCommandBuilder } from "discord.js"
import { FFmpeg } from "prism-media"
        
import { createAudioResource, StreamType } from "@discordjs/voice"
import { Readable, Stream } from "stream"
import { AudioIO, IoStreamRead, SampleFormat16Bit } from "naudiodon";

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
		maxMissedFrames: Math.round(5000 / 20),
    }
});

const attachRecorder = () => {
    const ffmpegStream = new FFmpeg(
        {
            args: [
                '-analyzeduration',
                '0',
                '-loglevel',
                '0',
                '-f',
                "dshow",
                '-i',
                "audio=Voicemeeter Out B1 (VB-Audio Voicemeeter VAIO)",
                '-acodec',
                'libopus',
                '-f',
                'opus',
                '-ar',
                '48000',
                '-ac',
                '2',
            ],
        }
    )

    const resource = createAudioResource(ffmpegStream, {
        inputType: StreamType.OggOpus,
    })

    player.play(resource);
}

player.on("error", (error: any) => {
    console.error(error);
})
player.on("debug", (debug: any) => {
    console.log(debug);
})

player.on('stateChange', (oldState, newState) => {
	if (oldState.status === AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Playing) {
		console.log('Playing audio output on audio player');
	} else if (newState.status === AudioPlayerStatus.Idle) {
		console.log('Playback has stopped. Attempting to restart.');
		attachRecorder();
	}
});

let connection: VoiceConnection | null = null;
let ai: IoStreamRead | null = null;

export default {
    data: new SlashCommandBuilder()
        .setName("audiojoin")
        .setDescription("The bot join me in audio"),
    async execute(interaction, client) {
        if (connection !== null) {
            connection.disconnect();
            connection = null;
            await interaction.reply(`Thanks for listening!`)
            // ai!.quit();
            // ai = null;
            return;
        }
        const Guild = client.guilds.cache.get(process.env.GUILD_ID!); // Getting the guild.
        const Member = Guild?.members.cache.get(interaction.user.id); // Getting the member.

        console.log(`Execute command audiojoin.`);
        console.log(`Executed from ${interaction.user.id}. Hello ${Member?.displayName}`)
        if (!Member || !Member.voice.channel) {
            await interaction.reply('I don\'t see you in any channel :(');
            return;
        }
        await interaction.reply(`I'm joining! ${Member?.displayName}`)

        connection = joinVoiceChannel({
            channelId: Member.voice.channel.id,
            guildId: process.env.GUILD_ID!,
            adapterCreator: Member.voice.channel.guild.voiceAdapterCreator
        });

        attachRecorder();

        connection.subscribe(player);
    }
} as SlashCommandInstance