const { Command } = require('discord.js-commando');

module.exports = class RemoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      memberName: 'remove',
      aliases: ['rm'],
      group: 'music',
      description: 'Remove a specific song from queue!',
      guildOnly: true,
      args: [
        {
          key: 'songNumber',
          prompt:
            ':wastebasket: What song number do you want to remove from queue?',
          type: 'integer'
        }
      ]
    });
  }
  run(message, { songNumber }) {
    if (songNumber < 1 || songNumber > message.guild.musicData.queue.length) {
      message.say(':x: Please enter a valid song number!');
      return;
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.say(':no_entry: Please join a voice channel and try again!');
      return;
    }

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      message.say(':x: There is no song playing right now!');
      return;
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.say(
        `:no_entry: You must be in the same voice channel as the bot in order to use that!`
      );
      return;
    }

    message.guild.musicData.queue.splice(songNumber - 1, 1);
    message.say(
      `:wastebasket: Removed song number ${songNumber} from queue!`
    );
  }
};
