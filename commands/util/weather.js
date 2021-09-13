const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = class WeatherCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'weather',
			group: 'util',
			memberName: 'weather',
			description: 'Know the weather!(PH only)',
			format: '<city>'
		});
	}

	run(message, args) {
		if (args.length < 1) return message.say('Please provide a location.');
		const city = args.split(' ').join('%20');
		const randomColor = "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });

		fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city},ph&units=metric&appid=${process.env.WEATHER_API}`)
			.then(response => response.json())
			.then(json => {
				let embed;

		        const weathermoji = {
		          "Clouds": "⛅️",
		          "Rain": "☔️",
		          "Haze": "🌫",
		          "Thunderstorm": "⛈",
		          "Sunny": "☀️",
		          "Mist": "🌫",
		          "Clear": "☀️"
		        }

				if (json.cod === '404') {
					embed = new MessageEmbed()
						.setTitle(`⚠️ Error`)
						.setColor(randomColor)
						.setDescription(`This city does not exist or there is no information available.`)
						.setTimestamp();
				}
				else {
					const currentWeather = json.weather[0].main;
					embed = new MessageEmbed()
						.setTitle(`${json.name}, ${json.sys.country}`)
						.setColor(randomColor)
						.setThumbnail(message.guild.iconURL())
						.addField(`${weathermoji[currentWeather]} Forecast:`, `${currentWeather}, ${json.weather[0].description}`)
						.addField(`🌡️ Current:`, `${json.main.temp} °C`, true)
						.addField(`🌡️ Feels Like:`, `${json.main.feels_like} °C`, true)
						//.addField('\u200B', '\u200B')
						.addField(`🌬️ Wind:`, `${json.wind.speed} km/h`, true)
						.addField(`🧭 Direction:`, `${json.wind.deg}°`, true)
						.addField(`💧 Humidity`, `${json.main.humidity}%`, true)
						.setTimestamp();
				}

				message.say(embed);
			});
	}
}