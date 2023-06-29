// adjust 范围都是-100 100
const canvasFilter = {
    brightness(adjust, r, g, b) {
        adjust = Math.floor(120 * (adjust / 100)) // 全黑的话 就彻底看不见了  255 修改为180
        return {
            r: r + adjust,
            g: g + adjust,
            b: b + adjust
        }
    },
    exposure(adjust, r, g, b) {

    },
    contrast(adjust, r, g, b) {
        adjust /= 5
        adjust = Math.pow((adjust + 100) / 100, 2)
        r /= 255
        r -= 0.5
        r *= adjust
        r += 0.5
        r *= 255
        g /= 255
        g -= 0.5
        g *= adjust
        g += 0.5
        g *= 255
        b /= 255
        b -= 0.5
        b *= adjust
        b += 0.5
        b *= 255
        return { r, g, b }
    }
}
export default canvasFilter
