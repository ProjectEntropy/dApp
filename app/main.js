import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';

require("style-loader!css-loader!./app.css")

ReactDOM.render(<App />, document.getElementById('container'));
