const { Command } = require('discord.js-commando');
const getMember = require('../../modules/search-user.js');

module.exports = class ChangeNicknameCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'change-nickname',
			aliases: ['cn'],
			group: 'fun',
			memberName: 'change-nickname',
			description: 'IDK'
		});
	}

	run(message, args) {
		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
		const prevName = member.nickname || member.user.username;
		args = args.split(' ');
		let nickname = args.slice(1);
		let duration = nickname.pop().split('');
		nickname = nickname.join(' ');
		const unit = duration.pop();
		duration = duration.join('');
		switch(unit) {
			case 's':
				duration *= 1000;
				break;
			case 'm':
				duration *= 60000;
				break;
			case 'h':
				duration *= 3600000;
				break;
			case 'd':
				duration *= 86400000;
				break;
		}
		member.setNickname(nickname).catch(console.error);
		setTimeout(() => {member.setNickname(prevName).catch(console.error)}, duration);
	}
};