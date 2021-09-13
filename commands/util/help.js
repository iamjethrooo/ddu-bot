const { oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
require('dotenv').config();

const prefix = process.env.PREFIX

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			format: '(command)',
			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(message, args) {
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, message);
		let embed = new MessageEmbed()
			.setColor('#0099ff');
		if(args.command) {
			if(commands.length === 1) {
				embed.setAuthor(`${prefix} ${commands[0].name} info`)
					.addFields(
							{ name: 'Description', value: commands[0].description, inline:true },
							{ name: 'Usage', value: `${prefix} ${commands[0].name} ${commands[0].format ? commands[0].format : ''}`, inline:true },
						)
					.setFooter('P.S.: "<>" is required, "()" is optional');
			} else if(commands.length > 1) {
				message.say('Multiple commands found. Please be more specific.');
			} else {
				return message.say(
					`Unable to identify command. Use ${message.usage(null, message.channel.type === 'dm' ? null : undefined, message.channel.type === 'dm' ? null : undefined)} to view the list of all commands.`
				);
			}
		} else {
			embed.setAuthor('Command List')
				.setDescription(`For more information on a specific command, use \`${prefix} <command>\``)
				.addFields(
						{ name: '🐱 Animals', value: '`cat` `dog`' },
						{ name: '😂 Fun', value: '`chucknorris` `clap` `florida` `insult` `mock` `quote` `say` `spam`' },
						{ name: '🔨 Moderation', value: '`disable` `enable` `prefix` `prune`' },
						{ name: '🔧 Utility', value: '`help` `invite` `ping` `poll` `serverinfo` `userinfo` `weather`' },
					)
		}

		return message.say(embed);
	}
};