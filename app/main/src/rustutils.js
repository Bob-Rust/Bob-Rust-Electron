const { contextBridge, desktopCapturer, ipcRenderer } = require('electron');
const info = require('./util/rustinfo.js');
const borst = require('./util/borst.js');

/**
 * The validation points relative to the painting panel in rust.
 */
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

const area = {
    x_min: 0,
    x_max: 0,
    y_min: 0,
    y_max: 0,
};

const settings = {
    size: 0,
    shape: 0,
    opacity: 0,
};

contextBridge.exposeInMainWorld('Rust', {
    getSize: () => settings.size,
    getShape: () => settings.shape,
    getOpacity: () => settings.opacity,
    checkCapture: (callback) => {
        info.checkCapture(callback);
    },
    startCapture: (callback) => {
        info.startCapture(callback);
    },
    startDrawing: async (path) => {
        return startDrawing(path);
    },
    setDrawingArea: (rect) => {
        area.x_min = rect.x_min;
        area.x_max = rect.x_max;
        area.y_min = rect.y_min;
        area.y_max = rect.y_max;
    },
    getInfoSettings: () => {
        return info.settings;
    }
});

async function startDrawing(path) {
    if(path == null) {
        // TODO: Create a modal that tells the user that no texture has been selected!
        alert('No texture selected');
        return;
    }

    let method = null;
    if(path.endsWith('.borst')) {
        method = borst.parseBorstFile;
    } else {
        method = borst.parseImageFile;
    }

    if(method) {
        console.log('---------------------------------------');
        console.log('Start Drawing From Path: ' + path);

        let promise = method(path).then(startDrawingImage).catch((err) => {
            console.warn(err);
            ipcRenderer.invoke('setIgnoreMouseEvents', false);
        });

        await promise;
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// TODO: Make sure we cannot press anywhere else then Rust.. Otherwise it could cause bad things to happen..
async function startDrawingImage(data) {
    ipcRenderer.invoke('setIgnoreMouseEvents', true);

    // TODO: Better placement of the image
    let width = Math.max(data.width, data.height);
    let height = Math.max(data.width, data.height);
    let xo = (width - data.width) / 2;
    let yo = (height - data.height) / 2;

    let area_x = area.x_min;
    let area_y = area.y_min;
    let area_width = area.x_max - area.x_min;
    let area_height = area.y_max - area.y_min;

    // Default delay is 10 ms
    info.setMouseDelay(30);
    
    // Calculate the speed
    /* Make sure the game has focus */ {
        let failed = 0;
        while(settings.size != 0) {
            info.setBrushSize(0);
            if(failed++ > 10) break;
            await sleep(10);
        } failed = 0;

        while(settings.size != 1) {
            info.setBrushSize(1);
            if(failed++ > 10) break;
            await sleep(10);
        }
    }

    // Convert instruction color into index
    for(let inst in data.instructions) {
        inst = data.instructions[inst];
        inst.color = info.getClosestColor(inst.color).index;
    }

    {
        let inst = data.instructions[0];
        info.setBrushSize(inst.size);
        info.setBrushShape(inst.shape);
        info.setBrushOpacity(1);
        info.setBrushColor(inst.color);
    }

    /*
    {
        info.setBrushSize(5);
        info.setBrushShape(3);
    }

    for(i = 0; i < 16; i++) {
        info.setBrushColor(i + ((i > 10) ? 4:0));

        for(j = 0; j < 6; j++) {
            await sleep(15);
            info.setBrushOpacity(5 - j);

            let tx = area_x + ((i + 0.5) / 16) * area_width;
            let ty = area_y + ((j + 0.5) / 16) * area_height;
            info.move(tx, ty);
            await sleep(15);
            await info.checkMouse(tx, ty);
            info.click();
        }
    }

    if(true) {
        ipcRenderer.invoke('setIgnoreMouseEvents', false);
        return;
    }
    */

    let last_size = -1;
    let last_color = -1;
    for(i = 0; i < Math.min(10000, data.instructions.length); i++) {
        let inst = data.instructions[i];

        if(last_size != inst.size) {
            info.setBrushSize(inst.size);
            last_size = inst.size;
        }

        if(last_color != inst.color) {
            info.setBrushColor(inst.color);
            last_color = inst.color;
        }


        let tx = area_x + ((inst.x + xo) / width) * area_width;
        let ty = area_y + ((inst.y + yo) / height) * area_height;
        info.move(tx, ty);
        await sleep(15);
        await info.checkMouse(tx, ty);
        info.click();

        if((i % 10) == 0) {
            console.log(i + '/' + data.instructions.length);
        }
    }

    ipcRenderer.invoke('setIgnoreMouseEvents', false);
}