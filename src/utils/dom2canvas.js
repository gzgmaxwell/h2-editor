let fontFacesObj = null
let imagesObj = null
let options = null

/**
 * 对外公开的方法
 * @param element
 */
function dom2canvas(element, args = {}) {
    fontFacesObj = {}
    imagesObj = {}
    options = Object.assign({
        backgroundColor: '',
        scale: 1
    }, args)

    element.style.backgroundColor = options.backgroundColor

    return loopNode(element)
        .then(() => setFontFace())
        .then(() => Promise.all([font2Base64(), img2Base64()]))
        .then(() => html2string(element))
        .then(res => svg2canvas(res))
}

/**
 * 循环dom，处理特殊情况
 * @param {*} node
 * @param {*} options
 */
function loopNode(node) {
    const promises = []

    const loop = (node) => {
        const style = getComputedStyle(node)
        // chrome下background能获取到，火狐下需要backgroundImage
        const { fontFamily, backgroundImage } = style
        const src = node.getAttribute('xlink:href') || node.getAttribute('src')
        // node.style.cssText = style.cssText
        // node.style.setProperty('-webkit-text-fill-color', node.style.color)
        if (fontFamily) {
            fontFacesObj[fontFamily] = true
        }
        if (backgroundImage && // 背景存在
            backgroundImage.search(getUrlReg()) !== -1 && // 检测到http字符串
            backgroundImage.search(getBase64Reg()) === -1) { // 未能匹配url("data:image/png;base64,xxxxxxxxxxx")
            const key = backgroundImage.match(getUrlReg())[0]
            const value = Vue.store.state.scene.cacheImage[key]
            if (value && value !== null && value.length > 0) {
                imagesObj[key] = value
            } else {
                imagesObj[key] = null
            }
        }
        if (src && src.startsWith('http')) { // base64 图片不用下载
            const key = src.match(getUrlReg())[0]
            const value = Vue.store.state.scene.cacheImage[key]
            if (value && value !== null && value.length > 0) {
                imagesObj[key] = value
            } else {
                imagesObj[key] = null
            }
        }
        if (node.tagName === 'CANVAS') {
            promises.push(
                loadImage(node.toDataURL())
                    .then(img => {
                        img.style.cssText = node.style.cssText
                        node.parentElement.insertBefore(img, node)
                        node.parentElement.removeChild(node)
                    })
            )
        }
        Array.from(node.children).forEach(item => loop(item))
    }
    loop(node)
    return Promise.all(promises)
}

/**
 * 设置字体的样式
 */
function setFontFace() {
    const cssRules = []
    Array.from(document.styleSheets).forEach(item => {
        if (item.ownerNode.tagName === 'STYLE') {
            cssRules.push(...Array.from(item.cssRules))
        }
    })
    cssRules.forEach(item => {
        if (item.type === CSSRule.FONT_FACE_RULE) {
            // firefox用style.fontFamily取不到值，用现在这个方法下会有双引号，所有要去掉
            // item.style不一定都有值，所以要先判断item.type
            const fontFamily = item.style.getPropertyValue('font-family').replace(/"/g, '')
            if (fontFacesObj[fontFamily]) {
                fontFacesObj[fontFamily] = item.style.getPropertyValue('src').match(getUrlReg())[0]
            }
        }
    })
    return Promise.resolve()
}

/**
 * 获取图片的url
 */
function getUrlReg() {
    return /http[^"]*/
}

function getBase64Reg() {
    return '^url\\("data:image/(png|jpeg|gif|svg+xmlsvg-xml);base64,(\\w|\\/|\\+|=)*"\\)$'
}

/**
 * 将文字url转换为base64存起来
 * @param urls
 */
function font2Base64() {
    const promises = []
    for (const key in fontFacesObj) {
        if (fontFacesObj[key] === true) continue
        (key => {
            promises.push(
                ajax2Blob(fontFacesObj[key])
                    .then(blob => blob2base64(blob))
                    .then(base64 => { fontFacesObj[key] = base64 })
            )
        })(key)
    }
    return Promise.all(promises)
}

/**
 * 将图片url转换为base64存起来
 * @param urls
 */
function img2Base64() {
    const promises = []
    for (const key in imagesObj) {
        if (imagesObj[key] === null) {
            (key => {
                promises.push(
                    ajax2Blob(key)
                        .then(blob => blob2base64(blob))
                        .then(base64 => {
                            Vue.store.commit('CACHE_IMAGE', { key: key, value: base64 })
                            imagesObj[key] = base64
                        })
                )
            })(key)
        }
    }
    return Promise.all(promises)
}

/**
 * 通过ajax将图片和文字url转换为二进制blob
 * @param url
 */
function ajax2Blob(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('get', url, true)
        xhr.responseType = 'blob'
        xhr.onload = () => {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                resolve(xhr.response)
            }
        }
        xhr.onerror = () => {
            reject()
        }
        xhr.send()
    })
}

/**
 * 将html转换为字符串
 * @param {*} element
 */
function html2string(element) {
    const width = parseFloat(element.style.width)
    const height = parseFloat(element.style.height)
    const fonts = []
    let html = (new XMLSerializer()).serializeToString(element)

    // chrome下虽然能渲染background-clip，但通过代码无法渲染，所以需要加-webkit-
    // 360浏览器10版本下直接就是-webkit-background-clip，不需要替换
    html = html.replace(/\sbackground-clip/g, ' -webkit-background-clip')
    // html = html.replace(/-webkit-text-fill-color/g, '-webkit-background-clip: text; -webkit-text-fill-color')

    // 处理图片
    for (const key in imagesObj) {
        // 创建正则对象时，?未被转义，所以需要自己转义
        let url = key.replace('?', '\\?')
        url = url.replace(new RegExp('\\|', 'g'), '\\|')
        // 替换图片地址加上前后的引号 防止地址部分相同导致会替换多个的问题
        if (new RegExp(`&quot;${url}&quot;`, 'g').test(html)) {
            // background: url(&quot;[url]&quot;) 图片作为背景属性
            html = html.replace(new RegExp(`&quot;${url}&quot;`, 'g'), `&quot;${imagesObj[key]}&quot;`)
        } else {
            // <img src="[url]"/> 图片直接当做图片使用
            html = html.replace(new RegExp(`"${url}"`, 'g'), `"${imagesObj[key]}"`)
        }
    }

    // 处理字体
    for (const key in fontFacesObj) {
        if (typeof fontFacesObj[key] !== 'string') continue
        fonts.push(`@font-face {font-family: ${key}; src: url(${fontFacesObj[key]});}`)
    }
    html = `<style>${fonts.join('')}</style>${html}`
    return Promise.resolve({
        html,
        width,
        height
    })
}

/**
 * 将 html 转换成svg，再将 svg 转换成 canvas
 * @param html
 */
function svg2canvas({ html, width, height }) {
    const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`
    // const svg = 'data:image/svg+xml;charset=utf-8,' + data
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' })
    // const url = URL.createObjectURL(blob)

    return blob2base64(blob)
        .then(base64 => loadImage(base64))
        // .loadImage(url) // chrome下这种方式会报canvas被污染
        // .loadImage(svg) // firefox下这种方式形状无法生成
        .then(img => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.height = img.height
            canvas.width = img.width
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * options.scale, img.height * options.scale)
            // URL.revokeObjectURL(url)
            return canvas
        })
}

/**
 * 加载图片
 * @param {*} src
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            resolve(img)
        }
        img.onerror = () => {
            reject()
        }
        img.src = src
    })
}

/**
 * 将blob转换为dataUrl，避免跨域的问题
 * @param blob
 */
function blob2base64(blob) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = e => {
            resolve(e.target.result)
        }
        fileReader.onerror = () => {
            reject()
        }
        fileReader.readAsDataURL(blob)
    })
}

export default dom2canvas
