const { ipcRenderer, desktopCapturer } = require('electron');

const points = {
    size: {
        0: { x: 24, y: 54 },
        1: { x: 44, y: 54 },
        2: { x: 64, y: 54 },
        3: { x: 84, y: 54 },
        4: { x: 104, y: 54 },
        5: { x: 124, y: 54 },
    },
    shape: {
        0: { x: 26, y: 88 },
        1: { x: 58, y: 88 },
        2: { x: 90, y: 88 },
        3: { x: 122, y: 88 },
    },
    opacity: {
        0: { x: 22, y: 131 },
        1: { x: 43, y: 131 },
        2: { x: 64, y: 131 },
        3: { x: 85, y: 131 },
        4: { x: 106, y: 131 },
        5: { x: 127, y: 131 },
    },
};

const colors = [
	{ x: 27, y: 180, index: 0, color: [ 46, 204, 112 ] },
	{ x: 27, y: 210, index: 1, color: [ 22, 161, 132 ] },
	{ x: 27, y: 240, index: 2, color: [ 52, 153, 218 ] },
	{ x: 27, y: 300, index: 3, color: [ 241, 195, 16 ] },
	{ x: 27, y: 330, index: 4, color: [ 143, 69, 173 ] },
	{ x: 27, y: 360, index: 5, color: [ 153, 163, 162 ] },
	{ x: 27, y: 390, index: 6, color: [ 52, 73, 93 ] },
	{ x: 59, y: 180, index: 7, color: [ 46, 158, 135 ] },
	{ x: 59, y: 210, index: 8, color: [ 30, 224, 24 ] },
	{ x: 59, y: 300, index: 9, color: [ 176, 122, 195 ] },
	{ x: 59, y: 330, index: 10, color: [ 231, 127, 33 ] },
	{ x: 59, y: 360, index: 11, color: [ 236, 240, 241 ] },
	{ x: 91, y: 180, index: 12, color: [ 38, 174, 96 ] },
	{ x: 91, y: 240, index: 13, color: [ 33, 203, 241 ] },
	{ x: 91, y: 270, index: 14, color: [ 126, 77, 41 ] },
	{ x: 91, y: 300, index: 15, color: [ 239, 68, 49 ] },
	{ x: 123, y: 240, index: 16, color: [ 74, 212, 188 ] },
	{ x: 123, y: 270, index: 17, color: [ 69, 48, 33 ] },
	{ x: 123, y: 360, index: 18, color: [ 49, 49, 49 ] },
	{ x: 123, y: 390, index: 19, color: [ 1, 2, 1 ] },
];

// TODO: Use a sample screenshot to estimate the position of this panel!
function getPanelOffset() {
    if(true) {
        return settings.estimated_offset;
    }
    return {
        x: 1770,
        y: 277,
    };
}

function click() { ipcRenderer.invoke('robot_mouseClick'); }
function move(x, y) { ipcRenderer.invoke('robot_mouseMove', x, y); }
function setMouseDelay(delay) { ipcRenderer.invoke('robot_mouseDelay', delay); }
function screenshot(x, y, width, height) { return ipcRenderer.invoke('robot_screenshot', x, y, width, height); }

async function checkMouse(x, y) {
    let result = await ipcRenderer.invoke('robot_checkMouse', x, y);
    if(!result) throw 'Mouse was moved';
}

function setBrushSize(type) {
    let pos = points.size[type];
    let off = getPanelOffset();
    move(pos.x + off.x, pos.y + off.y + 10);
    click();
}

function setBrushShape(type) {
    let pos = points.shape[type];
    let off = getPanelOffset();
    move(pos.x + off.x, pos.y + off.y + 10);
    click();
}

function setBrushOpacity(type) {
    let pos = points.opacity[type];
    let off = getPanelOffset();
    move(pos.x + off.x, pos.y + off.y + 10);
    click();
}

function setBrushColor(index) {
    let col = colors[index];
    let off = getPanelOffset();
    move(col.x + off.x, col.y + off.y);
    click();
}

function getClosestColor(col) {
    let r = (col >> 16) & 0xFF;
    let g = (col >> 8 ) & 0xFF;
    let b = (col      ) & 0xFF;

    let result = colors[0];
    let min = 200000; // 196608 exact 256 ^ 2 + 256 ^ 2 + 256 ^ 2
    for(let index in colors) {
        let a = colors[index].color;
        let score = ((r - a[0]) ** 2) + ((g - a[1]) ** 2) + ((b - a[2]) ** 2);

        if(score < min) {
            result = colors[index];
            min = score;
        }
    }

    return result;
}

const settings = {
    color: -1, // TODO: No way of calculating color
    opacity: -1,
    size: -1,
    shape: -1,
    image: [],

    width: 1,
    height: 1,
    estimated_offset: {
        x: 1770,
        y: 277,
    }
}

/**
 * Returns if the settings match correctly
 * 
 * @param {Number} size 
 * @param {Number} shape 
 * @param {Number} opacity 
 * @returns 
 */
function checkSettings(size, shape, opacity) {
    return settings.size == size
        && settings.shape == shape
        && settings.opacity == opacity;
}

function estimatePanelPositionFromImage(array, width, height) {
    let candidate = null;

    let x_min = Math.max(width - 150, 0);
    for(x = width - 13; x >= x_min; x--) {
        for(y = 40; y < height - 222; y++) {
            let idx = (x + y * width) * 4;

            let avr = (array[idx] + array[idx + 1] + array[idx + 2]) / 3;
            if(avr > 200) {
                let found = true;

                for(k = 0; k < 12; k++) {
                    let idx_off = (x + (y + k) * width) * 4;

                    for(j = 0; j < 12; j++) {
                        let idxx = idx_off + j * 4;
                        let avr = (array[idxx] + array[idxx + 1] + array[idxx + 2]) / 3;
                        if(avr < 230) {
                            found = false;
                            break;
                        }
                    }

                    if(!found) break;
                }

                if(found) {
                    // Checking for red color
                    // If we check for the red color we can safely get if we got it or not
                    let idx = (x + (y + 222) * width) * 4;
                    if(array[idx] > 200 && array[idx + 1] < 100 && array[idx + 2] < 100) {
                        candidate = { x: x, y: y };
                        break;
                    }
                }
            }
        }

        if(candidate != null) break;
    }

    // Depending on how electron compresses the screen on a platform this value will be different !!!
    if(candidate) {
        settings.estimated_offset = {
            x: candidate.x - 117,
            y: candidate.y - 94,
        };
    }

    return candidate;
}

// TODO: Calculate what the max expected click rate would be.
// TODO: How to stop this stream?
// TODO: https://github.com/electron/electron/issues/23923
//       Implement electron.DesktopCapturer.SetSkipCursor(DesktopCapturerSource.id)
/**
 * This function is used to capture the game Rust and update information about the selected brushes.
 * This function should give values to the program and make sure that everything is set correctly before drawing..
 * 
 * @param {*} callback 
 */
function startCapture(callback) {
    const FRAME_RATE = 30;

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        function handleStream(stream) {
            const video = document.querySelector('video');
            video.srcObject = stream;
            video.onloadedmetadata = (e) => {
                video.play();

                // Create a new element that is not added to the document
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                setInterval(() => {
                    let size_change = false;
                    if(canvas.width != video.videoWidth || canvas.height != video.videoHeight) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;

                        video.style.width = video.videoWidth + 'px';
                        video.style.height = video.videoHeight + 'px';
                        canvas.style.width = video.videoWidth + 'px';
                        canvas.style.height = video.videoHeight + 'px';

                        size_change = true;
                        // Recalculate position of the colors
                    }
                    
                    context.drawImage(video, 0, 0);
                    if(size_change) {
                        estimatePanelPositionFromImage(
                            context.getImageData(0, 0, video.videoWidth, video.videoHeight),
                            video.videoWidth, video.videoHeight
                        );
                    }

                    // Start on HD screens (1770, 277)
                    // The size is 150 x 525
                    var imageData = context.getImageData(settings.estimated_offset.x, settings.estimated_offset.y, 150, 525).data;
                    settings.width = video.videoWidth;
                    settings.height = video.videoHeight;

                    for(let type_name in points) {
                        let selected = -1;
                        for(let index in points[type_name]) {
                            let point = points[type_name][index];
                            
                            let idx = (point.x + (point.y * 150)) * 4;
                            let r = imageData[idx    ];
                            let g = imageData[idx + 1];
                            let b = imageData[idx + 2];

                            if(r < 130 && b < 130 && g > 150) {
                                selected = parseInt(index);
                            }
                        }

                        if(selected != -1) {
                            let point = points[type_name][selected];

                            settings[type_name] = selected;
                        }
                    }
                    
                    if(callback) callback();
                }, 1000 / FRAME_RATE); // 20 fps
            }
        }

        for(const source of sources) {
            if(source.name === 'Rust') {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id,
                                maxFrameRate: FRAME_RATE,
                            }
                        }
                    });
                    handleStream(stream);
                } catch(e) {
                    handleError(e);
                }

                return true;
            }
        }

        return false;
    });
}

function checkCapture(callback) {
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        for(const source of sources) {
            if(source.name === 'Rust') {
                callback(true);
                return;
            }
        }
        
        callback(false);
        return;
    });
}



exports.move = move;
exports.click = click;
exports.checkMouse = checkMouse;
exports.setBrushSize = setBrushSize;
exports.setBrushShape = setBrushShape;
exports.setBrushOpacity = setBrushOpacity;
exports.setBrushColor = setBrushColor;
exports.getClosestColor = getClosestColor;
exports.setMouseDelay = setMouseDelay;
exports.checkCapture = checkCapture;
exports.startCapture = startCapture;
exports.settings = settings;