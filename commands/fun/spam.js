const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');

module.exports = class SpamCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'spam',
			aliases: ['morgan'],
			group: 'fun',
			memberName: 'spam',
			description: 'Spam your chat!',
			throttling: {
				usages: 1,
				duration: 6,
			},
		});
	}

	run(message) {
		if (message.guild.id == '669190303353143306') {
			if (message.channel.id == '682838969179832423') {
				fetch('https://www.reddit.com/r/copypasta/new.json?sort=top', {
					method: 'GET',
				})
					.then(res => res.json())
					.then(json => {
						const rand = Math.floor(Math.random() * json.data.dist);
						console.log(`RAND: ${rand}`);
						return message.say(json.data.children[rand].data.selftext, { split: true });
					})
					.catch(err => {
						message.say('An error occured!');
						return console.error(err);
					});
			}
		}
	}
};