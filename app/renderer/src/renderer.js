let isMaximized = false
var titlebar = document.querySelector('#titlebar')

document.querySelector('#btnClose').addEventListener('click', (e) => {
    window.Access.close()
})

var _paletteDiv = document.querySelector('#palette')
var _dragDiv = document.querySelector('#drag-div')
var btnSize = document.querySelector('#btnSize')
btnSize.addEventListener('click', (e) => {
    isMaximized = !isMaximized

    if(isMaximized) {
        window.Access.maximize()
        window.Access.setResizable(false)
        btnSize.classList.remove('size-button-max')
        btnSize.classList.add('size-button-min')
        titlebar.classList.add('drag-titlebar')
        document.body.classList.add('body-transparent')
        
        _paletteDiv.classList.remove('hidden')
        _dragDiv.classList.remove('hidden')
    } else {
        window.Access.minimize()
        window.Access.setResizable(true)
        btnSize.classList.remove('size-button-min')
        btnSize.classList.add('size-button-max')
        titlebar.classList.remove('drag-titlebar')
        document.body.classList.remove('body-transparent')

        _paletteDiv.classList.add('hidden')
        _dragDiv.classList.add('hidden')
    }
})

var menu = document.querySelector('#menu')
document.querySelector('#btnMenu').addEventListener('click', (e) => {
    if(menu.style.opacity != '1') {
        menu.style.opacity = '1'
    } else {
        menu.style.opacity = '0'
    }
})

let drag_update;
makeDraggable(titlebar, {
    down: function(e) {
        if(!isMaximized) return;
        if(drag_update) clearInterval(drag_update)
        drag_update = setInterval(window.Access.tryMoveWindowToCursorMonitor, 100)
    },
    up: function(e) {
        clearInterval(drag_update)
        drag_update = null
    }
})

document.querySelector('#btnMenuReset').addEventListener('click', (e) => {
    resetBoxRect()
})