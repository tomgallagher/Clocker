import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter as Router } from 'react-router-dom';
import { App } from './App';

//the easy way to include semantic ui
import 'semantic-ui-css/semantic.min.css';
//import the our own and the semantic ui css
import './index.css';
//grab the grid layout css
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <App />
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);

