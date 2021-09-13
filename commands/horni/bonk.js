const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class GinBonkCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'bonk',
			group: 'horni',
			memberName: 'bonk',
			description: 'Bonk.'
		});
	}

	run(message) {
		if (!message.guild) {
			return message.say(`You can't use this command in a DM!`);
		}

		return message.say("<a:Ginbonk:808888585511501895>");
	}
}