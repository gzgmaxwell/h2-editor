import { elementType } from '../../config/enum'
import qrCodeType from '../../config/enum.qrcode.type'
import util from '../../utils/util'
import storageSession from '../../utils/storageSession'
import EqxElement from './element'

export default formatPage

/**
 * 格式页面数据
 * @param {*} pageJson
 */
function formatPage(pageJson) {
    formatBackground(pageJson)
    formatElements(pageJson)
}

/**
 * 格式化背景数据
 * @param {*} pageJson
 */
function formatBackground(pageJson) {
    pageJson.properties = pageJson.properties || {}

    // 转换老背景数据
    const background = pageJson.properties.background || {}
    background.bottom = background.bottom || {
        type: 0, // 0是纯色，1是渐变色
        color: '#FFFFFF',
        colors: ['', ''],
        rotate: 0
    }
    background.middle = background.middle || {
        type: 0, // 0是纹理图片，1是自定义图片
        src: '',
        size: 0.2,
        opacity: 1
    }
    background.top = background.top || {
        type: 0, // 0是纯色，1是渐变色
        color: '',
        colors: ['', ''],
        rotate: 0,
        opacity: 0.4
    }
    if (background.image) {
        background.middle.src = background.image
        background.middle.type = 0
        delete background.image
    }
    if (background.size) {
        background.middle.size = 1
        background.middle.type = 1
        delete background.size
    }
    if (background.color) {
        background.bottom.color = background.color
        delete background.color
    }
    pageJson.properties.background = background
}

/**
 * 格式化组件数据
 * @param {*} pageJson
 */
function formatElements(pageJson) {
    const defaultCss = EqxElement.defaultCss
    const idObj = {}
    pageJson.elements.forEach(elementJson => {
        const { type, css, property } = elementJson
        // 解决组件id重复的问题
        if (idObj[elementJson.id]) {
            elementJson.id = newId(pageJson.elements)
        }
        idObj[elementJson.id] = true

        for (const key in defaultCss) {
            if (!(key in elementJson.css)) {
                css[key] = defaultCss[key]
            }
            if (['letterSpacing', 'left', 'top', 'width', 'height', 'fontSize', 'padding', 'borderWidth', 'borderRadius'].includes(key)) {
                // 有些老数据是小数，统一格式化成整数
                css[key] = `${Math.round(parseFloat(css[key]))}px`
            } else if (['opacity'].includes(key)) {
                // 有些老数据是字符串，统一格式化成数字
                css[key] = Number(css[key])
            } else if (key === 'transform') {
                // 旋转角度小数转成整数
                let value = /rotateZ?\((.*)deg\)/.exec(css[key])
                value = value ? value[1] : 0
                css[key] = `rotateZ(${Math.round(value)}deg)`
            }
        }
        if (!property.lock) {
            property.lock = false
        }
        if (type === elementType.text) {
            if (css.fontFamily === 'Microsoft YaHei') {
                css.fontFamily = ''
            }
            // 老数据没有type，添加一个用于隐藏样式切换
            property.type = property.type || 0

            // 老数据没有字体样式名称，向下兼容
            property.fontstylename = property.fontstylename || ''

            if (!property.dropShadow && property.shadow) {
                // 兼容之前使用shadow属性的文字
                property.dropShadow = {}
                property.dropShadow.color = property.shadow.color
                property.dropShadow.x = property.shadow.h
                property.dropShadow.y = property.shadow.v
                property.dropShadow.blur = property.shadow.blur
                property.dropShadow.transparency = 0
            }

            if (!property.dropShadow) {
                property.dropShadow = {
                    color: 'rgba(0,0,0,0)',
                    x: 0,
                    y: 0,
                    blur: 0,
                    transparency: 100
                }
            }
            if (property.dropShadow && Object.keys(property.dropShadow).length === 0) {
                property.dropShadow = {
                    color: 'rgba(0,0,0,0)',
                    x: 0,
                    y: 0,
                    blur: 0,
                    transparency: 100
                }
            }
            if (!property.angle) {
                property.angle = 45
            }

            if (!property.cube) {
                property.cube = [{ size: 0, color: '#FF2A6A' }]
            }

            if (!property.stroke) {
                property.stroke = {
                    size: 0,
                    color: '#5D61FF',
                    distance: 0
                }
            } else {
                // 如果旧数据没有描边距离属性，增加一个
                if (!property.stroke.distance) {
                    property.stroke.distance = 0
                }
            }
            // 兼容老数据没有圆角属性
            if (!property.borderRadius) {
                property.borderRadius = {
                    lt: true,
                    rt: true,
                    lb: true,
                    rb: true,
                    val: 0
                }
            }
        } else if (type === elementType.image) {
            deleteCss(css)
            if (property.src) {
                // 统一crop和src的数据
                const res = property.src.match(/!(\d+)x(\d+)a(\d+)a(\d+)/)
                // 兼容h5编辑器转到h2时图片路径不是相对路径的bug
                if (property.src.indexOf('//res.eqh5.com/') > -1) {
                    property.src = property.src.split('//res.eqh5.com/')[1]
                }
                // 第一版图片组件有的src带有watermark水印，需要去掉
                if (property.src.indexOf('watermark') > -1) {
                    property.src = property.src.split('?')[0]
                }
                if (res) {
                    property.crop = {
                        width: parseInt(res[1]),
                        height: parseInt(res[2]),
                        left: parseInt(res[3]),
                        top: parseInt(res[4])
                    }
                    const { left, top, width, height } = property.crop
                    if (left === 0 && top === 0 && width === 0 && height === 0) {
                        delete property.crop
                    }
                }
            } else { // 有的模板图片src属性没有？
                property.src = ''
            }

            // 删除无效的裁切属性
            if (property.crop) {
                const { left, top, width, height } = property.crop

                if (left === undefined || top === undefined || width === undefined || height === undefined) {
                    delete property.crop
                }

                if (left === 0 && top === 0 && width === 0 && height === 0) {
                    delete property.crop
                }
            }
            // 已有组件为数据库旧数据时，需要判断是否含有
            // 投影属性，向下兼容
            if (!property.dropShadow) {
                property.dropShadow = {
                    color: 'rgba(0,0,0,0)',
                    x: 0,
                    y: 0,
                    blur: 0,
                    transparency: 100
                }
            }
            // 兼容老数据没有圆角属性
            if (!property.borderRadius) {
                property.borderRadius = {
                    lt: true,
                    rt: true,
                    lb: true,
                    rb: true,
                    val: 0
                }
            }
            // 兼容3D旋转
            if (property.rotateX + '' === 'true') {
                property.rotateX = 180
            } else if (property.rotateX + '' === 'false') {
                property.rotateX = 0
            }
            if (property.rotateY + '' === 'true') {
                property.rotateY = 180
            } else if (property.rotateY + '' === 'false') {
                property.rotateY = 0
            }
        } else if (type === elementType.shape) {
            deleteCss(css)
            // 已有组件为数据库旧数据时，需要判断是否含有
            // 投影属性，向下兼容
            if (!property.dropShadow) {
                property.dropShadow = {
                    color: 'rgba(0,0,0,0)',
                    x: 0,
                    y: 0,
                    blur: 0,
                    transparency: 100
                }
            }
            // 兼容老数据没有翻转属性
            if (!property.rotateY) {
                property.rotateY = false
            }
            if (!property.rotateX) {
                property.rotateX = false
            }
            // 兼容老数据没有圆角属性
            if (!property.borderRadius) {
                property.borderRadius = {
                    lt: true,
                    rt: true,
                    lb: true,
                    rb: true,
                    val: 0
                }
            }
            // 兼容老数据没有渐变色属性
            if (!property.gradient) {
                property.gradient = {
                    angle: 90,
                    colors: { 0: '#5D61FF', 1: '#FF15F5' },
                    enabled: false
                }
            }
        } else if (type === elementType.qrcode) {
            deleteCss(css)

            // 老数据没有type，添加一个用于属性设置里vue监控
            property.type = property.type || 0
            // 老数据没有centerIcon
            property.centerIcon = property.centerIcon || null

            if (window.scene && window.scene.id) {
                const h5store = storageSession.getItem('' + window.scene.id)
                if (!h5store) {
                    // 切换模板时不能变
                    const qrcodeUrl = storageSession.getItem(storageSession.key.qrcodeUrl)
                    const qrcodeLogo = storageSession.getItem(storageSession.key.qrcodeLogo)
                    property.text = qrcodeUrl || property.text
                    property.src = qrcodeLogo || property.src
                    // 就算模板里的二维码没有logo，也变成有logo的
                    if (qrcodeLogo) {
                        property.type = 1
                    }
                }
            }

            // 异常处理无类型的问题
            if (!property.qcType) {
                property.qcType = qrCodeType.link
                property.text = 'www.eqxiu.com'
            } else {
                // 如果有类型但是没有值 将类型设置为文本且内容设置为www.eqxiu.com
                if (property.text && property.text === '') {
                    property.qcType = qrCodeType.link
                    property.text = 'www.eqxiu.com'
                }
            }
        } else if (type === elementType.date) {
            if (css.fontFamily === 'Microsoft YaHei') {
                css.fontFamily = ''
            }
            // 老数据没有type，添加一个用于隐藏样式切换
            property.type = property.type || 0
            // 老数据没有字体样式名称，向下兼容
            property.fontstylename = property.fontstylename || ''
            if (!property.dropShadow) {
                property.dropShadow = {
                    color: 'rgba(0,0,0,0)',
                    x: 0,
                    y: 0,
                    blur: 0,
                    transparency: 100
                }
            } else {
                if (!property.dropShadow.color) {
                    property.dropShadow.color = 'rgba(0,0,0,0)'
                }
            }

            if (!property.angle) {
                property.angle = 45
            }

            if (!property.cube) {
                property.cube = [{ size: 0, color: '#FF2A6A' }]
            }

            if (!property.stroke) {
                property.stroke = {
                    size: 0,
                    color: '#5D61FF',
                    distance: 0
                }
            }
            // 兼容老数据没有圆角属性
            if (!property.borderRadius) {
                property.borderRadius = {
                    lt: true,
                    rt: true,
                    lb: true,
                    rb: true,
                    val: 0
                }
            }
        } else if (type === elementType.frame) {
            deleteCss(css)
            // 已有组件为数据库旧数据时，需要判断是否含有
            // 投影属性，向下兼容
            if (!property.dropShadow) {
                property.dropShadow = {
                    color: 'rgba(0,0,0,0)',
                    x: 0,
                    y: 0,
                    blur: 0,
                    transparency: 100
                }
            }
            // 兼容老数据没有翻转属性
            if (!property.rotateY) {
                property.rotateY = false
            }
            if (!property.rotateX) {
                property.rotateX = false
            }
            // 兼容老数据没有圆角属性
            if (!property.borderRadius) {
                property.borderRadius = {
                    lt: true,
                    rt: true,
                    lb: true,
                    rb: true,
                    val: 0
                }
            }
        } else if (type === elementType.textThreeD) {
            // 兼容老作品没有下列默认属性
            if (!property.textStyleType) {
                property.textStyleType = 1// 1 纯色 2 渐变 3贴图
            }
            if (!property.textColor) { //  文字颜色
                property.textColor = '#ffffff'
            }

            if (!property.textGradient) { // 文字渐变
                property.textGradient = {
                    colors: { 0: '#ff0000', 1: '#00ff00' }, // 颜色
                    angle: 0// 角度
                }
            }
            if (!property.textTexture) {
                property.textTexture = {
                    cover: '1', // 贴图的key
                    size: 50, // 尺寸
                    offsetX: 0, // 水平偏移
                    offsetY: 0, // 竖直偏移
                    angle: 0 // 角度
                }
            }
        }
    })
}

/**
 * 删除多余的样式
 * @param {*} css
 */
function deleteCss(css) {
    delete css.fontFamily
    delete css.fontSize
    delete css.fontWeight
    delete css.fontStyle
    delete css.lineHeight
    delete css.padding
    delete css.color
    delete css.backgroundColor
    delete css.textAlign
    delete css.textDecoration
    delete css.letterSpacing
}

/**
 * 创建新的组件id
 * @param {*} elements
 */
function newId(elements) {
    let randomId = 0
    do {
        randomId = util.getRandom(100, 999)
    } while (elements.map(elementJson => elementJson.id).indexOf(randomId) > -1)
    return randomId
}
