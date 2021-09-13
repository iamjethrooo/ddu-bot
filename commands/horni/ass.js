const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class AssCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ass',
			group: 'horni',
			memberName: 'ass',
			description: 'Bonk.'
		});
	}

	run(message) {
		if (!message.guild) {
			return message.say(`You can't use this command in a DM!`);
		}
		if (message.channel.id == 708300479968575584) {
			return message.say("<a:Ginbonk:808888585511501895>");
		}
	}
}