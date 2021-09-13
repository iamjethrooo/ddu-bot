const index = require('../index.js');
const client = index.client;
const { Collection } = require("discord.js");
const guildInvites = new Collection();
const wait = require('util').promisify(setTimeout);

module.exports = {
	run: async () => {
		await wait(1000);
		console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
		client.user.setPresence({
			status: 'online',
			activity: {
				name: 'Among Us',
			},
			clientStatus: 'Test'
		})
		.catch(console.error);

		client.invites = guildInvites;
		// Fetch invites for every guild and add to clientInvites
		for (const guild of client.guilds.cache.values()) {
			guild.fetchInvites()
			.then(invite => client.invites.set(guild.id, invite))
			.catch(error => console.log(error));
		}

	}
}
