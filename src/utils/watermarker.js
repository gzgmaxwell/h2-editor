/**
 * 添加水印
 * @param {*} $el 水印canvas
 * @param {*} width 宽
 * @param {*} height 高
 */
function add($el, width, height) {
    const ctx = $el.getContext('2d')
    const ctxWidth = width * 2
    const ctxHeight = height * 2
    $el.width = ctxWidth
    $el.height = ctxHeight
    const minDistance = Math.min(ctxWidth / 2, ctxHeight / 2)
    const column = Math.ceil(ctxWidth / minDistance)
    const row = Math.ceil(ctxHeight / minDistance)
    const fontSize = Math.floor(Math.sqrt(2 * minDistance * minDistance) / 7)
    const center = minDistance / 2
    ctx.font = `${fontSize}px sans-serif`
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let i = 0; i < row; i++) {
        for (let j = 0; j < column; j++) {
            ctx.translate(center + minDistance * j, center + minDistance * i)
            ctx.rotate(45 * Math.PI / 180)
            ctx.fillText('易企秀轻设计', 0, 0)
            ctx.rotate(-45 * Math.PI / 180)
            ctx.translate(-(center + minDistance * j), -(center + minDistance * i))
        }
    }
}

/**
 * 导出水印
 * @param {*} width 宽
 * @param {*} height 高
 */
function getURL(width, height) {
    const text = '易企秀轻设计'
    const $canvas = document.createElement('canvas')
    const ctx = $canvas.getContext('2d')
    const ctxWidth = width * 2
    const ctxHeight = height * 2
    $canvas.width = ctxWidth
    $canvas.height = ctxHeight
    const minDistance = Math.min(ctxWidth / 2, ctxHeight / 2)
    const column = Math.ceil(ctxWidth / minDistance)
    const row = Math.ceil(ctxHeight / minDistance)
    const fontSize = Math.floor(Math.sqrt(2 * minDistance * minDistance) / 8)
    const center = minDistance / 2
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let i = 0; i < row; i++) {
        for (let j = 0; j < column; j++) {
            ctx.translate(center + minDistance * j, center + minDistance * i)
            ctx.rotate(45 * Math.PI / 180)
            ctx.lineWidth = 6
            ctx.font = `${fontSize}px fangzheng_zyjt_pre`
            ctx.strokeStyle = 'rgba(0,0,0,0.10)'
            ctx.strokeText(text, 0, 0)
            ctx.font = `${fontSize}px fangzheng_zyjt_pre`
            ctx.fillStyle = 'rgba(255,255,255,0.15)'
            ctx.fillText(text, 0, 0)
            ctx.rotate(-45 * Math.PI / 180)
            ctx.translate(-(center + minDistance * j), -(center + minDistance * i))
        }
    }
    return $canvas.toDataURL('image/png')
}

/**
 * 清除水印
 * @param {*} $el 水印canvas
 * @param {*} width 宽
 * @param {*} height 高
 */
function clear($el, width, height) {
    const ctx = $el.getContext('2d')
    ctx.clearRect(0, 0, width * 2, height * 2)
}

/**
 * logo水印
 * @param {*} width 画布的宽
 * @param {*} height 画布的高
 * @param {*} bleed 出血线
 */
function logoMark(img, width, height, bleed = 0) {
    const bleedpx = Vue.filter('mm2px')(bleed)
    const realWidth = parseInt(128 * 2 * width / 640)
    const realHeight = parseInt(24 * 2 * realWidth / 256)
    const $canvas = document.createElement('canvas')
    const ctx = $canvas.getContext('2d')
    const ctxWidth = width * 2
    const ctxHeight = height * 2
    $canvas.width = ctxWidth
    $canvas.height = ctxHeight
    if (img) {
        ctx.globalAlpha = 0.8
        ctx.drawImage(img, ctxWidth - realWidth * 2 - 14 * 2 - bleedpx * 2, ctxHeight - realHeight * 2 - 14 * 2 - bleedpx * 2, realWidth * 2, realHeight * 2)
    }

    return $canvas.toDataURL('image/png')
}

/**
 * logo水印添加到canvas图片上
 * @param {*} pCanvas canvas
 * @param {*} pImageFormat 格式
 * @param {*} bleed 出血线
 */
function logoMarkToImage(pCanvas, pImageFormat, img) {
    return new Promise((resolve, reject) => {
        const realWidth = parseInt(128 * 2 * pCanvas.width / 640)
        const realHeight = parseInt(24 * 2 * realWidth / 256)
        const ctx = pCanvas.getContext('2d')
        const ctxWidth = pCanvas.width
        const ctxHeight = pCanvas.height
        if (img) {
            ctx.globalAlpha = 0.8
            ctx.drawImage(img, ctxWidth - realWidth - 14, ctxHeight - realHeight - 14, realWidth, realHeight)
        }
        const base64Str = pCanvas.toDataURL(pImageFormat, 1.0).split(',')[1]
        resolve(base64Str)
    })
}

export default {
    add,
    clear,
    getURL,
    logoMark,
    logoMarkToImage
}
