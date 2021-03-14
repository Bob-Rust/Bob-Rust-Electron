/**
 * Implementation of a movable and scalable rectangle
 * 
 * Example
 * 
 * ```
 * let draggable = new ResizableBox(element, () => {
 *     // Called when the box area is updated
 * })
 * ```
 */

class ResizableBox {
    static makeDraggable(elm, callback) {
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
    
    static restrictRectangle(rect, area) {
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

    
    constructor(elm, callback) {
        this.drag_div = elm
        this.drag_div.classList.add('drag-box-div')

        this.drag_tl = document.createElement('div')
        this.drag_tl.classList.add('drag-box-tl')
        elm.appendChild(this.drag_tl)

        this.drag_tr = document.createElement('div')
        this.drag_tr.classList.add('drag-box-tr')
        elm.appendChild(this.drag_tr)

        this.drag_br = document.createElement('div')
        this.drag_br.classList.add('drag-box-br')
        elm.appendChild(this.drag_br)

        this.drag_bl = document.createElement('div')
        this.drag_bl.classList.add('drag-box-bl')
        elm.appendChild(this.drag_bl)

        this.rect = {
            x_min: 0,
            y_min: 0,
            x_max: 0,
            y_max: 0,
        }
        this.drag_start_x = 0
        this.drag_start_y = 0
        this.callback = callback

        this.init()
        this.resetBoxRect()
    }

    init() {
        ResizableBox.makeDraggable(this.drag_div, {
            down: (e) => {
                this.drag_start_x = this.rect.x_min - e.clientX
                this.drag_start_y = this.rect.y_min - e.clientY
            },
            move: (e) => {
                let tx = (this.drag_start_x + e.clientX) - this.rect.x_min
                let ty = (this.drag_start_y + e.clientY) - this.rect.y_min
                this.rect.x_min += tx
                this.rect.x_max += tx
                this.rect.y_min += ty
                this.rect.y_max += ty
                this.updateBoxStyle()
            },
            up: (e) => this.updateDragBoxEnd()
        })

        ResizableBox.makeDraggable(this.drag_tl, { move: (e) => this.updateDragBox(e.clientX, e.clientY, true , true ), up: (e) => this.updateDragBoxEnd() })
        ResizableBox.makeDraggable(this.drag_tr, { move: (e) => this.updateDragBox(e.clientX, e.clientY, false, true ), up: (e) => this.updateDragBoxEnd() })
        ResizableBox.makeDraggable(this.drag_br, { move: (e) => this.updateDragBox(e.clientX, e.clientY, false, false), up: (e) => this.updateDragBoxEnd() })
        ResizableBox.makeDraggable(this.drag_bl, { move: (e) => this.updateDragBox(e.clientX, e.clientY, true , false), up: (e) => this.updateDragBoxEnd() })
    }

    updateDragBox(x, y, x_field, y_field) {
        if(x_field) this.rect.x_min = x; else this.rect.x_max = x
        if(y_field) this.rect.y_min = y; else this.rect.y_max = y
        this.updateBoxStyle()
    }

    updateDragBoxEnd() {
        this.rect = ResizableBox.restrictRectangle(this.area, {
            x_min: 8,
            x_max: window.innerWidth - 8,
            y_min: 28,
            y_max: window.innerHeight - 8
        })
        this.updateBoxStyle()

        if(this.callback) this.callback()
    }

    resetBoxRect() {
        this.rect.x_min = (window.innerWidth - 100) / 2
        this.rect.x_max = this.rect.x_min + 100
        this.rect.y_min = (window.innerHeight - 100) / 2
        this.rect.y_max = this.rect.y_min + 100
        this.updateBoxStyle()
    }

    updateBoxStyle() {
        let r = ResizableBox.restrictRectangle(this.area, {
            x_min: 8,
            x_max: window.innerWidth - 8,
            y_min: 28,
            y_max: window.innerHeight - 8
        })
        
        this.drag_div.style.left = r.x_min + 'px'
        this.drag_div.style.top = r.y_min + 'px'
        this.drag_div.style.width = (r.x_max - r.x_min) + 'px'
        this.drag_div.style.height = (r.y_max - r.y_min) + 'px'
    }
    
    get area() {
        return this.rect
    }
};