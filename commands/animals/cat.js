const { Command } = require('discord.js-commando');
const querystring = require('query-string');
const fetch = require('node-fetch');

require('dotenv').config();

module.exports = class CatCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'cat',
			aliases: ['pusa', 'cats'],
			group: 'animals',
			memberName: 'cat',
			description: 'Meow.',
		});
	}

	async run(message, args) {
		const images = await loadImage(message.author.username, args);

		message.say({ files: [ images[0].url ] });
	}
};

async function loadImage(sub_id, mime = 'jpg, png') {
	const headers = {
		'x-api-key': process.env.CAT_API,
	};

	const query = {
		'mime_types': mime,
		'size': 'med',
		'sub_id': sub_id,
		'limit': 1,
	};
	const queryString = querystring.stringify(query);

	return await fetch(`https://api.thecatapi.com/v1/images/search?${queryString}`, { method: 'GET', headers: headers })
		.then(res => res.json())
		.then(json => json)
		.catch(console.error);
}