let isMaximized = false
var titlebar = document.querySelector('#titlebar')
document.querySelector('#btnClose').addEventListener('click', (e) => {
    window.Access.close()
})

var _dragDiv = document.querySelector('#drag-div')
var btnSize = document.querySelector('#btnSize')
var contents_minimized = document.querySelector('#minimized')
var contents_maximized = document.querySelector('#maximized')
btnSize.addEventListener('click', (e) => {
    isMaximized = !isMaximized

    if(isMaximized) {
        window.Access.maximize()
        btnSize.classList.remove('size-button-min')
        btnSize.classList.add('size-button-max')
        titlebar.classList.add('drag-titlebar')
        document.body.classList.add('body-transparent')

        contents_maximized.style.display = ''
        contents_minimized.style.display = 'none'
        _dragDiv.classList.remove('hidden')
    } else {
        window.Access.minimize()
        btnSize.classList.remove('size-button-max')
        btnSize.classList.add('size-button-min')
        titlebar.classList.remove('drag-titlebar')
        document.body.classList.remove('body-transparent')

        contents_maximized.style.display = 'none'
        contents_minimized.style.display = ''
        _dragDiv.classList.add('hidden')
    }
})

// TODO: Tell the player that no window "Rust" was found
// TODO: Make sure that "Rust" is the active window while drawing
var menu = document.querySelector('#menu')
document.querySelector('#btnMenu').addEventListener('click', (e) => {
    window.Rust.checkCapture((enabled) => {
        btnMenuStart.disabled = !enabled
    })

    if(menu.classList.contains('menu-hidden')) {
        menu.classList.remove('menu-hidden')
    } else {
        menu.classList.add('menu-hidden')
    }
})


let drag_update;
ResizableBox.makeDraggable(titlebar, {
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
    draggable_div.resetBoxRect()
})


{
    var draggable_div = new ResizableBox(document.querySelector('#drag-div'), () => {
        window.Rust.setDrawingArea(draggable_div.area)
    })
    var rect = draggable_div.area
}

{
    let list = document.getElementsByTagName('a')
    for(i = 0; i < list.length; i++) {
        let item = list.item(i)

        item.addEventListener('click', (e) => {
            e.preventDefault()
            window.Access.openBrowserLink(item.href)
        })
    }
}