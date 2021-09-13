const { Command } = require('discord.js-commando');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			group: 'util',
			memberName: 'prefix',
			description: 'Shows or sets the command prefix.',
			format: '(prefix)',
			args: [
				{
					key: 'prefix',
					prompt: 'What would you like to set the bot\'s prefix to?',
					type: 'string',
					max: 15,
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		// Just output the prefix
		if(message.guild) {
			if(!message.member.hasPermission('ADMINISTRATOR')) {
				return message.reply('Only administrators may use this command.');
			}
		}
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.reply(`${prefix ? `The command prefix is \`\`${prefix}\`\`.` : 'There is no command prefix.'} To run commands, use ${msg.anyUsage('command')}.`);
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.reply('Only administrators may change the command prefix.');
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.reply('Only the bot owner(s) may change the global command prefix.');
		}

		// Save the prefix
		const lowercase = args.prefix.toLowerCase();
		const prefix = lowercase === 'none' ? '' : args.prefix;
		let response;
		if(lowercase === 'default') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
			const current = this.client.commandPrefix ? `\`\`${this.client.commandPrefix}\`\`` : 'no prefix';
			response = `Reset the command prefix to the default (currently ${current}).`;
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
			response = prefix ? `Set the command prefix to \`\`${args.prefix}\`\`.` : 'Removed the command prefix entirely.';
		}

		await msg.reply(`${response} To run commands, use ${msg.anyUsage('command')}.`);
		return null;
	}
};