const index = require('../index.js');
const client = index.client;
const { Collection } = require("discord.js");
const guildInvites = new Collection();
const wait = require('util').promisify(setTimeout);

require('dotenv').config();

module.exports = {
	run: async () => {
		await wait(1000);

		client.playerManager = new Map();
		client.guildData = new Collection();
		client.user.setPresence({
			status: 'online',
			activity: {
				name: 'christmas songs',
				type: 'STREAMING',
				url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
			}
		})
		.catch(console.error);

		client.invites = guildInvites;
		// Fetch invites for every guild and add to clientInvites
		for (const guild of client.guilds.cache.values()) {
			guild.fetchInvites()
			.then(invite => client.invites.set(guild.id, invite))
			.catch(error => console.log(error));
		}
		console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
	}
}
