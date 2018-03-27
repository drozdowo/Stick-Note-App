const electron = require('electron');
const _ = require("lodash");
const ipc = electron.ipcMain;

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let noteWindows = [];
let noteContent = [];
let appSocket

function createWindow () {
  mainWindow = new BrowserWindow({width: 350, height: 450, frame: false, resizable: false, autoHideMenuBar: true, transparent: true});
  // Gets rid of the menu bar entirely:
  mainWindow.setMenu(null);

  //Set it to be always ontop:
  mainWindow.setAlwaysOnTop(true);


  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)


  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null;
    _.forEach(noteWindows, function(aNote){
      app.quit();
    });
  })
}

function createNewNote(noteData){
  if (_.includes(noteContent, noteData.message)){
    //console.log("Duplicate Note Detected!");
    return;
  }
  else{
    var theNewNote = new BrowserWindow({width: 250, height: 400, frame: false, resizable: false, autoHideMenuBar: true, transparent: true});
    theNewNote.loadURL(`file://${__dirname}/note.html`);
    theNewNote.setAlwaysOnTop(true);
    theNewNote.setMenu(null);
    noteWindows.push(theNewNote);
    noteContent.push(noteData.message); //Backup the notes data to not duplicate notes.
    ipc.once('ready', function(event, data){
      if (!_.isUndefined(theNewNote)){
          theNewNote.webContents.send('update', noteData);
      }
      theNewNote.on('closed', function () {
        noteContent.splice(noteContent.indexOf(noteData.message), 1);
      });
    });
  }
}

function closeAllActiveNotes(){

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipc.on('click', function(){
  mainWindow.webContents.send('clicked');
})

ipc.on('addNewMessage', function(e, data){
  if(data === 'nomsg'){
    return;
  }
    createNewNote(data);
});

ipc.on('sendSocket', function(e, theSocket){
    this.appSocket = theSocket;
});
