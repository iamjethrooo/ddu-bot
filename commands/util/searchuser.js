const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const getMember = require('../../modules/search-user.js');

module.exports = class SearchUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'search-user',
			group: 'util',
			memberName: 'search-user',
			aliases: ['searchuser', 'su'],
			description: 'Search for a user!',
			throttling: {
				usages: 1,
				duration: 6,
			},
		});
	}

	async run(message, args) {
		let x = await getMember(message, args, this.client);
		//console.log(`<@${x}>`);
	}
}