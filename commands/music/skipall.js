const { Command } = require('discord.js-commando');

module.exports = class SkipAllCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skipall',
      aliases: ['skip-all', 'stop'],
      memberName: 'skipall',
      group: 'music',
      description: 'Skip all songs in queue!',
      guildOnly: true
    });
  }

  run(message) {
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
    if (!message.guild.musicData.queue) {
      message.say(':x: There are no songs in queue!');
      return;
    }
    message.guild.musicData.queue.length = 0; // clear queue
    message.guild.musicData.loopSong = false;
    message.guild.musicData.loopQueue = false;
    message.guild.musicData.songDispatcher.end();
    return;
  }
};
