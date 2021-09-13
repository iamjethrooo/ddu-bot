const { Command } = require('discord.js-commando');

module.exports = class SayCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'say',
			aliases: ['parrot', 'copy'],
			group: 'fun',
			memberName: 'say',
			description: 'Replies with the text you provide.',
			args: [
				{
					key: 'text',
					prompt: 'What text would you like the bot to say?',
					type: 'string',
					validate: text => text.length < 201,
				},
			],
		});
	}

	run(message, { text }) {
		message.delete();
		return message.say(text);
	}
};