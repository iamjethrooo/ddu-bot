const index = require('../index.js');
const client = index.client;

module.exports = {
	run: async invite => {
    // Add new invite to the cache when a new one is created
    client.invites.set(invite.guild.id, await invite.guild.fetchInvites());
	}
}
