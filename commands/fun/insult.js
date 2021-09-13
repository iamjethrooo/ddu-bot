const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class InsultCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'insult',
			aliases: ['roast'],
			group: 'fun',
			memberName: 'insult',
			description: 'Generate an evil insult!',
			throttling: {
				usages: 1,
				duration: 6,
			},
		});
	}

	run(message) {
		fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json')
			.then(res => res.json())
			.then(json => {
				if (!message.mentions.users.size) return message.reply(json.insult);
			})
			.catch(err => {
				message.say('Failed to deliver insult :sob:');
				return console.error(err);
			});
		const avatarList = message.mentions.users.map(user => {
			fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json')
				.then(res => res.json())
				.then(json => {
					return message.say(`<@${user.id}>, ${json.insult}`);
				})
				.catch(err => {
					message.say('Failed to deliver insult :sob:');
					return console.error(err);
				});
		});


	}
};