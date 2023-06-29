/**
 * rgb convert hex
 * @param {rbg对象} param0
 * @param {是否转大写} toUpper
 */
function rgb2hex({ r, g, b }, toUpper) {
    const change = val => ('0' + Number(val).toString(16)).slice(-2)
    const color = `#${change(r)}${change(g)}${change(b)}`
    return toUpper ? color.toUpperCase() : color
}

/**
 * hex convert rgba
 * @param {hex} hex
 */
function hex2rgba(hex) {
    hex = hex.slice(1)
    const change = val => parseInt(val, 16) || 0 // 避免NaN的情况
    return {
        r: change(hex.slice(0, 2)),
        g: change(hex.slice(2, 4)),
        b: change(hex.slice(4, 6)),
        a: 1
    }
}

/**
 * rgb convert rgba
 * @param {rgba} rgba
 */
function rgb2rgba(rgba) {
    if (typeof rgba === 'string') {
        rgba = (/rgba?\((.*?)\)/.exec(rgba) || ['', '0,0,0,1'])[1].split(',')
        return {
            r: Number(rgba[0]) || 0,
            g: Number(rgba[1]) || 0,
            b: Number(rgba[2]) || 0,
            a: Number(rgba[3] ? rgba[3] : 1) // 避免为0的情况
        }
    } else {
        return rgba
    }
}

/**
 * rgb convert hsv
 * @param {rgb} rgb
 */
function rgb2hsv({ r, g, b }) {
    r = r / 255
    g = g / 255
    b = b / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    let h = 0
    if (max === min) {
        h = 0
    } else if (max === r) {
        if (g >= b) {
            h = 60 * (g - b) / delta
        } else {
            h = 60 * (g - b) / delta + 360
        }
    } else if (max === g) {
        h = 60 * (b - r) / delta + 120
    } else if (max === b) {
        h = 60 * (r - g) / delta + 240
    }
    h = Math.floor(h)
    const s = parseFloat((max === 0 ? 0 : 1 - min / max).toFixed(2))
    const v = parseFloat(max.toFixed(2))
    return { h, s, v }
}

export default {
    rgb2hex,
    hex2rgba,
    rgb2rgba,
    rgb2hsv
}
