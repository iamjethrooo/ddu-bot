const { Command } = require('discord.js-commando');

module.exports = class SummonCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'summon',
			group: 'music',
			memberName: 'summon',
			description: 'Summon the bot to your VC!'
		});
	}

	run(message) {
		console.log(message);
		message.member.voice.channel.join()
			.then(channel => {
				channel.voice.setSelfDeaf(true);
			});
	}
}