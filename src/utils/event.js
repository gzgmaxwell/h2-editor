const hasTouch = 'ontouchstart' in document

let event = null

if (hasTouch) {
    event = {
        MOUSE_DOWN: 'touchstart',
        MOUSE_MOVE: 'touchmove',
        MOUSE_UP: 'touchend'
    }
} else {
    event = {
        MOUSE_DOWN: 'mousedown',
        MOUSE_MOVE: 'mousemove',
        MOUSE_UP: 'mouseup'
    }
}

// // 阻止ios回弹
// window.addEventListener('scroll.elasticity', function (e) {
//     e.preventDefault()
// })
// window.addEventListener('touchmove.elasticity', function (e) {
//     e.preventDefault()
// })
// window.addEventListener('wheel', function (e) {
//     e.preventDefault()
// })

export {
    hasTouch,
    event
}
