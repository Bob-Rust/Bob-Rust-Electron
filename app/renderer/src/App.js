import React from 'react';
import './App.css';
import TitleBar from "./components/titlebar/TitleBar";
import ToolBar from "./components/toolbar/ToolBar";
import LaunchInfo from './components/LaunchInfo';
import { Link, Route, Switch, HashRouter as Router } from 'react-router-dom';

function App() {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route path='/maximized'>
                        <TitleBar draggable={false}/>
                        <ToolBar/>
                    </Route>
                    <Route path='/'>
                        <TitleBar draggable={true}/>
                        <LaunchInfo/>
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
