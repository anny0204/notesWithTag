var Note = React.createClass({
    render: function() {
        var bgColor = {backgroundColor: this.props.color};
        return (
            <div className="note" style={bgColor}>
                {this.props.children}
                <span className="delete_btn" onClick={this.props.onDelete}> x </span>
            </div>
        )
    }
});

var ColorPicker = React.createClass({
    colors: [{id: 0, color: "#005533"},
        {id: 1, color: "#ff44aa"},
        {id: 2, color: "#aa1100"},
        {id: 3, color: "#6600ff"},
        {id: 4, color: "#aaa111"},
        {id: 5, color: "#5500bb"}
    ],

    render: function() {
        var changeColor = this.props.changeColor;
        return (
            <div>
                <h3>Choose the color of your note:</h3>
                <div className="colorsHolder">
                {
                    this.colors.map(function(el) {
                        return <span className="color"
                        key={el.id}
                        style={{backgroundColor: el.color}}
                        onClick={changeColor.bind(null, el.color)}></span>
                    })
                }
                </div>
            </div>
        )
    }
});

var Tag = React.createClass({
    render: function() {
        return (
            <span>
                <span className="tag" onClick={this.props.selectTagName}>{this.props.children}</span>
                <span> </span>
            </span>
        );
    }
});

var Tags = React.createClass({
    getInitialState: function() {
        return {
            tagNames: []
        }
    },

    handleTagEnter: function(ev) {
        var newTagNames = [];
        if (ev.keyCode == 32) {
            this.refs.input.value = this.refs.input.value.slice(0, -1);
        }
        if (ev.keyCode == 13) {
            if (this.refs.input.value) {
                newTagNames = this.state.tagNames.slice();
                newTagNames.unshift({id: Date.now(), tagName: ev.target.value});
                this.setState({tagNames: newTagNames});
                this.refs.input.value = '';
            }
        };
    },

    componentWillMount: function() {
        var tags = JSON.parse(localStorage.getItem('tags'));
        if (tags) {
            this.setState({tagNames: tags});
        }
    },

    componentDidUpdate: function () {
        localStorage.setItem('tags', JSON.stringify(this.state.tagNames));
    },

    render: function() {
        var handleSelectTag = this.props.handleSelectTag;
        return (
            <div>
                <h3>Enter your tags:</h3>
                <div className="enter_tags">
                    <input type="text" onKeyUp={this.handleTagEnter} ref="input"/>
                </div>
                <div className="tags">
                {
                    this.state.tagNames.map(function(el){
                        return <Tag key={el.id}
                            selectTagName={handleSelectTag.bind(null, el.tagName)}>
                            {el.tagName}
                            </Tag>
                    })
                }
                </div>
            </div>
        )
    }
});

var NoteEditor = React.createClass({
    getInitialState: function() {
        return {
            text: '',
            color: '#fff'
        }
    },

    handleTextChange: function(event) {
        this.setState({text: event.target.value});
    },

    handleColorChange: function(color) {
        this.setState({color: color})
    },

    handleSaveNote: function() {
        var note = {
            id: Date.now(),
            text: this.state.text,
            color: this.state.color
        };
        this.props.addNote(note);
        this.setState({text:'', color: "#fff"});
    },

    render: function() {
        return (
            <div className="note_editor">
                <textarea className="textarea"
                    rows="5"
                    placeholder="Enter your note here..."
                    value={this.state.text}
                    onChange={this.handleTextChange}
                    style={{backgroundColor: this.state.color}}></textarea>
                <button className="add_btn" onClick={this.handleSaveNote}>Add</button>
                <ColorPicker changeColor={this.handleColorChange} />
                <Tags handleSelectTag={this.props.handleSelectTag}/>
            </div>
        )
    }
});

var NoteGrid = React.createClass({
 
    componentDidMount: function () {
        var elem = this.refs.grid;
        this.msnry = new Masonry( elem, {
        itemSelector: '.note',
        fitWidth: 200,
        gutter: 8
        });
    },

    componentDidUpdate: function() {
        this.msnry.reloadItems();
        this.msnry.layout();
    }, 

    render: function() {
        var handleDelete = this.props.handleDelete;
        return (
            <div className="note_grid" ref="grid">
                {
                    this.props.notes.map(function(note) {
                        return <Note key={note.id}
                            color={note.color}
                            onDelete={handleDelete.bind(null, note)}>
                            {note.text}
                        </Note>
                    })
                }
            </div>
        )
    }
});

var NoteApp = React.createClass({
    getInitialState: function() {
        return {
            notes: []
        }
    },

    componentWillMount: function() {
        this._handleLoadStorage();
    },

    _handleLoadStorage: function() {
        var notes = JSON.parse(localStorage.getItem('notes'));
        if (notes) {
            this.setState({notes: notes});
        };
    },

    handleAddNote: function(note) {
        var newNotes = [];
        newNotes = this.state.notes.slice();
        newNotes.unshift(note);
        this.setState({notes: newNotes}, this._updateLocalStorage);
    },

    handleNoteDelete: function(note) {
        var noteId = note.id;
        var newNotes = this.state.notes.filter(function(note){
            return note.id != noteId;
        });
        this.setState({notes: newNotes});

        var notes = JSON.parse(localStorage.getItem('notes'));
        newNotes = notes.filter(function(note){
            return note.id != noteId;
        });
        localStorage.setItem('notes', JSON.stringify(newNotes));
    },

    _updateLocalStorage: function() {
        localStorage.setItem('notes', JSON.stringify(this.state.notes));
    },

    handleSelectTag: function(tagName) {
        var notes = JSON.parse(localStorage.getItem('notes'));
        var filterNotes = notes.filter(function(note){
            var isWord = false;
            var noteArr = note.text.split(' ');
            noteArr.forEach(el => {
                if (el == tagName) isWord = true;
            });
            return isWord;
        });

        this.setState({notes: filterNotes});
    },

    render: function() {
        return (
            <div className="note_app">
                <NoteEditor addNote={this.handleAddNote} handleSelectTag={this.handleSelectTag}/>
                <NoteGrid notes={this.state.notes} handleDelete={this.handleNoteDelete}/>
            </div>
        )
    }
});

ReactDOM.render(
    <NoteApp />,
    document.getElementById('point_mount')
);