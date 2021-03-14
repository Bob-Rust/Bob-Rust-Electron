document.querySelector('#btnClose').addEventListener('click', (e) => window.Access.close())
document.querySelector('#btnSize').addEventListener('click', (e) => window.Access.minimize())

// TODO: Tell the player that no window "Rust" was found
// TODO: Make sure that "Rust" is the active window while drawing
/*
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
*/

var titlebar = document.querySelector('#titlebar')

let drag_update;
ResizableBox.makeDraggable(titlebar, {
    down: function(e) {
        if(drag_update) clearInterval(drag_update)
        drag_update = setInterval(window.Access.tryMoveWindowToCursorMonitor, 100)
    },
    up: function(e) {
        clearInterval(drag_update)
        drag_update = null
    }
})

var drag_div = document.querySelector('#drag-div')
{
    var draggable_div = new ResizableBox(drag_div, () => {
        window.Rust.setDrawingArea(draggable_div.area)
    })
    var rect = draggable_div.area
}

document.querySelector('#btnMenuReset').addEventListener('click', (e) => {
    draggable_div.resetBoxRect()
})

document.querySelector('#toolCanvas').addEventListener('click', (e) => {
    drag_div.classList.remove('hidden')
    document.body.style.backgroundColor = '#0001'
})

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