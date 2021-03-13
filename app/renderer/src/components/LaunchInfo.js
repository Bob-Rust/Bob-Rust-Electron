import React from 'react';
import github from '../images/GitHub-Mark-32px.png';
import style from './LaunchInfo.module.scss';
import './Common.scss';

function LaunchInfo() {
    return <div id="content">
        <div style={{"text-align": "center"}}>
            <p>Maximize to get started</p>
            <p>Write about this or maybe add buttons here 🤔</p>
        </div>

        <div className={style.Footer}>
                <div>
                    <a href="https://github.com/Bob-Rust/Bob-Rust-Electron" target="_blank" rel="noreferrer">
                    <img draggable={false} className={style.GitHub} src={github} width="20" height="20" alt={'GitHub Logo'}/>
                    <span>Authors HardCoded & Sekwah</span>
                    </a>
                </div>
        </div>
    </div>;
}

export default LaunchInfo;
