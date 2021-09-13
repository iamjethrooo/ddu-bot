const { Command } = require('discord.js-commando');
const querystring = require('query-string');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = class DogCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dog',
			aliases: ['aso', 'dogs'],
			group: 'animals',
			memberName: 'dog',
			description: 'Woof.',
		});
	}

	async run(message) {
		const images = await loadImage(message.author.username);

		message.say({ files: [ images[0].url ] });
	}
};

async function loadImage(sub_id, mime = 'jpg, png') {
	const headers = {
		'x-api-key': process.env.DOG_API,
	};

	const query = {
		'has_breeds': true,
		'mime_types': mime,
		'size': 'med',
		'sub_id': sub_id,
		'limit': 1,
	};
	const queryString = querystring.stringify(query);
	
	return await fetch(`https://api.thedogapi.com/v1/images/search?${queryString}`, { method: 'GET', headers: headers })
		.then(res => res.json())
		.then(json => json)
		.catch(console.error);
}