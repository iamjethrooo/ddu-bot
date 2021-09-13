const { Command } = require('discord.js-commando');

module.exports = class ChangeNameCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'change-name',
			memberName: 'change-name',
			group: 'util',
			description: 'Change the bot\'s name!',
			ownerOnly: true
		});
	}

	run(message, args) {
		return this.client.user.setUsername(args.toString());
	}
}
