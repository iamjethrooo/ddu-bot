const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class ServerInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'serverinfo',
			group: 'util',
			memberName: 'serverinfo',
			description: 'View information about the server.',
		});
	}

	run(message) {
		const randomColor = "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });
		const icon = message.guild.iconURL();
		const embed = new MessageEmbed()
			.setAuthor(message.guild.name, icon)
			.setColor(randomColor)
			.setThumbnail(icon)
			.addFields(
					{ name: 'Server Owner', value: message.guild.owner, inline:true },
					{ name: 'Total Member Count', value: message.guild.memberCount },
					{ name: 'Humans', value: countHumans(message.guild), inline:true },
					{ name: 'Bots', value: countBots(message.guild), inline:true },
					{ name: 'Online', value: countOnlineUsers(message.guild) },
				)
			.setFooter('Server created at:')
			.setTimestamp(message.guild.createdAt);

		message.say(embed);
	}
}

function countBots(guild) {
	let botCount = 0;
	guild.members.cache.forEach(member => {
		if(member.user.bot) botCount++;
	});

	return botCount;
}

function countHumans(guild) {
	let humanCount = 0;
	guild.members.cache.forEach(member => {
		if (!member.user.bot) humanCount++;
	});

	return humanCount;
}

function countOnlineUsers(guild) {
	let onlineCount = 0;
	guild.members.cache.forEach(member => {
		if(member.user.presence.status === 'online' || member.user.presence.status === 'idle' || member.user.presence.status === 'dnd') onlineCount++
	});

	return onlineCount;
}