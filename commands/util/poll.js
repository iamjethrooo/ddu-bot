const { Command } = require('discord.js-commando');
const pollEmbed = require('../../modules/poll.js');

module.exports = class PollCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'poll',
			group: 'util',
			memberName: 'poll',
			description: 'Make a poll.',
			format: '<title> <options> (timeout in seconds)'
		});
	}

	async run(message, args) {
		args = args.split(' ');
		const title = args[0];
		const options = args.slice(1);
		options.pop();
		pollEmbed(message, title, options, parseInt(args[args.length - 1]))
			.catch(console.error);
	}
}