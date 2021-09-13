const index = require('../index.js');
const client = index.client;
const { MessageEmbed } = require('discord.js');

client.snipes = {
	get: function(ChannelId) {
		return this[ChannelId];
	},
	set: function(msg) {
		this[msg.channel.id] = msg;
	}
}

module.exports = {
	run: message => {
		if (message.author.bot) return;
		client.snipes.set(message);
	}
}
