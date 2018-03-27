/*
      Index.JS // Entry.JS
*/


const note_config = require('./note/note_config.js');
const socket = io('http://' + note_config.host + ':3000');
const electron = require('electron').shell;
const ipc = require('electron').ipcRenderer;

var loggedIn = false;

var MessageUserMenu = React.createClass({
  sendMessage: function(){
    socket.emit('sendMessage', {'recipient':this.refs.userSelected.value, 'message':this.refs.message.value, 'type':this.refs.noteType.value});
    this.refs.message.value = '';
  },
  render: function(){
    return (
    <div class="messageUsers">
    Select User:
    <br />
    <select ref="userSelected">
      {this.props.users.map(function(name){return <option value={name}> {name} </option>})}
    </select>
    <br />
    Enter Message:
    <br />
    <textarea
    ref="message"
    rows="10"
    cols="30"
    />
    <br />
    Note Type:<br />
    <select
    ref="noteType">
    <option value="normal"> Normal </option>
    <option value="yesNo"> Yes/No </option>
    <option value="checkList"> checklist ** </option>
    </select>
    <br />
    <button
    onClick={this.sendMessage}
    className="navbar-button">
    test
    </button>
    </div>
  );
  }
});

var RenderNote = React.createClass({
  respondYes: function(){
      socket.emit('respondYes', {});
  },
  respondNo: function(){
     socket.emit('respondNo', {});
  },
  respondOk: function(){
    socket.emit('respondOk', {});
  },
  render: function(){
      if (this.props.data[0].length === 1){
        return (
            <div className="note">
                  No new notes yet!
            </div>
        )
      }
      else{
      if (this.props.data[0].type === 'yesNo'){
        return(
            <div className="note">
            <span className='note-p'>Message From: </span> <br /> {this.props.data[0].sender} <br />
            <span className='note-p'>Message To: </span><br /> {this.props.data[0].recipient} <br />
            <span className='note-p'>Message: </span><br /> {this.props.data[0].message} <br />
            <span className='note-p'>Response: </span><br />
            <button
            className='navbar-button'
            onClick={this.respondYes}>
            Yes </button>
            <button
            className='navbar-button'
            onClick={this.respondNo}>
            No </button>
            <br />
            </div>
        );
        }
        if (this.props.data[0].type === 'normal'){
          return(
              <div className="note">
              <span className='note-p'>Message From: </span><br /> {this.props.data[0].sender} <br />
              <span className='note-p'>Message To: </span><br /> {this.props.data[0].recipient} <br />
              <span className='note-p'>Message: </span><br /> {this.props.data[0].message} <br />
              <span className='note-p'>Response: </span><br />
              <button
              onClick={this.respondOk}
              className='navbar-button'>
              Ok </button> <br />
              </div>
          );
          }
      }
    }
});

var NavigationBar = React.createClass({
  OptionA: function(){
    socket.emit('requestUsers', {});
  },
  OptionB: function(){
    socket.emit('requestMessages', {});
  },
  OptionC: function(){
    ipc.send('newNote');
  },
  render: function(){
    return (
      <div>
      <button
      className="navbar-button"
      onClick={this.OptionA}>
      Send Notes
      </button>
      <button
      className="navbar-button"
      onClick={this.OptionB}>
      Check Current Note
      </button>
      <button
      className="navbar-button"
      onClick={this.OptionC}>
      Button C
      </button>
      </div>
      );
  }
});

var LoginForm = React.createClass({
  doLogin: function(){
    socket.emit('requestLogin', {username:this.refs.username.value, password:this.refs.password.value});
    return (
      <p>
        Logging in...
      </p>
    )
  },
  render: function(){
    return (
      <div class="logininput">
      Please login below:
      <br />
      Username:
      <input
       type="text"
       ref="username"
       />
      <br />
      Password:
      <input
       type="text"
       ref="password"
       />
      <br />
      <button
      type="button"
      onClick={this.doLogin}>
      Login
      </button>
      </div>
    );
  }
});

var MessagesCenter = React.createClass({
    render: function(messages) {
      return (
        <div>
        {this.props.messages.map(function(item){ return <li> {item} <br /> </li> })}
        </div>
      );
    }
});

var SuccessfulLogin = React.createClass({
    render: function(Username) {
      setTimeout(function(){
        //Unmounts the component, cleans up its handlers and state(s)
        ReactDOM.unmountComponentAtNode(document.getElementById('loginform'));
        ReactDOM.render(
          <NavigationBar />,
          document.getElementById('navbar')
        )
      }, 3000);
      loggedIn = true;
      return (
        <p>
        Thank you for logging in {this.props.Username}!
        </p>
      );
    }
});

socket.on('addMessage', function(data){
  ReactDOM.render(
    <MessagesCenter messages={data}/>,
    document.getElementById('container')
  );
});

socket.on('alertNotification', function(data){
  alert(data);
});

socket.on('onSuccessfulLogin', function(data){
  ipc.send('sendSocket', socket);
  ReactDOM.render(
  <SuccessfulLogin Username={data.username}/>,
  document.getElementById('loginform')
);
  socket.emit('requestUpdate', {});
})

socket.on('grantUsers', function(data){
  ReactDOM.render(
    <MessageUserMenu users={data}/>,
    document.getElementById('container')
  );
})

socket.on('messageResponse', function(data){
    ReactDOM.render(
      <RenderNote data={data} />,
      document.getElementById('container')
    );
});

ReactDOM.render(
  <LoginForm />,
  document.getElementById('loginform')
)


ipc.on('clicked', function(){
  socket.emit('alertServer', 'clicked');
})
