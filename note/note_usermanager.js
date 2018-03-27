/*
        note_usermanager.js
    manages the connected users
*/

module.exports = {
    addUser: addUser,
    getSocketByUsername: getSocketByUsername,
    getUsernameFromSocket: getUsernameFromSocket,
    removeUser: removeUser,
    getOnlineUsers: getOnlineUsers,
    getListOfAllNames: getListOfAllNames,
    getSocketByName: getSocketByName,
    getNameFromUserName: getNameFromUserName,
    getUserNameFromName: getUserNameFromName,
    getNameFromSocket: getNameFromSocket
};

var users = [];

function getOnlineUsers(){
  //console.log('Current Online Users: \n ' + getListOfAllNames());
}

function addUser(user){
  var temp = [3];
  temp[0] = user.userName;
  temp[1] = user.Socket;
  temp[2] = user.name;
  users.push(temp);
}

function removeUser(socket){
  for(var i = 0; i < users.length; i++){
    if (socket === users[i][1]){
      users.splice(i, 1);
    }
  }
}

function getSocketByUsername(username){
    for(var i = 0; i < users.length; i++){
        if (username === users[i][0]){
          return users[i][1];
        }
    }
}

function getNameFromUserName(username){
  for(var i = 0; i < users.length; i++){
      if (username === users[i][0]){
        return users[i][2];
      }
  }
}

function getUserNameFromName(name){
  for(var i = 0; i < users.length; i++){
      if (name === users[i][2]){
        return users[i][0];
      }
  }
}

function getNameFromSocket(socket){
  for(var i = 0; i < users.length; i++){
      if (socket === users[i][1]){
        return users[i][2];
      }
  }
}

function getSocketByName(name){
  for(var i = 0; i < users.length; i++){
      if (name === users[i][2]){
        return users[i][1];
      }
  }
}

function updateMessageReceivedByName(name){
  //getSocketByName(name).emit('messageReceived', )
}

function getListOfAllNames(){
  var namesList = [];
  users.map(function(arr){
    namesList.push(arr[2]);
  })
  return namesList;
}

function getUsernameFromSocket(socket){
  for(var i = 0; i < users.length; i++){
      if (socket === users[i][1]){
        return users[i][0];
      }
  }
}
