import storageSession from './storageSession'
import elementType from '../config/enum.element.type'

/**
 * 判断是否支持webp格式的图片
 */
const isSupportWebp = !![].map && document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0

/**
 * 判断是否是windows平台
 */
const isWin = ['Win32', 'Windows'].includes(navigator.platform)

/**
 * 判断是否是windows x64平台
 */
const isWin64 = new RegExp(/win64/).test(navigator.userAgent.toLowerCase())

/**
 * 判断是否是mac平台
 */
const isMac = ['Mac68K', 'MacPPC', 'Macintosh', 'MacIntel'].includes(navigator.platform)

/**
 * 判断是否是Chrome
 */
const isChrome = /Chrome/.test(navigator.userAgent)

/**
 * 判断是否是Firefox
 */
const isFirefox = /Firefox/.test(navigator.userAgent)

/**
 * 判断是否是Safari
 */
const isSafari = /Safari/.test(navigator.userAgent)

/**
 * 判断是否是Edge
 */
const isEdge = /Edge/.test(navigator.userAgent)

/**
 * 判断参数是哪种类型
 * @param {*} obj
 */
function checkType(obj, type) {
    return Object.prototype.toString.call(obj).toLowerCase() === `[object ${type}]`
}

/**
 * 判断参数是不是对象
 * @param {*} obj
 */
function isObject(obj) {
    return checkType(obj, 'object')
}

/**
 * 判断参数是不是数组
 * @param {*} obj
 */
function isArray(obj) {
    return checkType(obj, 'array')
}

/**
 * 判断参数是不是字符串
 * @param {*} obj
 */
function isString(obj) {
    return checkType(obj, 'string')
}

/**
 * 判断参数是不是方法
 * @param {*} obj
 */
function isFunction(obj) {
    return checkType(obj, 'function')
}
/**
 * 判断参数是不是blob
 * @param {*} obj
 */
function isBlob(obj) {
    return checkType(obj, 'blob')
}

/**
 * 判断参数是不是blob
 * @param {*} blob
 */
function blobToDataURL(blob, callback) { var a = new FileReader(); a.onload = function (e) { callback(e.target.result) }; a.readAsDataURL(blob) }

/**
 * 获取随机数
 * @param min
 * @param max
 * @returns {number}
 */
function getRandom(min, max) {
    const choose = max - min + 1
    return Math.floor(Math.random() * choose + min)
}

/**
 * 获取Chrome的版本号
 */
function getChromeVersion() {
    return Number(/Chrome\/(\d+)/.exec(navigator.userAgent)[1])
}

/**
 * 获取当前页面是否是批量创建模式
 */
function getIsBatchCreate() {
    return window.location.href.indexOf('/h2/batch/') > 0
}

/**
 * 获取当前页面是否是二维码创建模式
 */
function getIsQrcodeCreate() {
    return window.location.href.indexOf('/h2/qrcode') > 0
}

/**
 * 当前环境是否为测试环境
 */
function isTestEnvironment() {
    return window.location.host.indexOf('yqxiu.cn') >= 0
}

/**
 * 纵向拼接两张个图片
 * @param {图片1} img1
 * @param {图片2} img2
 * @param {图片2和图片1的间隔} img2TopToimg1
 */
function join2Image(img1, img2, img2TopToimg1) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = Math.max(img1.width, img2.width)
        canvas.height = img1.height + img2TopToimg1 + img2.height
        ctx.drawImage(img1, 0, 0, img1.width, img1.height, 0, 0, img1.width, img1.height)
        ctx.drawImage(img2, 0, 0, img2.width, img2.height, 0, img1.height + img2TopToimg1, img2.width, img2.height)
        const url = canvas.toDataURL()
        resolve(url)
    })
}

/**
 *uuid
 */
function getUUID() {
    var s = []
    var hexDigits = '0123456789abcdef'
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
    }
    s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-'

    var uuid = s.join('')
    return uuid
}

/*
 * 获取作品模板关系
 */
function getBatchProductTemplateRelation() {
    const relationArr = Vue.store.state.scene.batchProductTemplateRelation.filter(item => { return item.productId === Vue.store.state.scene.eqxScene.sceneJson.id })
    if (relationArr && relationArr.length === 1) {
        return relationArr[0]
    } else {
        return null
    }
}

/**
 * canvas上添加水印
 */
function canvasAddWaterMarkToImage(pCanvas, pImageFormat, pText, pRotateAngle = 30) {
    return new Promise((resolve, reject) => {
        const ctx = pCanvas.getContext('2d')
        ctx.translate(pCanvas.width / 2, pCanvas.height / 2)
        ctx.rotate(pRotateAngle * Math.PI / 180)
        ctx.globalAlpha = 0.1
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '48px Airal'
        ctx.fillText(pText, 0, 0)
        const base64Str = pCanvas.toDataURL(pImageFormat, 1.0).split(',')[1]
        console.info(pCanvas.toDataURL(pImageFormat, 1.0))
        resolve(base64Str)
    })
}

function downloadFile(fileName, url) {
    // 判断浏览器
    const a = document.createElement('a')
    a.download = fileName
    a.href = url
    a.trigger('click')
}

function downloadGifFile(fileName, url) {
    var x = new XMLHttpRequest()
    x.open('GET', url, true)
    x.responseType = 'blob'
    x.onload = function (e) {
        var url = window.URL.createObjectURL(x.response)
        var a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
    }
    x.send()
}

function login() {
    if (Vue.store.state.user.userInfo.id) {
        return true
    }
    Vue.dialog.openLogin().then(() => {
        Vue.api.user.getUserInfo(true).then(res => {
            const isVistor = res.data.code === 1001 // 未登录
            // 游客模式
            if (isVistor) {
                storageSession.setItem(storageSession.key.visit, true)
            } else {
                storageSession.setItem(storageSession.key.login, true)
                Vue.store.commit('USER_SET', { userInfo: res.data.obj })
            }
        })
    })
    return false
}

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
 * 根据图片地址获取base64带size
 */
function getBase64ImageWithSize(src) {
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    const ctx = canvas.getContext('2d')
    img.src = src
    return new Promise((resolve, reject) => {
        img.onload = function () {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            const url = canvas.toDataURL()
            resolve({
                base64: url,
                width: img.width,
                height: img.height
            })
        }
    })
}

/**
 * 获取页面上某类型元素个数
 * @param {元素类型} elementType
 */
function getElementCountByTypeOnPage(elementType) {
    const eqxPage = Vue.store.state.scene.eqxPage
    let textThreeDElementCount = 0
    for (let i = 0; i < eqxPage.eqxElements.length; i++) {
        const eqxElementItem = eqxPage.eqxElements[i]
        if (eqxElementItem.elementJson.type === elementType) {
            textThreeDElementCount++
        }
    }
    return textThreeDElementCount
}

/**
 * 是否允许粘贴3D文字
 */
function isAllowPastElement() {
    let isAllow = true
    // 判断当前复制的组件里面包含3D文字的个数
    const copiedElements = Vue.store.state.scene.elementsCopied
    const copiedTextThreeDElementCount = copiedElements.filter(copiedElementItem => {
        return copiedElementItem.type === elementType.textThreeD
    }).length
    if (copiedTextThreeDElementCount > 0) {
        // 如果复制的3D文字个数大于0则进行总数的判断
        // 获取当前画布上的3D文字的个数
        const textThreeDElementCount = getElementCountByTypeOnPage(elementType.textThreeD)
        if (copiedTextThreeDElementCount + textThreeDElementCount > 5) {
            // 判断3D文字个数=复制的个数+当前画布上的个数
            isAllow = false
        }
    }
    return isAllow
}

/**
 * 将查询参数转换成对象
*/
function getUrlParams() {
    const obj = {}
    const params = location.href.split('?')[1] || ''
    params.split('&').forEach(function (item) {
        const val = item.split('=')
        obj[val[0]] = val[1]
    })
    return obj
}

export default {
    isObject,
    isArray,
    isString,
    isFunction,
    isSupportWebp,
    isWin,
    isWin64,
    isMac,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isBlob,
    getRandom,
    getChromeVersion,
    blobToDataURL,
    getIsBatchCreate,
    isTestEnvironment,
    join2Image,
    getIsQrcodeCreate,
    getUUID,
    getBatchProductTemplateRelation,
    canvasAddWaterMarkToImage,
    downloadFile,
    downloadGifFile,
    login,
    ajax2Blob,
    getBase64ImageWithSize,
    getElementCountByTypeOnPage,
    isAllowPastElement,
    getUrlParams
}
