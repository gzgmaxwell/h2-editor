import util from './util'
import elementType from '../config/enum.element.type'
import textType from '../config/enum.text.type'

/**
 * h5 各类组合数据 转成 h2轻设计可使用的数据
 * h5Elements: 待转换的h5组件列表数据
 */
function translate2h2(h5Elements) {
    resetZIndex(h5Elements)
    const h2Elements = []
    const elementFonts = []
    h5Elements.forEach(ele => {
        let h2Component
        switch (ele.type + '') {
            case '7': // h5新文本
                h2Component = translateText7(ele)
                if (h2Component) elementFonts.push(h2Component.css.fontFamily)
                break
            case '4': // h5图片
                h2Component = translateImage(ele)
                break
            case 'h': // h5形状
                h2Component = translateShape(ele)
                break
            case '14': // h5日期
                h2Component = translateDate(ele)
                break
        }
        if (h2Component) h2Elements.push(h2Component)
    })
    return { h2Elements, elementFonts }
}

/**
 * 生成组件id
 * @returns {number}
 */
function getUniqueId() {
    const scene = Vue.store.state.scene
    const eqxPage = scene.eqxPage
    const elements = eqxPage.pageJson.elements
    let randomId = 0
    do {
        randomId = util.getRandom(100, 999)
    } while (elements.map(elementJson => elementJson.id).indexOf(randomId) > -1)
    return randomId
}

/**
 * 重新设置h5Elements的zIndex
 * 以便生成转换后的zIndex
 */
function resetZIndex(h5Elements) {
    const sortEqxElements = h5Elements.sort((a, b) => parseInt(a.css.zIndex) - parseInt(b.css.zIndex))
    sortEqxElements.forEach((ele, i) => { ele.css.zIndex = i + 1 })
    h5Elements = sortEqxElements
}

/**
 * 生成组件层级
 * elements:h2当前页面已有的元素
 *
 * @param {object} h5Element h5的元素数据
 * @returns {number}
 */
function getNewZIndex(h5Element) {
    const scene = Vue.store.state.scene
    const eqxPage = scene.eqxPage
    const elements = eqxPage.pageJson.elements
    const css = h5Element.css
    const zIndex = parseInt(css.zIndex)
    const arr = elements.map(elementJson => elementJson.css.zIndex)
    const zIndexes = arr.length ? arr : [0]
    const curMaxZIndex = Math.max.apply(Math, zIndexes)
    return zIndex + curMaxZIndex
}

/**
 * 将h5图片转为h2图片
 * @param {object} h5Image h5图片
 * @returns {*} h2图片
 */
function translateImage(h5Image) {
    const h5Css = h5Image.css
    const h5Props = h5Image.properties
    const h5CropSize = h5Props.cropSize
    let eleType = elementType.image
    let frameImgSrc = h5Props.src
    if (h5Props.maskSrc && h5Props.maskSrc !== '') {
        // 处理为H2嵌入框
        eleType = elementType.frame
    }
    const h2Props = {}

    let src = eleType === elementType.image ? h5Props.src : h5Props.maskSrc

    if (h5CropSize) {
        h2Props.crop = {
            left: h5CropSize.x,
            top: h5CropSize.y,
            width: h5CropSize.w,
            height: h5CropSize.h
        }
        const crop = h5Props.src.split('crop/!')
        if (crop && crop.length > 0 && crop[1]) {
            const tmp = crop[1]
            const args = tmp.split('a')
            const wh = args[0].split('x')
            h2Props.crop.width = wh[0]
            h2Props.crop.height = wh[1]
            h2Props.crop.left = args[1]
            h2Props.crop.top = args[2]
        }
        if (eleType === elementType.image) {
            src = h5Props.src.split('?')[0]
        } else {
            frameImgSrc = h5Props.src.split('?')[0]
        }
    }
    let rotateY = false
    let rotateX = false
    if (h5Css.turnOver && h5Css.turnOver.length > 0) {
        const turnOver = h5Css.turnOver.trim()
        if (turnOver.indexOf('rotateY(180deg)') > -1) {
            rotateY = true
        }
        if (turnOver.indexOf('rotateX(180deg)') > -1) {
            rotateX = true
        }
    }
    if (eleType === elementType.frame) {
        h2Props.frames = {
            0: {
                src: frameImgSrc,
                crop: h2Props.crop
            }
        }
    }

    return {
        id: getUniqueId(),
        type: eleType,
        css: {
            width: (parseInt(h5Css.width - h5Css.borderWidth * 2) * 2 || 0) + 'px',
            height: (parseInt(h5Css.height - h5Css.borderWidth * 2) * 2 || 0) + 'px',
            top: (parseInt(h5Css.top) * 2 || 0) + 'px',
            left: (parseInt(h5Css.left) * 2 || 0) + 'px',
            transform: h5Css.transform || 'rotateZ(0deg)',
            opacity: h5Css.opacity,
            borderColor: h5Css.borderColor || '',
            borderRadius: (h5Css.borderRadius * 2 || 0) + 'px',
            borderStyle: h5Css.borderStyle || 'solid',
            borderWidth: h5Css.borderWidth * 2 + 'px',
            zIndex: getNewZIndex(h5Image)
        },
        property: Object.assign({}, h2Props, {
            src: src,
            dropShadow: {
                color: 'rgba(0,0,0,0.0)',
                x: 0,
                y: 0,
                blur: 0,
                transparency: 100
            },
            borderRadius: {
                lt: true,
                rt: true,
                lb: true,
                rb: true,
                val: h5Css.borderRadius * 2 || 0
            },
            rotateY: rotateY,
            rotateX: rotateX
        })
    }
}

/**
 * 将h5形状转为h2形状
 * @param {object} h5Shape h5 形状
 * @returns {*} h2形状
 */
function translateShape(h5Shape) {
    const h5Css = h5Shape.css
    const h5Props = h5Shape.properties
    const h5Items = h5Props.items
    const h2Items = []
    if (h5Items) {
        h5Items.forEach(h5Item => {
            const elements = h5Item.elements
            if (Array.isArray(elements)) {
                elements.forEach((ele, idx) => {
                    h2Items[ele] = {
                        fill: h5Item.fill
                    }
                })
            }
        })
    }

    // 解析h5形状的水平翻转和垂直翻转属性turOver
    let rotateY = false
    let rotateX = false
    if (h5Css.turnOver && h5Css.turnOver.length > 0) {
        const turnOver = h5Css.turnOver.trim()
        if (turnOver.indexOf('rotateY(180deg)') > -1) {
            rotateY = true
        }
        if (turnOver.indexOf('rotateX(180deg)') > -1) {
            rotateX = true
        }
    }

    return {
        id: getUniqueId(),
        type: elementType.shape,
        css: {
            width: (parseInt(h5Css.width - h5Css.borderWidth * 2) * 2 || 0) + 'px',
            height: (parseInt(h5Css.height - h5Css.borderWidth * 2) * 2 || 0) + 'px',
            top: (parseInt(h5Css.top) * 2 || 0) + 'px',
            left: (parseInt(h5Css.left) * 2 || 0) + 'px',
            transform: h5Css.transform || 'rotateZ(0deg)',
            opacity: h5Css.opacity,
            borderColor: h5Css.borderColor || '',
            borderRadius: (h5Css.borderRadius * 2 || 0) + 'px',
            borderStyle: h5Css.borderStyle || 'solid',
            borderWidth: h5Css.borderWidth * 2 + 'px',
            zIndex: getNewZIndex(h5Shape)
        },
        property: {
            items: h2Items,
            url: h5Props.src,
            dropShadow: {
                color: 'rgba(0,0,0,0.0)',
                x: 0,
                y: 0,
                blur: 0,
                transparency: 100
            },
            rotateY: rotateY,
            rotateX: rotateX,
            borderRadius: {
                lt: true,
                rt: true,
                lb: true,
                rb: true,
                val: h5Css.borderRadius * 2 || 0
            },
            gradient: {
                angle: 90,
                colors: { 0: '#5D61FF', 1: '#FF15F5' },
                enabled: false
            }
        }
    }
}

/**
 * 将h5新文本转为h2文本
 * @param {object} h5Text7 h5 新文本
 * @returns {*} h2文本
 */
function translateText7(h5Text7) {
    const h5Css = h5Text7.css
    const h2DefaultPadding = 5
    const h5CssBorderWidth = parseInt(h5Css.borderWidth) || 0
    const h5CssPaddingTop = parseInt(h5Css.paddingTop) || 0
    const h5CssLeft = parseInt(h5Css.left) || 0
    const h5CssTop = parseInt(h5Css.top) || 0
    const h5CssWidth = parseInt(h5Css.width) || 0
    const h5CssHeight = parseInt(h5Css.height) || 0
    const h5CssFontsize = parseInt(h5Css.fontSize) || 14
    const h5CssFontFamily = h5Css.fontFamily || ''
    let h5CssLetterSpacing = h5Css.letterSpacing ? (h5Css.letterSpacing + '') : ''

    const h2CssPos = {
        top: (h5CssTop * 2 - h2DefaultPadding * 2) + 'px',
        left: (h5CssLeft * 2 - h2DefaultPadding * 2) + 'px',
        width: (h5CssWidth - h5CssBorderWidth * 2) * 2 + 'px',
        height: (h5CssHeight - h5CssBorderWidth * 2) * 2 + 'px'
    }
    // 有边框时不考虑paddingTop，因为无法达到一样的效果
    if (h5CssBorderWidth === 0) {
        h2CssPos.top = (h5CssTop + h5CssPaddingTop) * 2 + 'px'
        h2CssPos.height = (h5CssHeight - h2DefaultPadding * 2 - h5CssPaddingTop) * 2 + 'px'
    }
    // 字间距如果没有单位，需要添加单位,单位若是em，需要转为px
    if (h5CssLetterSpacing !== '' &&
        h5CssLetterSpacing.indexOf('px') === -1 &&
        h5CssLetterSpacing.indexOf('em') === -1) {
        h5CssLetterSpacing = parseInt(h5CssLetterSpacing * h5CssFontsize * 2) + 'px'
    }
    if (h5CssLetterSpacing !== '' && h5CssLetterSpacing.indexOf('em') > -1) {
        const tmp = parseFloat(h5CssLetterSpacing.replace('em', ''))
        h5CssLetterSpacing = parseInt(tmp * h5CssFontsize * 2) + 'px'
    }
    // 兼容h5数据有scale(1,1)的问题，轻设计文字缩放是fontSize，不是scale
    if (h5Css.transform) {
        const res = /rotateZ?\((.*)deg\)/.exec(h5Css.transform)
        if (!res) {
            h5Css.transform = 'rotateZ(0deg)'
        }
    }
    return {
        id: getUniqueId(),
        type: elementType.text,
        css: Object.assign({}, {
            transform: h5Css.transform || 'rotateZ(0deg)',
            opacity: h5Css.opacity,
            borderColor: h5Css.borderColor || '',
            borderStyle: h5Css.borderStyle || 'solid',
            borderWidth: h5CssBorderWidth * 2 + 'px',
            zIndex: getNewZIndex(h5Text7),
            fontSize: h5CssFontsize * 2 + 'px',
            lineHeight: h5Css.lineHeight || 1.2,
            padding: h2DefaultPadding * 2 + 'px',
            fontFamily: h5CssFontFamily,
            fontStyle: h5Css.fontStyle || '',
            fontWeight: h5Css.fontWeight || '',
            textAlign: h5Css.textAlign,
            textDecoration: h5Css.textDecoration,
            letterSpacing: h5CssLetterSpacing || 0,
            color: h5Css.color,
            backgroundColor: h5Css.backgroundColor
        }, h2CssPos),
        property: {
            type: textType.text,
            content: h5Text7.content,
            src: '',
            dropShadow: {
                color: 'rgba(0,0,0,0.0)',
                x: 0,
                y: 0,
                blur: 0,
                transparency: 100
            },
            angle: 45,
            cube: [{ size: 0, color: '#FF2A6A' }],
            stroke: {
                size: 0,
                color: '#5D61FF',
                distance: 0
            },
            borderRadius: {
                lt: true,
                rt: true,
                lb: true,
                rb: true,
                val: 0
            }
        }
    }
}

/**
 * 将h5日期转为h2日期
 * @param {object} h5Date h5 日期
 * @returns {*} h2日期
 */
function translateDate(h5Date) {
    const h5Css = h5Date.css
    const h2DefaultPadding = 5
    const h5CssBorderWidth = parseInt(h5Css.borderWidth) || 0
    const h5CssPaddingTop = parseInt(h5Css.paddingTop) || 0
    const h5CssLeft = parseInt(h5Css.left) || 0
    const h5CssTop = parseInt(h5Css.top) || 0
    const h5CssWidth = parseInt(h5Css.width) || 0
    const h5CssHeight = parseInt(h5Css.height) || 0
    const h5CssFontsize = parseInt(h5Css.fontSize) || 14
    const h5CssFontFamily = h5Css.fontFamily || ''
    let h5CssLetterSpacing = h5Css.letterSpacing ? (h5Css.letterSpacing + '') : ''
    const h2CssPos = {
        top: (h5CssTop * 2 - h2DefaultPadding * 2) + 'px',
        left: (h5CssLeft * 2 - h2DefaultPadding * 2) + 'px',
        width: (h5CssWidth - h5CssBorderWidth * 2) * 2 + 'px',
        height: (h5CssHeight - h5CssBorderWidth * 2) * 2 + 'px'
    }
    // 有边框时不考虑paddingTop，因为无法达到一样的效果
    if (h5CssBorderWidth === 0) {
        h2CssPos.top = (h5CssTop + h5CssPaddingTop) * 2 + 'px'
        h2CssPos.height = (h5CssHeight - h2DefaultPadding * 2 - h5CssPaddingTop) * 2 + 'px'
    }
    // 字间距如果没有单位，需要添加单位,单位若是em，需要转为px
    if (h5CssLetterSpacing !== '' &&
        h5CssLetterSpacing.indexOf('px') === -1 &&
        h5CssLetterSpacing.indexOf('em') === -1) {
        h5CssLetterSpacing = parseInt(h5CssLetterSpacing * h5CssFontsize * 2) + 'px'
    }
    if (h5CssLetterSpacing !== '' && h5CssLetterSpacing.indexOf('em') > -1) {
        const tmp = parseFloat(h5CssLetterSpacing.replace('em', ''))
        h5CssLetterSpacing = parseInt(tmp * h5CssFontsize * 2) + 'px'
    }
    return {
        id: getUniqueId(),
        type: elementType.date,
        css: Object.assign({}, {
            transform: h5Css.transform || 'rotateZ(0deg)',
            opacity: h5Css.opacity,
            borderColor: h5Css.borderColor || '',
            borderStyle: h5Css.borderStyle || 'solid',
            borderWidth: h5CssBorderWidth * 2 + 'px',
            zIndex: getNewZIndex(h5Date),
            fontSize: h5CssFontsize * 2 + 'px',
            lineHeight: h5Css.lineHeight || 1.2,
            padding: h2DefaultPadding * 2 + 'px',
            fontFamily: h5CssFontFamily,
            fontStyle: h5Css.fontStyle || '',
            fontWeight: h5Css.fontWeight || '',
            textAlign: h5Css.textAlign,
            textDecoration: h5Css.textDecoration,
            letterSpacing: h5CssLetterSpacing || 0,
            color: h5Css.color,
            backgroundColor: h5Css.backgroundColor
        }, h2CssPos),
        property: {
            type: textType.text,
            content: h5Date.content,
            src: '',
            dropShadow: {
                color: 'rgba(0,0,0,0.0)',
                x: 0,
                y: 0,
                blur: 0,
                transparency: 100
            },
            angle: 45,
            cube: [{ size: 0, color: '#FF2A6A' }],
            stroke: {
                size: 0,
                color: '#5D61FF',
                distance: 0
            },
            borderRadius: {
                lt: true,
                rt: true,
                lb: true,
                rb: true,
                val: 0
            }
        }
    }
}

export default translate2h2
