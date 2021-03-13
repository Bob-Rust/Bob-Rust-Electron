import React from 'react';
import titleStyle from './TitleBar.module.scss';
import '../Common.scss';

function TitleBar(props) {

    let {draggable} = props;

    return (
        <div className={`${titleStyle.TitleBar} ${draggable ? titleStyle.Draggable : ''}`}>
            <div className={titleStyle.Title}><span className="no-drag">Bob Rust</span></div>
            <div className={`${titleStyle.CloseButton} ${titleStyle.Button} no-drag`}/>
            <div
                className={`${titleStyle.SizeButton} ${titleStyle.Button} ${draggable ? titleStyle.Maximize : titleStyle.Minimize} no-drag`}/>
        </div>);
}


export default TitleBar;
