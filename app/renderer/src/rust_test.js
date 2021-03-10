let texturePath;

document.querySelector('#btnMenuSetTexture').addEventListener('click', (e) => {
    let result = window.Access.openTextureDialog()

    result.then((value) => {
        if(!value.canceled) {
            texturePath = value.filePaths[0]
        }
    })
})

let btnStartDrawing = document.querySelector('#btnMenuStart');
btnStartDrawing.addEventListener('click', (e) => {
    btnStartDrawing.disabled = true
    window.Rust.startDrawing(texturePath).then(() => {
        btnStartDrawing.disabled = false
    }).catch((err) => {
        btnStartDrawing.disabled = false
    })
})

{
    let est_x = 0
    let est_y = 0
    window.Rust.startCapture(() => {
        // console.log('-------------------')
        // console.log('size: ' + window.Rust.getSize())
        // console.log('shape: ' + window.Rust.getShape())
        // console.log('opacity: ' + window.Rust.getOpacity())

        var paletteDiv = document.querySelector('#palette')
        let settings = window.Rust.getInfoSettings()

        if(est_x != settings.estimated_offset.x || est_y != settings.estimated_offset.y) {
            est_x = settings.estimated_offset.x;
            est_y = settings.estimated_offset.y;
            paletteDiv.style.left = (est_x) + 'px';
            paletteDiv.style.top = (est_y - 20) + 'px';

        }

    })
}