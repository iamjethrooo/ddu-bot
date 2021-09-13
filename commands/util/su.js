const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const getMember = require('../../modules/search-user.js');

module.exports = class SUCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'su',
			group: 'util',
			memberName: 'su',
			description: 'Spam your chats!',
			throttling: {
				usages: 1,
				duration: 6,
			},
		});
	}

	async run(message, args) {
		let x = await getMember(message, args, this.client);
		console.log(`<@${x}>`);
	}
}