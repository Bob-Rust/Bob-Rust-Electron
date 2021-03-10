function makeDraggable(elm, callback) {
    elm.addEventListener('contextmenu', (e) => e.preventDefault())
    elm.addEventListener('pointerdown', (e) => {
        if(e.target != elm) return;
        elm.classList.add('drag-ui')
        elm.setPointerCapture(e.pointerId)
        if(callback && callback.down) callback.down(e)
    })
    elm.addEventListener('pointermove', (e) => {
        if(e.target != elm) return;
        if(elm.classList.contains('drag-ui')) {
            if(callback && callback.move) callback.move(e)
        }
    })
    elm.addEventListener('lostpointercapture', (e) => {
        elm.classList.remove('drag-ui')
        elm.releasePointerCapture(e.pointerId)
        if(callback && callback.up) callback.up(e)
    })
}

let drag_div = document.querySelector('#drag-div')
let drag_tl = document.querySelector('#drag-tl')
let drag_tr = document.querySelector('#drag-tr')
let drag_br = document.querySelector('#drag-br')
let drag_bl = document.querySelector('#drag-bl')

var rect = {
    x_min: 0,
    y_min: 0,
    x_max: 0,
    y_max: 0,
}
resetBoxRect()

function restrictRectangle(rect, area) {
    function clamp(value, min, max) { return value < min ? min:(value > max ? max:value) }
    let x_min = rect.x_min
    let x_max = rect.x_max
    let y_min = rect.y_min
    let y_max = rect.y_max

    if(x_min > x_max) { let tmp = x_min; x_min = x_max; x_max = tmp; }
    if(y_min > y_max) { let tmp = y_min; y_min = y_max; y_max = tmp; }

    return {
        x_min: clamp(x_min, area.x_min, area.x_max),
        x_max: clamp(x_max, area.x_min, area.x_max),
        y_min: clamp(y_min, area.y_min, area.y_max),
        y_max: clamp(y_max, area.y_min, area.y_max),
    };
}

{
    let drag_start_x, drag_start_y
    makeDraggable(drag_div, {
        down: function(e) {
            drag_start_x = rect.x_min - e.clientX
            drag_start_y = rect.y_min - e.clientY
        },
        move: function(e) {
            let tx = (drag_start_x + e.clientX) - rect.x_min
            let ty = (drag_start_y + e.clientY) - rect.y_min
            rect.x_min += tx
            rect.x_max += tx
            rect.y_min += ty
            rect.y_max += ty
            updateBoxStyle()
        },
        up: updateDragBoxEnd
    })
}

makeDraggable(drag_tl, { move: (e) => updateDragBox(e.clientX, e.clientY, true , true ), up: updateDragBoxEnd })
makeDraggable(drag_tr, { move: (e) => updateDragBox(e.clientX, e.clientY, false, true ), up: updateDragBoxEnd })
makeDraggable(drag_br, { move: (e) => updateDragBox(e.clientX, e.clientY, false, false), up: updateDragBoxEnd })
makeDraggable(drag_bl, { move: (e) => updateDragBox(e.clientX, e.clientY, true , false), up: updateDragBoxEnd })

function updateDragBox(x, y, x_field, y_field) {
    if(x_field) rect.x_min = x; else rect.x_max = x
    if(y_field) rect.y_min = y; else rect.y_max = y
    updateBoxStyle()
}

function updateDragBoxEnd() {
    rect = restrictRectangle(rect, {
        x_min: 8,
        x_max: window.innerWidth - 8,
        y_min: 29,
        y_max: window.innerHeight - 8
    })
    updateBoxStyle()
    
    window.Rust.setDrawingArea(rect)
}

function resetBoxRect() {
    rect.x_min = (window.innerWidth - 100) / 2
    rect.x_max = rect.x_min + 100
    rect.y_min = (window.innerHeight - 100) / 2
    rect.y_max = rect.y_min + 100
    updateBoxStyle()
}

function updateBoxStyle() {
    let r = restrictRectangle(rect, {
        x_min: 8,
        x_max: window.innerWidth - 8,
        y_min: 29,
        y_max: window.innerHeight - 8
    })

    drag_div.style.left = r.x_min + 'px'
    drag_div.style.top = r.y_min + 'px'
    drag_div.style.width = (r.x_max - r.x_min) + 'px'
    drag_div.style.height = (r.y_max - r.y_min) + 'px'
}