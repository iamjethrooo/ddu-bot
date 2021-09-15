const index = require('../index.js');
const client = index.client;

module.exports = {
  run: async (___, newState) => {
    if (
      newState.member.user.bot &&
      !newState.channelID &&
      newState.guild.musicData.songDispatcher &&
      newState.member.user.id == client.user.id
    ) {
      newState.guild.musicData.queue.length = 0;
      newState.guild.musicData.songDispatcher.end();
      return;
    }
    if (
      newState.member.user.bot &&
      newState.channelID &&
      newState.member.user.id == client.user.id &&
      !newState.selfDeaf
    ) {
      newState.setSelfDeaf(true);
    }
  }
}
