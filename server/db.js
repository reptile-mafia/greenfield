/*
      THE DATABASE SPIDER

               (
                )
               (
        /\  .-"""-.  /\
       //\\/  ,,,  \//\\
       |/\| ,;;;;;, |/\|
       //\\\;-"""-;///\\
      //  \/   .   \/  \\
     (| ,-_| \ | / |_-, |)
       //`__\.-.-./__`\\
      // /.-(() ())-.\ \\
     (\ |)   '---'   (| /)
      ` (|           |) `
        \)           (/

          HSK HSK HSK
        GIMME THE DATAZ

Using PostgreSQL.  Minimal installation instructions:

# Using Homebrew from terminal:

  -brew update
  -brew install postgresql
  -brew services start postgres
  -createdb greenfield_vplayer

# Not using Homebrew:

  -install Homebrew
  -see above

# Don't want to use Homebrew

  -good luck with that

Some background URLs for the default channel:
  Kill the PacMan    : https://i.imgur.com/fa7mUp8.jpg
  Portal             : https://i.imgur.com/gx9XCkA.jpg
  Circuits(current)  : https://i.imgur.com/PmqssGZ.jpg

*/

const _ = require('underscore');
const config = require('../knexfile');

const env = process.env.NODE_ENV || 'development';
const knex = require('knex')(config[env]);


//knex.migrate.latest([config]);
// knex.migrate.latest([config]);
/*
  Welcome to
   ___  _ _  _ _   _ _ _  _  ___  _ _   ___  ___  ___  __ __  _  ___  ___  ___  _
  | __>| | || \ | | | | || ||_ _|| | | | . \| . \| . ||  \  \| |/ __>| __>/ __>| |
  | _> | ' ||   | | | | || | | | |   | |  _/|   /| | ||     || |\__ \| _> \__ \|_/
  |_|  `___'|_\_| |__/_/ |_| |_| |_|_| |_|  |_\_\`___'|_|_|_||_|<___/|___><___/<_>

*/

/*
  ***********************************************************************

  Find/Add user for login/signup

  ***********************************************************************
*/

knex.findUser = (username, callback) =>{
  return knex('users').where('username', username)
  .then(user => {
    if(user.length === 0){
      return null;
    }
    return user[0];
  })
};

knex.addUser = (username, hashPw) =>{
  return knex('users').insert({username: username, password:hashPw}).returning('*');
};

/*
  ***********************************************************************

  Returns an array of all channel info

  ***********************************************************************
*/

knex.getChannelInfo = () =>
  knex('channels')
  .then(channels => {
    return channels;
  });

/*
  ***********************************************************************

  Returns an array of all the video objects for a particular channel

  ***********************************************************************
*/

knex.getVideosByChannel = (channelId) =>
  knex('videos').where('channel_id', channelId)
  .then(videos => {
    
    const videosArray = videos;
    videos.forEach((video, index) => {
      videosArray[index].time_based_likes = [];
    });
    return videosArray;
  });

/*
  ***********************************************************************

  Returns an array of user id's that have liked a particular time-based
  like.

  ***********************************************************************
*/

knex.getUserLikesArray = (likeId) =>
  knex.select('user_id').from('likes_by_user').where('likes_id', likeId)
  .then(userLikes => userLikes.map(element => element.user_id));

/*
  ***********************************************************************

  Returns an array of all time-based likes objects for all channels.

  ***********************************************************************
*/

knex.getAllLikes = () => {
  let likesArray = [];

  return knex('likes')
  .then(likes => {
    likesArray = likes;
    return Promise.all(likesArray.map(like => knex.getUserLikesArray(like.id)));
  })
  .then(userIds => {
    const tempArray = likesArray;
    tempArray.forEach((like, index) => {
      likesArray[index].users = userIds[index];
    });
    return likesArray;
  });
};

/*
  ***********************************************************************

  Returns an array of all time-based likes objects for a particular
  channel.

  ***********************************************************************
*/

knex.getLikesByChannel = (channelId) => {
  let likesArray = [];

  return knex('likes').where('channel_id', channelId)
  .then((likes) => {
    likesArray = likes;
    return Promise.all(likes.map(like => knex.getUserLikesArray(like.id)));
  })
  .then(userIds => {
    const tempArray = likesArray;
    tempArray.forEach((like, index) => {
      likesArray[index].users = userIds[index];
    });
    return likesArray;
  });
};

/*
  ***********************************************************************

  Return a channel object for the default channel.  All video objects are
  obtained from the database, shuffled, and the top nine are placed in
  the 'videos' array of the channel object.

  ***********************************************************************
*/

knex.getDefaultChannel = () => {
  const channelResObj = {
    id: 0,
    name: 'default',
    background: 'http://i.imgur.com/WkrPGRb.jpg',
  };

  let likesArray = [];
  let videosArray = [];

  return knex.getAllLikes()
  .then(likes => {
    likesArray = likes;
    return knex('videos');
  })
  .then(videos => {
    videosArray = videos;
    videos.forEach((video, index) => {
      videosArray[index].time_based_likes = []
        .concat(likesArray.filter(like => like.video_id === video.id));
    });
    channelResObj.videos = _.shuffle(videosArray).slice(0, 9);
    return channelResObj;
  });
};

/*
  ***********************************************************************

  Returns a channel object for a specified channel.

  ***********************************************************************
*/

knex.getChannelById = (channelId) => {
  let channelResObj = {};
  let likesArray = [];
  let videosArray = [];

  // Build channel object by channel id
  return knex.getLikesByChannel(channelId)
  .then(likes => {

    likesArray = likes;
    return knex.getVideosByChannel(channelId);
  })
  .then(videos => {
    videosArray = videos;
    videos.forEach((video, index) => {
      videosArray[index].time_based_likes = video.time_based_likes
      .concat(likesArray.filter(e => e.video_id === video.id));
    });
    return knex('channels').where('id', channelId);
  })
  .then(channel => {
    channelResObj = channel[0];
    channelResObj.videos = videosArray;
    return channelResObj;
  });
};

/*
  ***********************************************************************

  Adds an array of videos returned by the YouTube search performed by the
  server to the database. Returns an array of video objects for addition
  to the currently playing channel.

  ***********************************************************************
*/

//LOOK AT THIS
knex.addVideos = (videosArray, channelId) => {
  let successMessage = '';
  let videos = [];
 
  return Promise.all(

    videosArray.map(video => knex('videos').where('url', video.id.videoId))
  )
  .then(videosInDB => {
    videos = videosArray
      .filter((video, index) => !videosInDB[index].length)
      .map(video => ({ url: video.id.videoId, channel_id: channelId }));
    if (!videos.length) {
      const errMessage = 'No videos added! Refine search parameters';
      throw errMessage;
    } else {
      successMessage = (`${videos.length} ${videos.length === 1 ? 'video' : 'videos'} added!`);
      return Promise.all(
        videos.map(video => knex('videos').insert(video))
      );
    }
  })
  .then(() => {
    console.log(successMessage);
    return Promise.all(videos.map(video => knex('videos').where('url', video.url)));
  })
  .then(array => array.map(element => element[0]))
  .catch(error => error);
};

/*
  ***********************************************************************

  Adds a new time-based like to the database and returns the new time-
  based like object for addition to the current video.

  ***********************************************************************
*/

knex.createLike = (like, userId) => {
  const likeObj = {
    start_time: like.start_time,
    stop_time: like.stop_time,
    video_id: like.video_id,
    channel_id: like.channel_id,
  };

  return knex('likes').where(likeObj)
  .then(data => {
    if (data.length) {
      likeObj.id = data[0].id;
      throw knex.getUserLikesArray(data[0].id);
    } else {
      return likeObj;
    }
  })
  .then(newLike => knex('likes').insert(newLike))
  .then(() => knex.select('id').from('likes').where(likeObj))
  .then(id => {
    likeObj.id = id[0].id;
    likeObj.users = [userId];
    return knex('likes_by_user').insert({ user_id: userId, likes_id: id[0].id });
  })
  .then(() => likeObj)
  .catch((userIdArray) =>
    userIdArray.then(idArray => {
      likeObj.users = idArray;
      return likeObj;
    })
  );
};

/*
  ***********************************************************************

  Updates the likes_by_user database with a pairing of the current time-
  based like id and the current user id. Returns the id of the updated
  time-based like and an updated array of user ids that have liked it.

  ***********************************************************************
*/

knex.updateLike = (obj, userId) =>{
  knex('likes_by_user').where(obj)
  .then(queryData => {
    if (queryData.length) {
      throw knex.getUserLikesArray(queryData[0].likes_id);
    } else {
      return knex('likes_by_user').insert(obj);
    }
  })
  .then(() => knex.getUserLikesArray(obj.likes_id))
  .then(userIdArray => ({ id: obj.likes_id, users: userIdArray }))
  .catch(userIdArray =>
    userIdArray.then(idArray => ({ id: obj.likes_id, users: idArray })));
}
/*
  ***********************************************************************

  Initializes the database with dummy information

  ***********************************************************************
*/

knex.initDB = () => Promise.all([
  knex('channels').insert([
    { id: 1, name: 'Kittens', background: 'https://static.pexels.com/photos/9056/pexels-photo.jpg' },
    { id: 2, name: 'Cats Being Jerks', background: 'https://texasagriculture.gov/portals/0/images/prodagg/fire.jpg' },
    { id: 3, name: 'Neko', background: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/The_Great_Wave_off_Kanagawa.jpg' },

  ]),
  knex('users').insert([
    { username: 'CDE'   , password: '$2a$08$Nxke/Uo4lyszdj8HOQyB0eYL/XRMx2MbgvPELLBiEBd9BHEfplLde'},
    { username: 'CHI'   , password: '$2a$08$RdRSvizmfF9BH1VnCWh.yeIOYryIcFKbPVWXp2JyFv2Z9OFmdf71O'},
  ]),
  knex('videos').insert([


    { url: 'mmjlMgDSYFo', channel_id: 1 },
    { url: 'OtRRUEs3o0c', channel_id: 1 },
    { url: 'LI7-Cu-9wWM', channel_id: 1 },
    { url: '1iPMazni3FA', channel_id: 2 },  // fail
    { url: 'FAiKuOL8Os8', channel_id: 2 },
    { url: 'ny5vGbTfB8c', channel_id: 2 },
    { url: 'TdPuwnMv3gA', channel_id: 3 },  // 3 is japanese cat
    { url: 'C9O28ne6bG8', channel_id: 3 },
    { url: 'JTDdHYUb6zU', channel_id: 3 },

  ]),
  knex('likes').insert([
    { start_time: 23, stop_time: 48, video_id: 1, channel_id: 1 },
    { start_time: 34, stop_time: 42, video_id: 1, channel_id: 1 },
    { start_time: 38, stop_time: 42, video_id: 2, channel_id: 1 },
    { start_time: 10, stop_time: 50, video_id: 3, channel_id: 1 },
    { start_time: 29, stop_time: 42, video_id: 4, channel_id: 2 },
    { start_time: 30, stop_time: 28, video_id: 4, channel_id: 2 },
    { start_time: 47, stop_time: 57, video_id: 5, channel_id: 2 },
    { start_time: 11, stop_time: 34, video_id: 6, channel_id: 2 },
    { start_time: 20, stop_time: 38, video_id: 7, channel_id: 3 },
    { start_time: 52, stop_time: 80, video_id: 7, channel_id: 3 },
    { start_time: 70, stop_time: 94, video_id: 7, channel_id: 3 },
    { start_time: 25, stop_time: 46, video_id: 8, channel_id: 3 },
    { start_time: 47, stop_time: 64, video_id: 9, channel_id: 3 },
  ]),
  knex('likes_by_user').insert([
    { user_id: 1, likes_id: 1 },
    { user_id: 2, likes_id: 1 },
    { user_id: 4, likes_id: 1 },
    { user_id: 2, likes_id: 2 },
    { user_id: 3, likes_id: 2 },
    { user_id: 4, likes_id: 2 },
    { user_id: 1, likes_id: 3 },
    { user_id: 3, likes_id: 3 },
    { user_id: 4, likes_id: 3 },
    { user_id: 2, likes_id: 4 },
    { user_id: 5, likes_id: 4 },
    { user_id: 1, likes_id: 5 },
    { user_id: 3, likes_id: 5 },
    { user_id: 4, likes_id: 5 },
    { user_id: 2, likes_id: 6 },
    { user_id: 4, likes_id: 6 },
    { user_id: 5, likes_id: 6 },
    { user_id: 1, likes_id: 7 },
    { user_id: 2, likes_id: 7 },
    { user_id: 2, likes_id: 8 },
    { user_id: 4, likes_id: 8 },
    { user_id: 5, likes_id: 8 },
    { user_id: 1, likes_id: 9 },
    { user_id: 2, likes_id: 9 },
    { user_id: 2, likes_id: 10 },
    { user_id: 3, likes_id: 10 },
    { user_id: 4, likes_id: 10 },
    { user_id: 2, likes_id: 11 },
    { user_id: 5, likes_id: 11 },
    { user_id: 2, likes_id: 12 },
    { user_id: 3, likes_id: 12 },
    { user_id: 4, likes_id: 12 },
    { user_id: 5, likes_id: 12 },
    { user_id: 2, likes_id: 13 },
    { user_id: 3, likes_id: 13 },
    { user_id: 4, likes_id: 13 },
  ]),
]);

/*
  ***********************************************************************

  Clears all information from the database and resets id counters to 0.

  ***********************************************************************
*/

knex.clear = () => Promise.all([
  knex('channels').truncate(),
  knex('users').truncate(),
  knex('videos').truncate(),
  knex('likes').truncate(),
  knex('likes_by_user').truncate(),
  knex('ignores').truncate(),
]);

/*
  ***********************************************************************

  Resets the database to dummy values.

  ***********************************************************************
*/

knex.runInitDB = () =>
  knex.clear()
  .then(() => knex.initDB())
  .then(() => 'Database initialized!');

/*
  Retrieve Video Likes By User --> Primarily intended for use with Mixtape
*/
knex.getVideoLikesByUser = (userId) => {
  console.log('a');
  return knex
    .from('users')
    .where('users.id', userId)
    .innerJoin('likes_by_user', 'users.id', 'likes_by_user.user_id')
    .innerJoin('likes', 'likes_by_user.likes_id', 'likes.id')
    .innerJoin('videos', 'likes.video_id', 'videos.id')
    .orderBy('videos.url')
    .then(likes => {
      let groups = [];
      for (var i = 0; i < likes.length; i++) {
        var group = groups[groups.length - 1];
        if (group && group.url === likes[i].url) {
          group.moments.push({ start_time: likes[i].start_time, stop_time: likes[i].stop_time });
        } else {
          groups.push({
            url: likes[i].url,
            moments: [{ start_time: likes[i].start_time, stop_time: likes[i].stop_time }]
          });
        }
      }
      return groups;
    });
};

module.exports = knex;
