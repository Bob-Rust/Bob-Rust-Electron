const { readFileSync } = require('fs')

const DEFAULT_SHAPE = 1;
const DEFAULT_OPACITY = 2;

// INFO: 'readline' does not work because sometimes it stops working randomly and
//                  does not read the file until another file has been loaded.
async function parseBorstFile(path) {
    try {
        const lines = readFileSync(path, 'utf8').split('\n')

        let data = {
            width: 0,
            height: 0,
            instructions: [],
        }

        let hasHeader = false
        for(let line in lines) {
            line = lines[line].trim()
            if(!hasHeader) {
                let parts = line.split(',')
                data.width = parseInt(parts[0])
                data.height = parseInt(parts[1])
                hasHeader = true
                continue;
            }

            let parts = line.split(',')
            data.instructions.push({
                x: parseFloat(parts[0]),
                y: parseFloat(parts[1]),
                size: parseInt(parts[2]),
                color: parseInt(parts[3], 16),
                opacity: DEFAULT_OPACITY,
                shape: DEFAULT_SHAPE,
            })
        }

        return data
    } catch(e) {
        throw e;
    }
}

/**
 * Convert a image into a borst file
 * @param {String} path
 */
async function parseImageFile(path, settings) {
    // TODO: Use the godot file to generate the target image!

    let data = {
        width: 0,
        height: 0,
        instructions: [],
    }

    return data
}

exports.parseBorstFile = parseBorstFile
exports.parseImageFile = parseImageFile