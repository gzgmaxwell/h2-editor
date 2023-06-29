export default function (src, width, height) {
    if (!src) {
        return ''
    }

    if (!width) {
        return src
    }

    // ico和svg的图片七牛不支持
    if (/\.(ico|svg)$/i.test(src.split('?')[0])) {
        return src
    }

    if (!height) {
        height = width
    }

    const obj = setWidthAndHeight(width, height)

    // todo 如果计算后的宽高大于原图的宽高，可以优化不调用七牛接口
    const thumbnail = 'imageMogr2/auto-orient/thumbnail/' + Math.round(obj.width) + 'x' + Math.round(obj.height) + '>'

    if (/\?imageMogr2/.test(src)) {
        // 已处理过的图片加缩略图
        src += '|' + thumbnail
    } else if (/\?watermark/.test(src)) {
        // 未处理过的图片加缩略图
        src += '|' + thumbnail
    } else {
        // 未处理过的图片加缩略图
        src += '?' + thumbnail
    }

    // if (util.isSupportWebp) {
    //     src += '/format/webp'
    // }

    return encodeURI(src)
}

/**
 * 设置宽高
 * @param {*} width
 * @param {*} height
 */
function setWidthAndHeight(width, height) {
    // devicePixelRatio用来判断retina，但不是所有浏览器都支持
    const pixelRatio = window.devicePixelRatio || 1
    width = parseInt(width)
    height = parseInt(height)
    if (width && height) {
        width *= pixelRatio
        height *= pixelRatio
    } else {
        width *= pixelRatio
        height = width
    }

    // width和height限制最大值
    const max = 9999 // 七牛能处理的最大像素
    if (width > height) {
        if (width > max) {
            height *= 1 - ((width - max) / width)
            width = max
        }
    } else if (width < height) {
        if (height > max) {
            width *= 1 - ((height - max) / height)
            height = max
        }
    } else {
        if (width > max) {
            width = height = max
        }
    }
    return {
        width: width,
        height: height
    }
}
