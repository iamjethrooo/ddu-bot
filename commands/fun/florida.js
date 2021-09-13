const { Command } = require('discord.js-commando');
const rp = require('request-promise');
const moment = require('moment');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');

module.exports = class FloridaManCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'florida',
			aliases: ['floridaman'],
			group: 'fun',
			memberName: 'florida',
			description: 'Generate a Florida Man headline!',
      format: '(date)',
			throttling: {
				usages: 1,
				duration: 6,
			},
		});
	}

	run(message, args) {
  	let url = 'https://floridamanbirthdaychallenge.com/floridaman/';
  	args = args.toLowerCase();
  	if (args.length > 0) {
  		console.log(args);
  		if (checkDate(args, 'MMMM DD') || checkDate(args, 'MMM DD')) {
  			args = moment(args).format('MMMM-DD');
  		}
  		else if (checkDate(args, 'MMM D') || checkDate(args, 'MMMM D')) {
  			args = moment(args).format('MMMM-D');
  		}
  		else if (args == 'now' || args == 'today') {
  			args = moment().format('MMMM-DD');
  		}
  		else {
  			return message.say('Invalid date!');
  		}
  	}
  	else {
  		args = moment().format('MMMM-DD');
  	}

  	url += args.toLowerCase();
  	console.log(url);
  	rp(url)
  		.then(function(html) {
  			const $ = cheerio.load(html);
  			let title = $('title', html).text().slice(args.length + 1);
  			title = title.substr(0, title.length - 13);
  			const imageUrl = $('img.attachment-twentyseventeen-featured-image').attr('src');
  			imageUrl.split(/ +/);
  			const embed = new MessageEmbed()
  				.setColor('#D2691E')
  				.setTitle(`${args} Florida News`)
  				.setDescription(title)
  				.setURL(imageUrl)
  				.setThumbnail(imageUrl)
  				.setFooter(`Requested by ${message.author.username}#${message.author.discriminator}`);
  			return message.say(embed);
  		})
  		.catch(err => {
  			return message.say('There aren\'t any news for this date! :(');
  		});
	}
};

function checkDate(date, dateFormat) {
	return moment(date, dateFormat, true).isValid();
}