const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
require('dotenv').config();
let {
  playLiveStreams,
  playVideosLongerThan1Hour,
  maxQueueLength,
  AutomaticallyShuffleYouTubePlaylists,
  LeaveTimeOut,
  MaxResponseTime,
  deleteOldPlayMessage
} = require('../../options.json');
const db = require('quick.db');
const Pagination = require('discord-paginationembed');


const youtube = new Youtube(process.env.YOUTUBE_API);
// Check If Options are Valid
if (typeof playLiveStreams !== 'boolean') playLiveStreams = true;
if (typeof maxQueueLength !== 'number' || maxQueueLength < 1) {
  maxQueueLength = 1000;
}
if (typeof LeaveTimeOut !== 'number') {
  LeaveTimeOut = 90;
}
if (typeof MaxResponseTime !== 'number') {
  MaxResponseTime = 30;
}
if (typeof AutomaticallyShuffleYouTubePlaylists !== 'boolean') {
  AutomaticallyShuffleYouTubePlaylists = false;
}
if (typeof playVideosLongerThan1Hour !== 'boolean') {
  playVideosLongerThan1Hour = true;
}
if (typeof deleteOldPlayMessage !== 'boolean') {
  deleteOldPlayMessage = false;
}

// If the Options are outside of min or max then use the closest number
LeaveTimeOut = LeaveTimeOut > 600 ? 600 : LeaveTimeOut &&
  LeaveTimeOut < 2 ? 1 : LeaveTimeOut; // prettier-ignore

MaxResponseTime = MaxResponseTime > 150 ? 150 : MaxResponseTime &&
  MaxResponseTime < 5 ? 5 : MaxResponseTime; // prettier-ignore

  module.exports = class PlayCommand extends Command {
    constructor(client) {
      super(client, {
        name: 'play',
        aliases: ['play-song', 'add', 'p'],
        memberName: 'play',
        group: 'music',
        description: 'Play any song or playlist from youtube!',
        guildOnly: true,
        clientPermissions: [
          'SPEAK',
          'CONNECT',
          'SEND_MESSAGES',
          'MANAGE_MESSAGES'
        ],
        throttling: {
          usages: 2,
          duration: 5
        },
        args: [
          {
            key: 'query',
            prompt:
              ':notes: What song or playlist would you like to listen to? Add -s to shuffle a playlist',
            type: 'string',
            validate: function(query) {
              return query.length > 0 && query.length < 200;
            }
          }
        ]
      });
    }

    async run(message, { query }) {
      // Make sure that only users present in a voice channel can use 'play'
      if (!message.member.voice.channel) {
        message.reply(':no_entry: Please join a voice channel and try again!');
        return;
      }
      //Parse query to check for flags

      var splitQuery = query.split(' ');
      var shuffleFlag = splitQuery[splitQuery.length - 1] === '-s';
      var reverseFlag = splitQuery[splitQuery.length - 1] === '-r';
      var nextFlag = splitQuery[splitQuery.length - 1] === '-n';
      var jumpFlag = splitQuery[splitQuery.length - 1] === '-j';

      if (shuffleFlag || reverseFlag || nextFlag || jumpFlag) splitQuery.pop();
      query = splitQuery.join(' ');

      // Check if the query is actually a saved playlist name

      if (db.get(message.member.id) !== null) {
        const playlistsArray = db.get(message.member.id).savedPlaylists;
        const found = playlistsArray.find(playlist => playlist.name === query);

        // Found a playlist with a name matching the query and it's not empty
        if (found && playlistsArray[playlistsArray.indexOf(found)].urls.length) {
          const fields = [
            {
              name: ':arrow_forward: Playlist',
              value: '1. Play saved playlist'
            },
            {
              name: ':twisted_rightwards_arrows: Shuffle Playlist',
              value: '2. Shuffle & Play saved playlist'
            },
            {
              name: ':mag: YouTube',
              value: '3. Search on YouTube'
            },
            {
              name: ':x: Cancel',
              value: '4. Cancel'
            }
          ];

          let hasHistoryField = false;
          const index = String(Number(query) - 1);
          if (
            Number(query) &&
            typeof message.guild.musicData.queueHistory[index] !== 'undefined'
          ) {
            hasHistoryField = true;
            fields.unshift({
              name: ':arrow_backward: Previously played song',
              value: `0. Play '${message.guild.musicData.queueHistory[index].title}'`
            });
          }

          const clarificationEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle(':eyes: Clarification Please.')
            .addFields(fields)
            .setDescription(
              `You have a playlist named **${query}**, did you mean to play the playlist or search for **${query}** on YouTube?`
            )
            .setFooter('Choose by commenting a valid number.');

          const ClarificationEmbedMessage = await message.channel.send(
            clarificationEmbed
          );

          // Wait for a proper response on the clarification embed
          message.channel
            .awaitMessages(
              msg => ['0', '1', '2', '3', '4'].includes(msg.content),
              {
                max: 1,
                time: MaxResponseTime * 1000,
                errors: ['time']
              }
            )
            .then(async function onProperResponse(response) {
              response = response.first().content;
              if (ClarificationEmbedMessage)
                ClarificationEmbedMessage.delete().catch(console.error);

              switch (response) {
                case '0':
                  if (!hasHistoryField) break;
                  if (!message.guild.musicData.isPlaying) {
                    message.guild.musicData.queue.unshift(
                      message.guild.musicData.queueHistory[index]
                    );
                    playSong(message.guild.musicData.queue, message);
                    break;
                  }
                  if (nextFlag || jumpFlag) {
                    message.guild.musicData.queue.unshift(
                      message.guild.musicData.queueHistory[index]
                    );
                    if (jumpFlag && message.guild.musicData.songDispatcher) {
                      message.guild.musicData.loopSong = false;
                      message.guild.musicData.songDispatcher.end();
                    }
                  } else {
                    message.guild.musicData.queue.push(
                      message.guild.musicData.queueHistory[index]
                    );
                  }
                  message.reply(
                    `'${message.guild.musicData.queueHistory[index].title}' was added to queue!`
                  );

                  break;
                // 1: Play the saved playlist
                case '1':
                  playlistsArray[playlistsArray.indexOf(found)].urls.map(song =>
                    message.guild.musicData.queue.push(song)
                  );

                  if (message.guild.musicData.isPlaying) {
                    // Send a message indicating that the playlist was added to the queue
                    interactiveEmbed(message)
                      .addField(
                        'Added Playlist',
                        `:new: **${query}** added ${
                          playlistsArray[playlistsArray.indexOf(found)].urls
                            .length
                        } songs to the queue!`
                      )
                      .build();
                  } else {
                    message.guild.musicData.isPlaying = true;
                    playSong(message.guild.musicData.queue, message);
                  }
                  break;
                // 2: Play the shuffled saved playlist
                case '2':
                  shuffleArray(
                    playlistsArray[playlistsArray.indexOf(found)].urls
                  ).map(song => message.guild.musicData.queue.push(song));

                  if (message.guild.musicData.isPlaying) {
                    // Send a message indicating that the playlist was added to the queue
                    interactiveEmbed(message)
                      .addField(
                        'Added Playlist',
                        `:new: **${query}** added ${
                          playlistsArray[playlistsArray.indexOf(found)].urls
                            .length
                        } songs to the queue!`
                      )
                      .build();
                  } else {
                    message.guild.musicData.isPlaying = true;
                    playSong(message.guild.musicData.queue, message);
                  }
                  break;
                // 3: Search for the query on YouTube
                case '3':
                  await searchYoutube(
                    query,
                    message,
                    message.member.voice.channel
                  );
                  break;
                // 4: Cancel
                case '4':
                  break;
              }
            })
            .catch(function onResponseError() {
              if (ClarificationEmbedMessage)
                ClarificationEmbedMessage.delete().catch(console.error);
              return;
            });
          return;
        }
      }

      // check if the user wants to play a song from the history queue
      if (Number(query)) {
        const index = String(Number(query) - 1);
        // continue if there's no index matching the query on the history queue
        if (typeof message.guild.musicData.queueHistory[index] === 'undefined') {
          return;
        }
        const clarificationEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(':eyes: Clarification Please.')
          .setDescription(`Did you mean to play a song from the history queue?`)
          .addField(
            `:arrow_forward: History Queue`,
            `1. Play song number ${query}`
          )
          .addField(`:mag: YouTube`, `2. Search '${query}' on YouTube`)
          .addField(':x: Cancel', '3. Cancel')
          .setFooter('Choose by commenting a number between 1 and 3.');
        const ClarificationEmbedMessage = await message.channel.send(
          clarificationEmbed
        );

        // Wait for a proper response on the clarification embed
        message.channel
          .awaitMessages(msg => ['1', '2', '3'].includes(msg.content), {
            max: 1,
            time: MaxResponseTime * 1000,
            errors: ['time']
          })
          .then(async function onProperResponse(response) {
            response = response.first().content;
            if (ClarificationEmbedMessage)
              ClarificationEmbedMessage.delete().catch(console.error);

            switch (response) {
              // 1: Play a song from the history queue
              case '1':
                if (!message.guild.musicData.isPlaying) {
                  message.guild.musicData.queue.unshift(
                    message.guild.musicData.queueHistory[index]
                  );
                  playSong(message.guild.musicData.queue, message);
                  break;
                }
                if (nextFlag || jumpFlag) {
                  message.guild.musicData.queue.unshift(
                    message.guild.musicData.queueHistory[index]
                  );
                  if (jumpFlag && message.guild.musicData.songDispatcher) {
                    message.guild.musicData.loopSong = false;
                    message.guild.musicData.songDispatcher.end();
                  }
                } else {
                  message.guild.musicData.queue.push(
                    message.guild.musicData.queueHistory[index]
                  );
                }
                message.reply(
                  `'${message.guild.musicData.queueHistory[index].title}' was added to queue!`
                );
                break;
              // 2: Search for the query on YouTube
              case '2':
                await searchYoutube(query, message, message.member.voice.channel);
                break;
              // 3: Cancel
              case '3':
                break;
            }
          });
        return;
      }

      if (isYouTubePlaylistURL(query)) {
        const playlist = await youtube.getPlaylist(query);
        if (!playlist)
          return message.reply(
            ':x: Playlist is either private or it does not exist!'
          );

        let videosArr = await playlist.getVideos();
        if (!videosArr)
          return message.reply(
            ":x: I hit a problem when trying to fetch the playlist's videos"
          );

        if (AutomaticallyShuffleYouTubePlaylists || shuffleFlag) {
          videosArr = shuffleArray(videosArr);
        }

        if (reverseFlag) {
          videosArr = videosArr.reverse();
        }

        if (message.guild.musicData.queue.length >= maxQueueLength)
          return message.reply(
            'The queue is full, please try adding more songs later'
          );
        videosArr = videosArr.splice(
          0,
          maxQueueLength - message.guild.musicData.queue.length
        );

        //variable to know how many songs were skipped because of privacyStatus
        var skipAmount = 0;

        await videosArr.reduce(async (memo, video, key) => {
          await memo;
          // don't process private videos
          if (
            video.raw.status.privacyStatus == 'private' ||
            video.raw.status.privacyStatus == 'privacyStatusUnspecified'
          ) {
            skipAmount++;
            return;
          }

          try {
            const fetchedVideo = await video.fetch();
            if (nextFlag || jumpFlag) {
              message.guild.musicData.queue.splice(
                key - skipAmount,
                0,
                constructSongObj(
                  fetchedVideo,
                  message.member.voice.channel,
                  message.member.user
                )
              );
            } else {
              message.guild.musicData.queue.push(
                constructSongObj(
                  fetchedVideo,
                  message.member.voice.channel,
                  message.member.user
                )
              );
            }
          } catch (err) {
            return console.error(err);
          }
        }, undefined);
        if (jumpFlag && message.guild.musicData.songDispatcher) {
          message.guild.musicData.loopSong = false;
          message.guild.musicData.songDispatcher.end();
        }
        if (!message.guild.musicData.isPlaying) {
          message.guild.musicData.isPlaying = true;
          playSong(message.guild.musicData.queue, message);
          return;
        } else {
          interactiveEmbed(message)
            .addField('Added Playlist', `[${playlist.title}](${playlist.url})`)
            .build();
          return;
        }
      }

      if (isYouTubeVideoURL(query)) {
        const id = query
          .replace(/(>|<)/gi, '')
          .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)[2]
          .split(/[^0-9a-z_\-]/i)[0];

        const timestampRegex = /t=([^#&\n\r]+)/g;
        let timestamp = timestampRegex.exec(query);
        if (!timestamp) {
          timestamp = 0;
        } else {
          timestamp = timestamp[1];
          if (timestamp.endsWith('s')) {
            timestamp = timestamp.substring(0, timestamp.indexOf('s'));
          }
          if (!Number(timestamp)) timestamp = 0;
        }
        timestamp = Number(timestamp);

        const video = await youtube.getVideoByID(id).catch(function() {
          message.reply(
            ':x: There was a problem getting the video you provided!'
          );
        });
        if (!video) return;

        if (
          video.raw.snippet.liveBroadcastContent === 'live' &&
          !playLiveStreams
        ) {
          message.reply(
            'Live streams are disabled in this server! Contact the owner'
          );
          return;
        }

        if (video.duration.hours !== 0 && !playVideosLongerThan1Hour) {
          message.reply(
            'Videos longer than 1 hour are disabled in this server! Contact the owner'
          );
          return;
        }

        if (message.guild.musicData.queue.length > maxQueueLength) {
          message.reply(
            `The queue hit its limit of ${maxQueueLength}, please wait a bit before attempting to play more songs`
          );
          return;
        }
        if (nextFlag || jumpFlag) {
          flagLogic(message, video, jumpFlag);
        } else {
          message.guild.musicData.queue.push(
            constructSongObj(
              video,
              message.member.voice.channel,
              message.member.user,
              timestamp
            )
          );
        }

        if (
          !message.guild.musicData.isPlaying ||
          typeof message.guild.musicData.isPlaying == 'undefined'
        ) {
          message.guild.musicData.isPlaying = true;
          playSong(message.guild.musicData.queue, message);
          return;
        }

        interactiveEmbed(message)
          .addField('Added to Queue', `:new: [${video.title}](${video.url})`)
          .build();
        return;
      }

      // If user provided a song/video name
      await searchYoutube(
        query,
        message,
        message.member.voice.channel,
        nextFlag,
        jumpFlag
      );
    }
  };

  var playSong = (queue, message) => {
    if (queue[0].voiceChannel == undefined) {
      // happens when loading a saved playlist
      queue[0].voiceChannel = message.member.voice.channel;
    }
    if (message.guild.me.voice.channel !== null) {
      if (message.guild.me.voice.channel.id !== queue[0].voiceChannel.id) {
        queue[0].voiceChannel = message.guild.me.voice.channel;
      }
    }
    queue[0].voiceChannel
      .join()
      .then(function(connection) {
        const dispatcher = connection
          .play(
            ytdl(queue[0].url, {
              filter: 'audio',
              quality: 'highestaudio',
              highWaterMark: 1 << 25
            }),
            {
              seek: queue[0].timestamp
            }
          )
          .on('start', function() {
            message.guild.musicData.songDispatcher = dispatcher;
            // Volume Settings
            if (!db.get(`${message.guild.id}.serverSettings.volume`)) {
              dispatcher.setVolume(message.guild.musicData.volume);
            } else {
              dispatcher.setVolume(
                db.get(`${message.guild.id}.serverSettings.volume`)
              );
            }

            message.guild.musicData.isPreviousTrack = false;

            message.guild.musicData.nowPlaying = queue[0];
            queue.shift();
            // Main Message
            message.say("**Playing** :notes: `" + message.guild.musicData.nowPlaying.title + "` - Now!")
          })
          .on('finish', function() {
            // Save the volume when the song ends
            db.set(
              `${message.member.guild.id}.serverSettings.volume`,
              message.guild.musicData.songDispatcher.volume
            );

            if (!message.guild.musicData.isPreviousTrack) {
              message.guild.musicData.queueHistory.unshift(
                message.guild.musicData.nowPlaying
              );
            }

            if (message.guild.musicData.queueHistory.length > 1000) {
              // limit the history queue at 1000 elements
              message.guild.musicData.queueHistory.pop();
            }

            queue = message.guild.musicData.queue;
            if (message.guild.musicData.loopSong) {
              queue.unshift(message.guild.musicData.nowPlaying);
            } else if (message.guild.musicData.loopQueue) {
              queue.push(message.guild.musicData.nowPlaying);
            }
            if (queue.length >= 1) {
              playSong(queue, message);
              return;
            } else {
              message.guild.musicData.isPlaying = false;
              message.guild.musicData.nowPlaying = null;
              message.guild.musicData.songDispatcher = null;
              if (
                message.guild.me.voice.channel &&
                message.guild.musicData.skipTimer
              ) {
                message.guild.me.voice.channel.leave();
                message.guild.musicData.skipTimer = false;
                return;
              }
              if (message.guild.me.voice.channel) {
                if (LeaveTimeOut > 0) {
                  setTimeout(function onTimeOut() {
                    if (
                      message.guild.musicData.isPlaying == false &&
                      message.guild.me.voice.channel
                    ) {
                      message.guild.me.voice.channel.leave();
                      message.channel.send(
                        ':zzz: Left channel due to inactivity.'
                      );
                    }
                  }, LeaveTimeOut * 1000);
                }
              }
            }
          })
          .on('error', function(e) {
            message.reply(':x: Cannot play song!');
            console.error(e);
            if (queue.length > 1) {
              queue.shift();
              playSong(queue, message);
              return;
            }
            message.guild.resetMusicDataOnError();
            if (message.guild.me.voice.channel) {
              message.guild.me.voice.channel.leave();
            }
            return;
          });
      })
      .catch(function(error) {
        message.reply(':no_entry: I have no permission to join your channel!');
        console.error(error);
        message.guild.resetMusicDataOnError();
        if (message.guild.me.voice.channel) {
          message.guild.me.voice.channel.leave();
        }
        return;
      });
  };

  var playbackBar = data => {
    if (data.nowPlaying.duration === 'Live Stream') return '';
    const formatTime = compose(timeString, millisecondsToTimeObj);

    const passedTimeInMS = data.songDispatcher.streamTime;
    const songLengthFormatted = timeString(data.nowPlaying.rawDuration);
    const songLengthInMS = rawDurationToMilliseconds(data.nowPlaying.rawDuration);

    const playback = Array(11).fill('▬');
    playback[Math.floor((passedTimeInMS / songLengthInMS) * 11)] =
      ':musical_note:';

    return `${formatTime(passedTimeInMS)} ${playback.join(
      ''
    )} ${songLengthFormatted}`;
  };

  var searchYoutube = async (
    query,
    message,
    voiceChannel,
    nextFlag,
    jumpFlag
  ) => {
    message.say(":musical_note: **Searching** :mag_right: `" + query + "`");
    const videos = await youtube.searchVideos(query, 5).catch(async function() {
      await message.reply(
        ':x: There was a problem searching the video you requested!'
      );
      return;
    });
    if (!videos) {
      message.reply(
        `:x: I had some trouble finding what you were looking for, please try again or be more specific.`
      );
      return;
    }
    if (videos.length < 5) {
      message.reply(
        `:x: I had some trouble finding what you were looking for, please try again or be more specific.`
      );
      return;
    }
    const vidNameArr = [];
    for (let i = 0; i < videos.length; i++) {
      vidNameArr.push(
        `${i + 1}: [${videos[i].title
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&apos;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")}](${videos[i].shortURL})`
      );
    }
    vidNameArr.push('cancel');
    const embed = createResultsEmbed(vidNameArr, message);
        youtube
          .getVideoByID(videos[0].id)
          .then(function(video) {
            if (
              video.raw.snippet.liveBroadcastContent === 'live' &&
              !playLiveStreams
            ) {
              message.reply(
                'Live streams are disabled in this server! Contact the owner'
              );
              return;
            }

            if (video.duration.hours !== 0 && !playVideosLongerThan1Hour) {
              message.reply(
                'Videos longer than 1 hour are disabled in this server! Contact the owner'
              );
              return;
            }

            if (message.guild.musicData.queue.length > maxQueueLength) {
              message.say(
                `The queue hit its limit of ${maxQueueLength}, please wait a bit before attempting to add more songs`
              );
              return;
            }
            if (nextFlag || jumpFlag) {
              message.guild.musicData.queue.unshift(
                constructSongObj(video, voiceChannel, message.member.user)
              );
              if (jumpFlag && message.guild.musicData.songDispatcher) {
                message.guild.musicData.loopSong = false;
                message.guild.musicData.songDispatcher.end();
              }
            } else {
              message.guild.musicData.queue.push(
                constructSongObj(video, voiceChannel, message.member.user)
              );
            }
            if (message.guild.musicData.isPlaying == false) {
              message.guild.musicData.isPlaying = true;
              playSong(message.guild.musicData.queue, message);
            } else if (message.guild.musicData.isPlaying == true) {
              // Added song to queue message (search)
              interactiveEmbed(message)
                .addField(
                  'Added to Queue',
                  `:new: [${video.title}](${video.url})`
                )
                .build();
              return;
            }
      })
  };

  let interactiveEmbed = message => {
    // Builds Member ID array for buttons
    //const rawMembers = Object.fromEntries(message.member.voice.channel.members);
    const rawMembers = Object.fromEntries(
      message.member.voice.channel
        ? message.member.voice.channel.members
        : message.guild.musicData.nowPlaying.voiceChannel.members
    );
    const memberArray = [Object.keys(rawMembers)];

    const songTitle = `[${message.guild.musicData.nowPlaying.title}](${message.guild.musicData.nowPlaying.url})\n`;

    const baseEmbed = new MessageEmbed()
      .setThumbnail(message.guild.musicData.nowPlaying.thumbnail)
      .setColor('#ff0000')
      .addField(
        'Song Duration',
        ':stopwatch: ' + message.guild.musicData.nowPlaying.duration,
        true
      )
      .setFooter(
        `Requested by ${message.guild.musicData.nowPlaying.memberDisplayName}`,
        message.guild.musicData.nowPlaying.memberAvatar
      );

    const videoEmbed = new Pagination.Embeds()
      .setArray([baseEmbed])
      .setAuthorizedUsers(memberArray[0])
      .setDisabledNavigationEmojis(['all'])
      .setChannel(message.channel)
      .setDeleteOnTimeout(deleteOldPlayMessage)
      .setTimeout(buttonTimer(message))
      .setTitle(embedTitle(message))
      .setDescription(songTitle + playbackBar(message.guild.musicData));

    // Previous Track Button
    if (message.guild.musicData.queueHistory.length > 0) {
      videoEmbed.addFunctionEmoji('⏮️', function(_, instance) {
        if (!message.guild.musicData.songDispatcher) return;

        instance
          .setDescription(songTitle + playbackBar(message.guild.musicData))
          .setTitle(':track_previous: Previous Track')
          .setTimeout(100);
        message.guild.musicData.queue.unshift(
          message.guild.musicData.queueHistory[0],
          message.guild.musicData.nowPlaying
        );
        message.guild.musicData.queueHistory.shift();
        message.guild.musicData.isPreviousTrack = true;

        if (message.guild.musicData.songDispatcher.paused)
          message.guild.musicData.songDispatcher.resume();
        message.guild.musicData.loopSong = false;
        setTimeout(() => {
          message.guild.musicData.songDispatcher.end();
        }, 100);
      });
    }
    if (message.guild.musicData.queue.length) {
      const songOrSongs =
        message.guild.musicData.queue.length > 1 ? ' Songs' : ' Song'; // eslint-disable-line
      videoEmbed
        .addField(
          'Queue',
          ':notes: ' + message.guild.musicData.queue.length + songOrSongs,
          true
        )
        .addField(
          'Next Song',
          `⏭️ [${message.guild.musicData.queue[0].title}](${message.guild.musicData.queue[0].url})`
        );
    }
    return videoEmbed;

    function buttonTimer(message) {
      const totalDurationInMS = rawDurationToMilliseconds(
        message.guild.musicData.nowPlaying.rawDuration
          ? message.guild.musicData.nowPlaying.rawDuration
          : message.guild.musicData.songDispatcher.nowPlaying.rawDuration
      );

      const streamTime = message.guild.musicData.streamTime
        ? message.guild.musicData.streamTime
        : message.guild.musicData.songDispatcher.streamTime;
      let timer = totalDurationInMS - streamTime;
      // Allow controls to stay for at least 30 seconds
      if (timer < 30000) timer = 30000;

      // Uncomment below for 5 min maximum timer limit
      // if (timer > 300000) timer = 300000;

      // Live Stream timer
      if (totalDurationInMS == 0) timer = 300000;

      return timer;
    }

    function embedTitle(message) {
      let embedTitle = ':musical_note: Now Playing';
      if (message.guild.musicData.loopQueue)
        embedTitle += ' :repeat: Queue on repeat';
      if (message.guild.musicData.loopSong)
        embedTitle += ' :repeat_one: on repeat';
      if (message.guild.musicData.songDispatcher.paused)
        embedTitle = ':pause_button: Paused';

      return embedTitle;
    }
  };

  // side effects function
  var flagLogic = (message, video, jumpFlag) => {
    message.guild.musicData.queue.splice(
      0,
      0,
      constructSongObj(video, message.member.voice.channel, message.member.user)
    );
    if (jumpFlag && message.guild.musicData.songDispatcher) {
      message.guild.musicData.loopSong = false;
      message.guild.musicData.songDispatcher.end();
    }
  };

  /********************************** Helper Functions *****************************/

  var compose = (f, g) => x => f(g(x));

  var isYouTubeVideoURL = arg =>
    arg.match(
      /^(http(s)?:\/\/)?(m.)?((w){3}.)?(music.)?youtu(be|.be)?(\.com)?\/.+/
    );

  var isYouTubePlaylistURL = arg =>
    arg.match(
      /^https?:\/\/(music.)?(www.youtube.com|youtube.com)\/playlist(.*)$/
    );

  var shuffleArray = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // timeString = timeObj => 'HH:MM:SS' // if HH is missing > MM:SS
  var timeString = timeObj => {
    if (timeObj[1] === true) return timeObj[0];
    return `${timeObj.hours ? timeObj.hours + ':' : ''}${
      timeObj.minutes ? timeObj.minutes : '00'
    }:${
      timeObj.seconds < 10
        ? '0' + timeObj.seconds
        : timeObj.seconds
        ? timeObj.seconds
        : '00'
    }`;
  };

  var millisecondsToTimeObj = ms => ({
    seconds: Math.floor((ms / 1000) % 60),
    minutes: Math.floor((ms / (1000 * 60)) % 60),
    hours: Math.floor((ms / (1000 * 60 * 60)) % 24)
  });

  var rawDurationToMilliseconds = obj =>
    obj.hours * 3600000 + obj.minutes * 60000 + obj.seconds * 1000;


  var constructSongObj = (video, voiceChannel, user, timestamp) => {
    let duration = timeString(video.duration);
    if (duration === '00:00') duration = 'Live Stream';
    // checks if the user searched for a song using a Spotify URL
    let url =
      video.duration[1] == true
        ? video.url
        : `https://www.youtube.com/watch?v=${video.raw.id}`;
    return {
      url,
      title: video.title,
      rawDuration: video.duration,
      duration,
      timestamp,
      thumbnail: video.thumbnails.high.url,
      voiceChannel,
      memberDisplayName: user.username,
      memberAvatar: user.displayAvatarURL({ dynamic : true })
    };
  };

  var createResultsEmbed = (namesArray, message) =>
    new MessageEmbed()
      .setColor('#ff0000')
      .setAuthor(message.author.username)
      .setDescription('`1. `' + namesArray[0] + '\n' +
                      '`2. `' + namesArray[1] + '\n' +
                      '`3. `' + namesArray[2] + '\n' +
                      '`4. `' + namesArray[3] + '\n' +
                      '`5. `' + namesArray[4])
      .setFooter('**Type a number to make a choice. Type `cancel` to exit**');

  module.exports.searchYoutube = searchYoutube;
  module.exports.createResponse = interactiveEmbed;
