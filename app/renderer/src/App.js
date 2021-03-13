import React from 'react';
import './App.css';
import TitleBar from "./components/titlebar/TitleBar";
import ToolBar from "./components/toolbar/ToolBar";
import LaunchInfo from './components/LaunchInfo';

function App() {
    return (
        <div className="App">
            <TitleBar draggable={true}/>
            {/*<ToolBar/>*/}
            <LaunchInfo/>
        </div>
    );
}

export default App;
