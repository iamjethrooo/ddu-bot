const { MessageEmbed } = require('discord.js')

const search = async(message, args) => {
	const users = await message.guild.members.cache.filter(u => u.user.username.toLowerCase() == args.toLowerCase());

	if (users.size > 1) {
		let i = 1;
		let choices = [];
		const embed = new MessageEmbed()
			.setAuthor('Multiple results found. Please pick one.')
			.setDescription('')
			.setTimestamp();
		users.forEach(user => {
			embed.setDescription(`${embed.description}\n\`${i}. ${user.user.username}#${user.user.discriminator}\``)
			choices[i] = user.id;
			i++;
		});
		const filter = response => response.author.id === message.author.id || choices.includes(parseInt(response));
		let id;
		await message.say(embed).then(async () => {
			await message.channel.awaitMessages(filter, { max: 1, time: 5000 })
				.then(collected => {
					let number = parseInt(collected.first().content);
					id = choices[number];
				})
				.catch(collected => {
					console.error;
					return 'Error';
				});
		});
		return id;
	} else if (users.size < 1){
		message.say('User does not exist!');
		return null;
	} else {
		return users.first().id;
	}
}

const getMember = async (message, args) => args.length > 0 ? message.mentions.members.first() || message.guild.members.cache.get(args) || message.guild.members.cache.get(await search(message, args)) : message.member || message.author;

module.exports = getMember;
