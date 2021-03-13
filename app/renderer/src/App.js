import React from 'react';
import './App.css';
import TitleBar from "./components/titlebar/TitleBar";
import LaunchInfo from './components/LaunchInfo';

function App() {
  return (
    <div className="App">
      <TitleBar draggable={true}/>
      <LaunchInfo/>
    </div>
  );
}

export default App;
