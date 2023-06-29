import { host } from '../config/env'

/**
 * 根据相对路径获取绝对路径
 * @param {*} src
 */
function getAbsoluteUrl(src) {
    if (src.indexOf('base64') >= 0 || src.indexOf('http') >= 0 || src.indexOf('//') >= 0) {
        return src
    }
    return host.file + src
}

/**
 * 获取图片的原生数据
 * @param {*} src
 */
function image(src) {
    const deferred = window.Defer()
    const image = new Image()
    image.crossOrigin = 'anonymous'

    image.onload = () => {
        deferred.resolve(image)
    }

    image.onerror = () => {
        deferred.reject()
    }

    image.src = getAbsoluteUrl(src)

    return deferred.promise
}

/**
 * 获取svg的原生数据
 * @param {*} src
 */
function svg(src) {
    return axios.get(getAbsoluteUrl(src), {
        withCredentials: false,
        ignoreInterceptor: true
    })
        .then(function (res) {
            const random = Date.now() // 使用时间戳避免class、id重复
            const data = res.data
                .replace(/st\d+/g, w => w + random)
                .replace(/\(#(.*?)\)/g, (w1, w2) => `(#${w2 + random})`)
                .replace(/id="(.*?)"/g, (w1, w2) => `id="${w2 + random}"`)
            const $div = document.createElement('div')
            $div.innerHTML = data
            const $svg = $div.querySelector('svg')
            const width = $svg.attr('width')
            const height = $svg.attr('height')
            if (!width || !height) {
                const viewBox = $svg.attr('viewBox')
                const viewBoxArr = viewBox.split(' ')
                $svg.attr({
                    width: viewBoxArr[2],
                    height: viewBoxArr[3]
                })
            }
            return $svg
        })
}

export default {
    image,
    svg
}
