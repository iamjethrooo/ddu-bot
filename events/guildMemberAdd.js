const index = require('../index.js');
const client = index.client;
const { MessageEmbed } = require("discord.js");

module.exports = {
	run: async member => {
    // If new member is a bot, ignore
    if (member.user.bot) return;

    const cachedInvites = client.invites.get(member.guild.id);

    const newInvites = await member.guild.fetchInvites();
    client.invites.set(member.guild.id, newInvites);

    const usedInvite = newInvites.find(invite => cachedInvites.get(invite.code).uses < invite.uses);

    const { MessageEmbed } = require("discord.js");

    const logChannel = member.guild.channels.cache.find(channel => channel.name === "logs");
    if (!logChannel) return;

    const { code, uses, inviter } = usedInvite;

    const embed = new MessageEmbed()
    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL())
		.setTitle('Member joined')
    .addField("Information", `<@${member.user.id}> has been invited by <@${inviter.id}>`)
		.addField("Invite Code", `${code}, ${uses} use${uses > 1 ? "s" : ""}`)
		.setFooter(`ID: ${member.user.id}`)
		.setTimestamp()
    .setColor("GREEN");

    logChannel.send(embed);
	}
}
