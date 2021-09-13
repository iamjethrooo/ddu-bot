const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class SnipeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'snipe',
			group: 'guild',
			memberName: 'snipe',
			description: 'Reveal the last deleted message in the channel!'
		});
	}

	run(message) {
		if (!message.guild) {
			return message.say(`You can't use this command in a DM!`);
		}

		const sniped = this.client.snipes.get(message.channel.id);


		if (message.member.hasPermission('ADMINISTRATOR') || message.member.roles.cache.find(r => r.name === "Sniper") || message.member.roles.cache.find(r => r.name === "Enforcer")) {
			if (!sniped) {
				return message.say('There\'s nothing to snipe!');
			}
			const embed = new MessageEmbed()
				.setAuthor(`${sniped.author.username}#${sniped.author.discriminator}`, sniped.author.displayAvatarURL({ dynamic: true }))
				.setDescription(sniped.content)
				.setTimestamp(sniped.createdAt)
				.setColor(message.member.displayHexColor)
			return message.say(embed);
		}
	}
}
