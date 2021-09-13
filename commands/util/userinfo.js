const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const moment = require("moment");
const getMember = require('../../modules/search-user.js');

module.exports = class UserInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'userinfo',
			aliases: ['profile'],
			group: 'util',
			memberName: 'userinfo',
			description: 'Displays info about the user.',
			format: '(member)'
		});
	}

async run(message, args) {
		const member = await getMember(message, args);
		if (member == null) return;
		const randomColor = "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });
		const roles =	member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id }>`)
		// Determines whether to reduce the roles array, since Discord only supports up to 1024 characters on an embed.
		var cut = false;
		var max = 0;
		var count = 0;
		for (var i = 0; i < roles.length; i++) {
			count += roles[i].length + 7;
			if (count < 950) {
				max = i;
			} else {
				cut = true;
			}
		}

		const embed = new MessageEmbed()
			.setColor(randomColor)
			.setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({ dynamic: true} ))
			.setDescription(`<@${member.user.id}>`)
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true} ))
			.addField('Status', status[member.user.presence.status], true)
			.addField('Joined at: ', moment(member.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss'), true)
			.addField('Created at: ', moment(member.user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss'), true)
			.addField(`Roles [${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `\`${roles.name}\``).length}]`,`${roles.length == 0 ? "No Roles" : cut ? member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id }>`).slice(0, max).concat(`... ${roles.length - max} more`).join(" **|** ") : member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id }>`).join(" **|** ")}`, true)
			.setTimestamp();
		return message.say(embed);
	}
};



const status = {
	online: 'Online',
	idle: 'Idle',
	dnd: 'Do Not Disturb',
	offline: 'Offline/Invisible'
}
