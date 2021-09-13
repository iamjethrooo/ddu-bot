const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class UptimeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'uptime',
			memberName: 'uptime',
			group: 'util',
			description: 'View the bot\'s total uptime!'
		});
	}

	run(message) {
		let totalSeconds = (this.client.uptime / 1000);
		const days = Math.floor(totalSeconds / 86400);
		const hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = Math.floor(totalSeconds % 60);

		const embed = new MessageEmbed()
		.setTitle('Uptime')
		.setTimestamp()
		.addFields(
				{ name: 'Hours: ', value: hours, inline: true },
				{ name: 'Minutes', value: minutes, inline: true },
				{ name: 'Seconds', value: seconds, inline: true },
			)
		return message.say(embed)
	}
}