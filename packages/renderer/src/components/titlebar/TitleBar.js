import React from 'react';
import titleStyle from './TitleBar.module.scss';
import '../Common.scss';

function TitleBar(props) {

    let {draggable} = props;

    return (
        <div className={`${titleStyle.TitleBar} ${draggable ? titleStyle.Draggable : ''}`}>
            <div className={titleStyle.Title}><span className="no-drag">Bob Rust</span></div>
            <div className={`${titleStyle.CloseButton} ${titleStyle.Button} no-drag`}
                onClick={() => window.Access.close()}
            />
            <div
                className={`${titleStyle.SizeButton} ${titleStyle.Button} ${draggable ? titleStyle.Maximize : titleStyle.Minimize} no-drag`}
                onClick={() => {
                    if(draggable) window.Access.maximize();
                    else window.Access.minimize();
                }}
            />
        </div>);
}


export default TitleBar;
