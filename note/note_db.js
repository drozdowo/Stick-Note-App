  /*
          |  note_db.js  |
      Manage MongoDB connections
*/

//Requires
const mongoose = require('mongoose');
const _ = require('lodash');
const note_usermanager = require('./note_usermanager.js');
const note_config = require('./note_config.js');
/////////////////////////////////////////////////////////

//Constants
const USERACCOUNTS = 'mongodb://localhost/acc';
const NOTEDB = 'mongodb://localhost/app';
const NOTES = 'mongodb://localhost/msg';
const login = mongoose.createConnection(USERACCOUNTS);
const msg = mongoose.createConnection(NOTEDB);
const notes = mongoose.createConnection(NOTES);
/////////////////////////////////////////////////////////

// Schema and Model Definitions
const messageSchema = mongoose.Schema({
  name: String,
  message: String
});
const aMessage = msg.model('aMessage', messageSchema, 'app');

const noteSchema = mongoose.Schema({
  note_id: Number,
  sender: String,
  recipient: String,
  message: String,
  type: String
});
const aNote = notes.model('aNote', noteSchema, 'msg');

const loginSchema = mongoose.Schema({
  username: String,
  password: String,
  group: String,
  name: String
});
const aLogin = login.model('aLogin', loginSchema, 'acc');
/////////////////////////////////////////////////////////

/*
    checkLogin - Checks the login data of a user.
    @param {obj} logindata - Contains the login data of the user that requested a login
*/
function checkLogin(logindata){
  //TODO: Add MD5 encryption?
  if (login == null){
    console.log('Database Connection Error!');
    return -1;
  }
  aLogin.find({'username':logindata.username}, _.partial(checkData, loginData))
}

/*
    checkData - Checks the login data of a user.
    @param {obj} logindata - Contains the login data of the user that requested a login
    @param {obj} err - Mongoose error object
    @param {obj} res - Mongoose result object
*/
function checkData(loginData, err, res){
  if (_.isUndefined(res)) {
    console.log('Error!');
  }
  else if (res.length > 1){
    console.log('Error! Multiple username ${res[0].username}  found! Please contact administrator!')
  }
  else if (res.length === 0){
    console.log('Incorrect Password or User does not exist!')
  }
  else if (loginData.password == res[0].password && !_.isUndefined(res[0])){
    console.log('User ' + res[0].username+ ' has successfully logged in.');
    tempObj = {
      userName: loginData.username,
      Socket: loginData.socket,
      name: res[0].name
    };
    note_usermanager.addUser(tempObj);
    loginData.socket.emit('onSuccessfulLogin', {'username':res[0].username});
  }
  else{
    console.log('Invalid login!');
  }
}

/*
    sendAllMessagesToSocketAsArray - Sends all messages to a socket as an array.
    @param {obj} socket - Socket.IO socket object
*/
function sendAllMessagesToSocketAsArray(socket){
  aMessage.find({}, _.partial(sendAllMessages, socket));
}

/*
    Deprecated
    sendAllMessages - Sends all messages from the *obsolete* app DB
    @param {socket.io object} socket - Socket information of the requester.
    @param {mongoose error object} err - Contains the error information (if it exists)
    @param {mongoose data object} data - Contains the data information (if it exists)
*/
function sendAllMessages(socket, err, data){
  var list = [];
  for(var i = 0 ; i < data.length ; i++){
    list.push(data[i].name + " - " + data[i].message + '\n');
  }
  socket.emit('addMessage', list);
}

/*
  addMessage - Adds a message to the database from a user.
  @param {socket.io obj} theSender - The socket of the sender of the message
  @param {obj} data - The content of the message (ie: recipient, content, type, etc)
*/
function addMessage(theSender, data){
  aNote.find({recipient:data.recipient}, _.partial(handleMessageAddToDb, theSender, data));
}

/*
  addMessage - Handles the addition to the database, and notifies the user of its addition.
  @param {socket.io obj} theSender - The socket of the sender of the message
  @param {socket.io obj} err - If an error has occurred, this will not be null.
  @param {obj} adata - The content of the message (ie: recipient, content, type, etc)
*/
function handleMessageAddToDb(theSender, data, err, adata){
  //console.log(adata.length);
  //console.log(theSender + ' ' + data.recipient + ' ' + data.message);
/*
  if (adata.length > 0) //the recipient already has a message, prompt to overwrite if admin
  {
    note_usermanager.getSocketByUsername(theSender).emit('alertNotification', 'This user already has a pending note! Only administrators can overwrite notes!')
    return;
  }
  if (adata.length === 0) { //no messages, so add a new one for them */
    var newMessage = new aNote({sender:theSender, recipient:data.recipient, message:data.message, type:data.type});
    newMessage.save(function(err, newMessage){
      if (err){
        note_usermanager.getSocketByUsername(theSender).emit('alertNotification', 'Database Error! Contact Administrator!')
      }
      note_usermanager.getSocketByUsername(theSender).emit('alertNotification', 'Note saved and received!');
    });
}

/*
  getMessage - Retrieves a message based on its recipient, ie: the requester.
  @param {socket.io obj} requester - The socket of the requester of the message getting (ie: the person who responded in this case.)
  */
function getMessage(requester){
  //console.log('Name requesting message: ' + note_usermanager.getNameFromSocket(requester)) ;
  aNote.find({recipient:note_usermanager.getNameFromSocket(requester)}, _.partial(handleMessage, requester));
}

/*
  handleMessage - Responds to the requester with the message that is waiting for them.
  @param {socket.io obj} requester - The socket of the requester
  @param {socket.io obj} err - If an error has occurred, this will not be null.
  @param {obj} data - The content of the message (ie: recipient, content, type, etc)
*/
function handleMessage(requester, err, data){
    getCurrentMessages();
    if (err){
      requester.emit('alertNotification', 'Error! Please contact administrator!');
    }
    if (data.length === 0){
      requester.emit('messageResponse', 'nomsg');
    }
    else if (data.length === 1){
      data[0].sender = note_usermanager.getNameFromUserName(data[0].sender);
      requester.emit('messageResponse', data);
    }
    else if (data.length >= 2){
      requester.emit('messageResponse', 'msgs');
  }
}


/*
    getCurrentMessages - Obtains the number of notes currently. used
                         for generating a unique ID for the notes.
*/
function getCurrentMessages(){
  var numMessages;
  aNote.find({}, function(err, res){
    console.log('Num messages: ' + res.length);
  });
}

/*
  getNotesRequest - Fetches notes for the user that requested it.
  @param {socket.io obj} reqester - The socket of the person who requested their messages
*/
function getNotesRequest(requester){
  var recName = note_usermanager.getNameFromSocket(requester);
  aNote.find({recipient:recName}, _.partial(sendNotesToRequester, requester));
}

function sendNotesToRequester(requester, err, res){
  if (res.length === 0){
    requester.emit('alertNotification', 'No new notes for you, ' + note_usermanager.getNameFromSocket(recipient) +'.');
  }
  else{
    res.map(function(me){
      me.sender = note_usermanager.getNameFromUserName(me.sender);
      requester.emit('messageResponse', me);
    });
  }
}

/*
  removeMessageAndNotifySender - Removes the message and notifies the sender of the recipients response to the note.
  @param {socket.io obj} requester - The person who requested the deletion (And responded)
  @param {int} response - 0 = ok, 1 = yes, 2 = no, 4 = other
*/
function removeMessageAndNotifySender(requester, response){
  aNote.find({recipient:note_usermanager.getNameFromSocket(requester)}, function(err, res){
    //console.log(res);
    if (res.length != 1){
      requester.emit('alertNotification', 'Database Error! Please contact the administrator!')
      return;
    }
    if (response === 0){ //Ok response
      note_usermanager.getSocketByUsername(res[0].sender).emit('alertNotification', 'Response from user: ' + note_usermanager.getNameFromSocket(requester) + ' is: Ok.');
    }
    else if (response === 1) {// Yes response
      note_usermanager.getSocketByUsername(res[0].sender).emit('alertNotification', 'Response from user: ' + note_usermanager.getNameFromSocket(requester) + ' is: Yes.');
    }
    else { //No response
      note_usermanager.getSocketByUsername(res[0].sender).emit('alertNotification', 'Response from user: ' + note_usermanager.getNameFromSocket(requester) + ' is: No.');
    }
    // Clean up the message
    aNote.remove(res[0], function (err, res){
      if (err) {
        console.log('Message Deletion Error!');
        requester.emit('alertNotification', 'Server Error! Please contact the administrator!')
      }
    });
  })
}

module.exports = {
  checkLogin: checkLogin,
  sendAllMessagesToSocketAsArray: sendAllMessagesToSocketAsArray,
  addMessage: addMessage,
  getNotesRequest: getNotesRequest,
  removeMessageAndNotifySender: removeMessageAndNotifySender
}
