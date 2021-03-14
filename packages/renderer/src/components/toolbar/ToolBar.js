import React from 'react';
import toolStyle from './ToolBar.module.scss';
import toolCanvas from '../../images/tool_canvas.png';
import toolImage from '../../images/tool_image.png';
import toolStart from '../../images/tool_start.png';
import '../Common.scss';

function ToolBar(props) {
    /* eslint-disable */
    return (
        <div className={`${toolStyle.ToolBar}`}>
            <div><img className={`${toolStyle.ToolIcon}`} src={toolCanvas} alt={'Tool Canvas'}/></div>
            <div><img className={`${toolStyle.ToolIcon}`} src={toolImage} alt={'Tool Image'}/></div>
            <div><img className={`${toolStyle.ToolIcon}`} src={toolStart} alt={'Tool Start'}/></div>
        </div>
    );
    /* eslint-enable */
}


export default ToolBar;
