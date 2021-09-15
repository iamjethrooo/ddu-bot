const { Command } = require('discord.js-commando');

module.exports = class SummonCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'summon',
			group: 'music',
			aliases: ['join'],
			memberName: 'summon',
			clientPermissions: ['SPEAK', 'CONNECT'],
			description: 'Summon the bot to your VC!'
		});
	}

	async run(message) {
		const voiceChannel = message.member.voice.channel
		if (voiceChannel) {
			if (!message.client.voice.connections.some(conn => conn.channel.id == voiceChannel.id)) {
				await message.member.voice.channel.join()
					.then(channel => {
						channel.voice.setSelfDeaf(true);
					});
			}
		} else {
			message.say("Please join a voice channel and try again!");
		}
	}
}
