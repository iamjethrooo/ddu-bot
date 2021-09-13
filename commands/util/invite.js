const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class InviteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'invite',
			aliases: ['invite', 'link'],
			group: 'util',
			memberName: 'invite',
			description: 'Want to invite this bot to another server? Use this command!',
			throttling: {
				usages: 1,
				duration: 6,
			},
		});
	}

	run(message) {
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Invite me to your server!')
			.setURL('https://discord.com/api/oauth2/authorize?client_id=730410703378448394&permissions=0&scope=bot');
		// .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
		// .setDescription('Some description here')
		// .setThumbnail('https://cdn.discordapp.com/app-icons/730410703378448394/77053223318bfd3fd52b15f94ffb97d5.png?size=256')
		// .setTimestamp()
		// .setFooter(`Requested by ${message.author.username}#${message.author.discriminator}`)
		return message.say(embed);
	}
};