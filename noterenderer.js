/*
      NoteRenderer.JS
    Renders the note, and
    grabs the information
    needed for the note.
*/

const electron = require('electron').shell;
const ipc = require('electron').ipcRenderer;

var TheResponse = React.createClass({
render: function(){
    return (
      <p> test </p>
    );
}
});

var TheNote = React.createClass({
  render: function(){
    return (
      <div>
        <div
        className="messageText">
          {this.props.data.message} <br />
        </div>
        <TheResponse type={this.props.type}/>
          -{this.props.data.sender}
      </div>
    );
  }
});

ipc.on('update', function(event, data){
    ReactDOM.render(
      <TheNote data={data}/>,
      document.getElementById('note')
    );
});

ipc.send('ready');
