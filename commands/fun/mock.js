const { Command } = require('discord.js-commando');
const { MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
const path = require('path');

module.exports = class MockCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'mock',
			group: 'fun',
			memberName: 'mock',
			description: 'mOcKifY a mESsAgE.',
			format: '<message>'
		});
	}

	async run(message, args) {
		if (args.length < 1) {
			return message.say('Please provide some text to mock.');
		}
		else {
			const canvas = Canvas.createCanvas(650, 381);
			const ctx = canvas.getContext('2d');
			const mockText = args.split(' ').map(randomizeCase).join(' ');

			const background = await Canvas.loadImage(path.join(__dirname, '../../images/mock.jpg'))
			ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

			ctx.strokeStyle = '#74037b';
			ctx.strokeRect(0, 0, canvas.width, canvas.height);

			// Assign the font
			ctx.font = applyText(canvas, mockText);
			ctx.fillStyle = '#ffffff';
			ctx.textAlign = 'center';
			ctx.strokeStyle = '#000000';
			ctx.strokeText(mockText, canvas.width / 2, canvas.height / 1.1);
			ctx.fillText(mockText, canvas.width / 2, canvas.height / 1.1);

			ctx.beginPath();
			ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();

			const attachment = new MessageAttachment(canvas.toBuffer(), 'mock-image.png');


			message.say(attachment);

			message.delete();
		}
	}
}

const randomizeCase = word => word.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');

const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Base font size
	let fontSize = 75;

	do {
		ctx.font = `${fontSize -= 5}px sans-serif`;
		console.log(ctx.measureText(text).width);
	} while (ctx.measureText(text).width > canvas.width);

	return ctx.font;
};