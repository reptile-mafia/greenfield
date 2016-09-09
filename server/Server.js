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
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const morgan = require('morgan');
const LocalStrategy = require('passport-local').Strategy;
var passport = require('./passport');

const db = require('./db');

/*
  *************************
  create a .env file to hold environmental configuration
  This file should be in the root directory of the project
  This file expects the following variables:

  CLIENT_ID=youtube_api_token
  PORT=port_that_you_want_to_use
  NODE_ENV=development
  *************************
*/

const auth = process.env.CLIENT_ID;

const youtube = google.youtube({ version: 'v3', auth });

const app = express();

const serverUrl = process.env.PORT || 8000;

const serverMessage = `Listening on port: ${serverUrl}`;

const searchCriteria = {
  1: [
    'cat cute',
    'cat adorable',
    'kitten',
    'kitty'
  ],
  2: [
    'cat fail',
    'cat jerks',
    'cat being asshole',
    'cat knocks',
  ],
  3: [
    'japanese cat',
    'Maru cat',
    '猫',
    '貓',
    'ネコ',
    'ねこ'
  ],
};

/*
  ****************
  Middleware calls
  ****************
*/
app.use(morgan('dev'));   // show requests in console
app.use(bodyParser.json());
app.use(cookieParser());
// initialize passport
app.use(session({secret: 'kitty kity', cookie: {}}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())
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
  Auth through passport

  Response object:  user onject if success, 500 with error string if fail
  ***********************************************************************
*/

app.post('/login',    //local
  passport.authenticate('local', {
      successRedirect: '/loginSuccess',
      failureRedirect: '/loginFail'
}));

app.get('/logout', function (req, res) {
    req.logout();
    res.send('logout success');
});

app.post('/signup', //local
  passport.authenticate('local-signup', {
      successRedirect: '/loginSuccess',
      failureRedirect: '/loginFail'
}));

app.get('/login-facebook', passport.authenticate('facebook'));

app.get('/login-facebook/callback',
  passport.authenticate('facebook', { 
      successRedirect: '/loginSuccess',
      failureRedirect: '/loginFail'
}));

app.get('/loginSuccess', isLoggedIn, function(req, res){
    var result = {
      errorMessage:"", //error message
      username:req.user.username,
      isSuccessful: true
    }
    res.send(result);
  }
);

app.get('/loginFail', function(req, res){ // should not get here
    var result = {
      errorMessage:"",
      username:"",
      isSuccessful: false
    }
    res.send(result);
  }
);

app.get('/testPage', isLoggedIn, function(req, res){
  console.log("print out user info", req.user)
  res.send('You are allow')
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
      return next();
    }
    res.send("you shall not pass")
}

/*
  ***********************************************************************
  Responds to request for channel info.

  Response object:  array of channel info
  ***********************************************************************
*/
app.get('/channelInfo', function(req, res){
   db.getChannelInfo()
   .then((channelInfo)=>{
    res.send(channelInfo)
   })
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
  // Build channel object for respon
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


app.post('/likes/create', isLoggedIn, (req, res) => {
  console.log("LIKE!", req.body, req.user)
  db.createLike(req.body, req.user.id)
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

app.post('/likes/update', isLoggedIn, (req, res) => {
  console.log("LIKE UPDATE!", req.body, req.user)
  db.updateLike(req.body, req.user.id)
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
app.get('/test/:id', (req, res) => {
  var params = {
    id: req.params.id + '',
    part: 'snippet',
  }
  youtube.videos.list(params, (err, resp) => {

    if (err) {
      res.status(400).send();
    } else {

      res.status(200).send(resp.items[0].snippet.title);
    }
  });
});


app.get('/videos/:id', (req, res) => {

  if (req.params.id === '1' || req.params.id === '2' || req.params.id === '3') {
    const randomCriteria = _.shuffle(searchCriteria[req.params.id]);
    const query = `extreme ${randomCriteria[0]} | ${randomCriteria[1]}) -fail -funny -3D`;
    const params = {
      q: query,
      order: 'viewCount',
      type: 'video',
      videoDefinition: 'high',
      //videoDuration: 'medium',
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
  Endpoint for Mixtape --> Returns JSON Array of likes by a userId
*/
app.all('/mixtape', isLoggedIn);
app.get('/mixtape', (req, res) => {
  db.getVideoLikesByUser(req.user.id)
    .then(likes => res.status(200).send(likes))
    .catch(err => {
      console.log('ROUTE: /mixtape ', err);
      res.status(400).send();
    });
});

app.get('/mixtape/user/:id', (req, res) => {
  db.getVideoLikesByUser(req.params.id)
    .then(likes => res.status(200).send(likes))
    .catch(err => {
      console.log('ROUTE: /mixtape ', err);
      res.status(400).send();
    });
});

/*
  *******************************************************************
  Spin up server on either NODE environmental variable or 8000(local)
  *******************************************************************
*/

app.listen(serverUrl);
console.log(serverMessage);
