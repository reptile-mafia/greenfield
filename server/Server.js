/*

 ___  _ _  ___  ___  ___  ___   ___  _ _  ___  _ __ _  ___  ___
| . \| | || . >| . >| __>| . \ | . \| | ||  _>| / /| || __>/ __>
|   /| ' || . \| . \| _> |   / | | || ' || <__|  \ | || _> \__ \
|_\_\`___'|___/|___/|___>|_\_\ |___/`___'`___/|_\_\|_||___><___/

Todo: Get shit done

!!!!!!! USE AirBnB ESLinter TO MATCH CODE STYLING !!!!!!!

*/

/*
  *************************
  Include required packages
  *************************
*/

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const babelify = require('babelify');
const browserify = require('browserify-middleware');
const google = require('googleapis');
const _ = require('underscore');

const db = require('./db');

// Duplicate the 'keys_copyMe.js' file, rename it 'keys.js', and paste in your Google API key
// const keys = require('./keys');

const auth = process.env.CLIENT_ID//keys.CLIENT_ID;

const youtube = google.youtube({ version: 'v3', auth });

const app = express();

const serverUrl = process.env.PORT || 8000;

const serverMessage = `Listening on port: ${serverUrl}`;

/*
  *****************************************************
  Dummy objects to simulate PostgreSQL server structure
  *****************************************************
*/

// background image url: https://i.ytimg.com/vi/shTUk4WNWVU/maxresdefault.jpg

/*
const channels = [
  { id: 1, name: 'land', background: 'https://i.ytimg.com/vi/shTUk4WNWVU/maxresdefault.jpg') },
];

const users = [
  { id: 1, name: 'Joe' },
  { id: 2, name: 'Frank' },
  { id: 3, name: 'Rob' },
  { id: 4, name: 'Ryan' },
  { id: 5, name: 'Gilbert' },
];

const videos = [
  { id: 1, url: 'OMflBAXJJKc', channel_id: 1 },
  { id: 2, url: 'x76VEPXYaI0', channel_id: 1 },
  { id: 3, url: 'evj6y2xZCnM', channel_id: 1 },
];

const likes = [
  { id: 1, start: 43, stop: 48, video_id: 1, channel_id: 1, users: [1, 2, 4] },
  { id: 2, start: 74, stop: 82, video_id: 1, channel_id: 1, users: [2, 3, 4] },
  { id: 3, start: 38, stop: 42, video_id: 2, channel_id: 1, users: [1, 3, 4] },
  { id: 4, start: 70, stop: 90, video_id: 3, channel_id: 1, users: [2, 5] },
];


  // *********************************************************
  // Completed channel object should look something like this:
  // *********************************************************


const dummyObj = {
  id: 1,
  channel_name: 'land',
  background: path.join(__dirname, '../assets/land_background.jpg'),
  videos: [{
    url: 'OMflBAXJJKc',
    time_based_likes: [{
      id: 1,
      start: 43,
      stop: 48,
      video_id: 1,
      channel_id: 1,
      users: [1, 2, 4],
    }, {
      id: 2,
      start: 74,
      stop: 82,
      video_id: 1,
      channel_id: 1,
      users: [2, 3, 4],
    }],
  }, {
    url: 'x76VEPXYaI0',
    time_based_likes: [{
      id: 3,
      start: 38,
      stop: 42,
      video_id: 2,
      channel_id: 1,
      users: [1, 3, 4],
    }],
  }, {
    url: 'evj6y2xZCnM',
    time_based_likes: [{
      id: 4,
      start: 70,
      stop: 73,
      video_id: 3,
      channel_id: 1,
      users: [2, 5],
    }],
  }],
};
*/

const searchCriteria = {
  1: [
    'mountain biking',
    'skateboarding',
    'motorcross',
    'stunt biking',
    'snowboarding',
    'snow skiing',
  ],
  2: [
    'surfing',
    'jet ski',
    'wakeboarding',
    'water skiing',
  ],
  3: [
    'skydiving',
    'base jumping',
    'bungee jumping',
    'wingsuit',
  ],
};

/*
  ****************
  Middleware calls
  ****************
*/

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../assets')));

/*
  *******************
  ROUTING STARTS HERE
  *******************
*/

/*
  *******************************************
  Browserify and Babelify all files for React
  *******************************************
*/

app.get('/app-bundle.js',
  browserify(path.join(__dirname, '../client/main.js'), {
    transform: [[babelify, { presets: ['es2015', 'react'] }]],
  })
);

/*
  ***********************************************************************
  Initializes interface.

  Response object:  Index.html file
  ***********************************************************************
*/

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/Index.html'));
});

/*
  ***********************************************************************
  Responds to requests for specific channel.
  Channels are:
    0: default -> 5 videos randomly selected from other channels
    1: land
    2: sea
    3: air

  Videos are searched for by the following criteria
    - prepended with "extreme"
    - sorted by # of views, maybe randomized?

  GET:
    Response object:
      {
        id: current channel id,
        channel_name: current channel name,
        background: background image url or asset,
        videos: array of video objects:
          {
            id: this video id,
            url: youtube url id,
            channel_id: current channel id,
            time_based_likes: array of time-based like objects:
              {
                id: current time-based like id,
                start_time: like start time (in seconds),
                stop_time: like stop time (in seconds),
                video_id: current video id,
                channel_id: current channel id
                users: array of user ids that have like this video
              }
          }
      }
  ***********************************************************************
*/

app.get('/channel/:id', (req, res) => {
  // Build channel object for response
  if (req.params.id === '1' || req.params.id === '2' || req.params.id === '3') {
    db.getChannelById(req.params.id)
    .then(channelResObj => {
      res.send(channelResObj);
    });
  } else if (req.params.id === 'default') {
    db.getDefaultChannel()
    .then(channelResObj => {
      res.send(channelResObj);
    });
  } else {
    res.status(404).send('Not a proper channel!');
  }
});

/*
  ***********************************************************************
  Responds to requests for time-based likes information
  Channel id "default" returns all time-based likes in the database

  GET:
    Response object: array of all time-based likes:
      {
        id: current time-based like id,
        start_time: like start time (in seconds from beginning of video),
        stop_time: like stop time (in seconds from beginning of video),
        video_id: current video id,
        users: array of user ids that have like this video
      }
  ***********************************************************************
*/

app.get('/channel/:id/likes', (req, res) => {
  if (req.params.id === '1' || req.params.id === '2' || req.params.id === '3') {
    db.getLikesByChannel(req.params.id).then((likesArray) => {
      res.send(likesArray);
    });
  } else if (req.params.id === 'default') {
    db.getAllLikes()
    .then(likesArray => {
      res.send(likesArray);
    });
  } else {
    res.status(404).send('Not a proper channel!');
  }
});

/*
  ***********************************************************************
  Responds to requests to create time-based likes on user click.

  Validation implemented to prevent duplication.

  POST:
    Request object (from client):
      {
        start_time: like start time (in seconds from beginning of video),
        stop_time: like stop time (in seconds from beginning of video),
        user_id: current user id
        video_id: current video id
        channel_id: current channel id
      }

    Response object:
      {
        id: current time-based like id,
        start_time: like start time (in seconds from beginning of video),
        stop_time: like stop time (in seconds from beginning of video),
        video_id: current video id,
        channel_id: current channel id,
        users: array of user ids that have like this video
      }
  ***********************************************************************
*/

app.post('/likes/create', (req, res) => {
  db.createLike(req.body)
  .then(newLike => {
    res.send(newLike);
  });
});

/*
  ***********************************************************************
  Responds to requests to update time-based likes on user click.

  Validation implemented to prevent duplication.

  POST:
    Request object (from client):
      {
        user_id: current user id,
        like_id: current time-based like id
      }

    Response object:
      {
        id: current time-based like id,
        users: array containing all user ids that have liked (no repeats)
      }
  ***********************************************************************
*/

app.post('/likes/update', (req, res) => {
  db.updateLike(req.body)
  .then(newLike => {
    res.send(newLike);
  });
});

/*
  ***********************************************************************
  Provides an endpoint to initialize the database with dummy information
  ***********************************************************************
*/

app.get('/db_init', (req, res) => {
  db.runInitDB()
  .then(message => {
    res.send(message);
  })
  .catch(err => {
    res.status(404).send(err);
  });
});


app.get('/test/:id', (req, res) => {
  var params = {
    id: req.params.id + '',
    part: 'snippet',
  }
  youtube.videos.list(params, (err, resp) => {
    if (err) {
      res.status(400).send();
    } else {
      console.log(JSON.stringify(resp));
      res.status(200).send(resp)
    }
  });
});
/*
  ***********************************************************************
  Responds to requests to add more videos to a channel.

  Utilizes the YouTube search api to obtain videos based upon a union of
  2 keywords from the searchCriteria object for the specified channel.

  Results are passed to the database where they are validated against the
  videos currently attached to the specified channel and added if not
  already present.

  GET:
    Response Object: array of new videos added to the channel:
    {
      id: new video id,
      url: new video YouTube id,
      channel_id: current channel id,
      time_based_likes: array of user likes
    }
  ***********************************************************************
*/

app.get('/videos/:id', (req, res) => {
  if (req.params.id === '1' || req.params.id === '2' || req.params.id === '3') {
    const randomCriteria = _.shuffle(searchCriteria[req.params.id]);
    const query = `extreme ${randomCriteria[0]} | ${randomCriteria[1]}) -fail -funny -3D`;
    const params = {
      q: query,
      order: 'viewCount',
      type: 'video',
      videoDefinition: 'high',
      videoDuration: 'medium',
      fields: 'items/id',
      videoDimension: '2d',
      videoEmbeddable: 'true',
      part: 'snippet',
    };

    youtube.search.list(params, (err, resp) => {
      if (err) {
        res.status(404).send('Search failed.  Youtube\'s fault');
      } else if (resp.items.length) {
        db.addVideos(resp.items, req.params.id)
        .then((videos) => {
          res.status(200).send(videos);
        });
      } else {
        res.status(404).send('Search failed to return any items');
      }
    });
  } else {
    res.status(400).send('Cannot add videos to that channel!');
  }
});

/*
  *******************************************************************
  Spin up server on either NODE environmental variable or 8000(local)
  *******************************************************************
*/

app.listen(serverUrl);
console.log(serverMessage);
