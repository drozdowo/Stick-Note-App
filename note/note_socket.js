/*
              |  note_socket.js  |
      manages socket request and connections
          from users and handle them
*/

const io = require('socket.io');
const _ = require('lodash');
const note_usermanager = require('./note_usermanager.js');
const note_db = require('./note_db.js');
