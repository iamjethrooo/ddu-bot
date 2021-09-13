const { CommandoClient } = require('discord.js-commando');
const { Structures } = require('discord.js');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

require('dotenv').config();


const client = new CommandoClient ({
	commandPrefix: process.env.PREFIX,
	owner: '496523098439548929',
	invite: '',
	unknownCommandResponse: false,
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['animals', 'Animal Commands'],
		['fun', 'Fun Commands'],
		['guild', 'Guild Commands'],
		['music', 'Music Commands'],
		['util', 'Utility Commands'],
		['horni', 'Horni Commands'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		help: false,
		unknownCommand: false,
		ping: false,
		prefix: false
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));

fs.readdir('./events/', (err, files) => {
	if (err) return console.error(err);
	files.forEach(file => {
		const eventFunction = require(`./events/${file}`);
		if (eventFunction.disabled) return;

		const event = eventFunction.event || file.split('.')[0];
		const emitter = (typeof eventFunction.emitter === 'string' ? client[eventFunction.emitter] : eventFunction.emitter) || client;
		const once = eventFunction.once;

		try {
			emitter[once ? 'once' : 'on'](event, (...args) => eventFunction.run(...args));
		} catch (error) {
			console.error(error.stack);
		}
	});
});

client.on('error', console.error);

client.login(process.env.DISCORD_TOKEN);

module.exports.client = client;