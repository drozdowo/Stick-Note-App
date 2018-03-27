/*
      -- Note JS --
          Note
*/

var React = require('./react/build/react.js');
var ReactDOM = require('./react/build/react-dom.js');

function setup(noteData)  {

  var Note = React.createClass({
    render: function(){
      return(
        <div>
            The notes text is: {noteData.name}
        </div>
      );
    }
  });
  return Note;
}


module.exports = {
  setup: setup,
  noteToString: noteToString
};
