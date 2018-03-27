
// Requires
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const note_db = require('./note/note_db.js');
const note_usermanager = require('./note/note_usermanager.js');
const note_config = require('./note/note_config.js');
const _ = require('lodash');
///////////////////////////////////


app.get('/', _.partial(sendIndex));

io.on('connection', _.partial(userConnection));

http.listen(3000, function(){
  console.log('--------------------');
  console.log("|      note shit   |");
  console.log("|        v.1       |");
  console.log("|__________________|");
  console.log("Successfully listening on port: 3000");
});


/*
    userConnection - Lives through a user's entire session.
    @param {socket.io obj} socket - The socket connection for
*/
function userConnection(socket){
  console.log("A user has connected to our server!");
  //note_db.updateClientMessages(socket);
  socket.on('getUsers', _.partial(fetchUsers, socket));
  socket.on('requestLogin', _.partial(onUserLoginRequest,socket));
  socket.on('requestUpdate', _.partial(updateClient, socket));
  socket.on('requestUsers', _.partial(fetchUsers, socket));
  socket.on('sendMessage', _.partial(processMessage, socket));
  socket.on('alertServer', _.partial(alertServer, socket));
  socket.on('requestNotes', _.partial(notesRequest, socket));
  socket.on('respondYes', _.partial(handleResponse, socket, 1));
  socket.on('respondNo', _.partial(handleResponse, socket, 2));
  socket.on('respondOk', _.partial(handleResponse, socket, 0));
  socket.on('disconnect', _.partial(onUserDisconnection, socket));
}

function onUserDisconnection(socket){
  //console.log('User ' + note_usermanager.getUsernameFromSocket(socket) + ' has disconnected!');
  note_usermanager.removeUser(socket);
  console.log("A user has disconnected from our server!");
}

function sendIndex(err, res){
  note_usermanager.getOnlineUsers();
  res.sendFile(__dirname + '/index.html');
}

function updateClient(socket){
  note_db.sendAllMessagesToSocketAsArray(socket);
}

function handleResponse(socket, num){
    note_db.removeMessageAndNotifySender(socket, num);
}

//TODO: Add MD5 encryption to the login data
/*
  Function: onUserLoginRequest
  Purpose: Called when a user logs in
  Inputs:   Socket - The socket information of the user who submitted the login
            Data - An object containing the submitted username and password
  Outputs:  A Mongoose find request to our user account database.
*/
function onUserLoginRequest(socket, data){
  console.log('Login Request! | Username: ' + data.username + ' Password: ' + data.password);
  loginData = {
    username: data.username,
    password: data.password,
    socket: socket
  };
  note_db.checkLogin(loginData);
}

function fetchUsers(socket){
  //console.log('Users Requested by: ' + note_usermanager.getUsernameFromSocket(socket));
  socket.emit('grantUsers', note_usermanager.getListOfAllNames());
}

function processMessage(socket, data){
  note_db.addMessage(note_usermanager.getUsernameFromSocket(socket), data);
}

function notesRequest(socket){
  note_db.getNotesRequest(socket);
}

function alertServer(socket, msg){
    console.log(msg);
}
