const { Command } = require('discord.js-commando');

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			group: 'util',
			memberName: 'ping',
			description: 'Checks the bot\'s ping to the Discord server.',
			throttling: {
				usages: 5,
				duration: 10
			}
		});
	}

	async run(msg) {
		msg.delete();
		const pingMsg = await msg.reply('Pinging...');
		return pingMsg.edit(`${msg.channel.type !== 'dm' ? `${msg.author}, ` : ''}Pong! \`${(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)}ms.\``);
	}
};