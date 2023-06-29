import EqxElement from '../element'
import elementType from '../../../../config/enum.element.type'
import { host } from '../../../../config/env'
import textType from '../../../../config/enum.text.type'
import color from '../../../../utils/color'

export default class EqxText extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)
        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.photoText
            elementJson.css = Object.assign({
                left: css.left,
                top: css.top,
                width: css.width,
                height: css.height,
                opacity: css.opacity,
                transform: css.transform,
                display: css.display,
                fontFamily: css.fontFamily,
                fontSize: css.fontSize,
                fontWeight: css.fontWeight,
                fontStyle: css.fontStyle,
                textAlign: css.textAlign,
                textDecoration: css.textDecoration,
                lineHeight: css.lineHeight,
                padding: css.padding,
                color: css.color,
                letterSpacing: css.letterSpacing,
                backgroundColor: css.backgroundColor,
                borderWidth: css.borderWidth,
                borderStyle: css.borderStyle,
                borderColor: css.borderColor
            }, elementJson.css, { zIndex: EqxElement.newZIndex(elements) })
            elementJson.property = elementJson.property || {}
        }
        if (!elementJson.property.fontFamilyName) {
            elementJson.property.fontFamilyName = '默认字体'
        }
        if (!elementJson.property.fontStyleImgPath) {
            elementJson.property.fontStyleImgPath = ''
        }
        if (!elementJson.property.fontstylename) {
            elementJson.property.fontstylename = '无样式'
        }

        this.elementJson = elementJson
        this.isEditing = false // 是否在编辑中
        this.$text = null // 组件里的文本dom
    }

    render() {
        super.render()
        const fontType = this.elementJson.property.type
        const $text = this.$text = document.createElement('div')
        let css = {
            left: '', // 清除多余的样式
            top: '',
            transform: '',
            zIndex: '',
            wordWrap: 'break-word', // 自动换行
            boxSizing: 'content-box', // 重置公用样式
            // overflow: 'hidden', // 超出宽度后隐藏
            userSelect: 'none'// 右键不需要选中文字
        }

        if (fontType === textType.chartlet) {
            css = Object.assign(css, {
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                webkitBackgroundClip: 'text',
                backgroundClip: 'text'
            })
        }
        if (fontType === textType.gradient) {
            css = Object.assign(css, {
                webkitBackgroundClip: 'text',
                backgroundClip: 'text'
            })
        }
        if (Object.prototype.hasOwnProperty.call(this.elementJson.css, 'border')) {
            delete this.elementJson.css.border
        }
        const { fontSize, width } = this.elementJson.css
        if (parseInt(fontSize) > parseInt(width)) {
            this.elementJson.css.width = fontSize
        }
        $text
            .css(this.elementJson.css)
            .css(css)
            .innerHTML = this.elementJson.property.content
        const { display } = this.elementJson.css
        if ([textType.gradient, textType.chartlet].includes(fontType)) {
            display === 'none' ? $text.removeAttr('class') : $text.attr('class', 'gradientChartlet')
        }
        this.createFontFace()
        this.updateProperty(this.elementJson.property)
        this.$el.appendChild($text)
    }

    formatContent(content) {
        return content.replace(/\r?\n/g, '<br>').replace(/\s/g, '&nbsp;')
    }

    createFontFace() {
        if (!Vue.store.state.fontStyle.isLoad) {
            return
        }
        const { css, property } = this.elementJson
        if (css.fontFamily !== '' && property.src && !document.querySelector('#' + css.fontFamily)) {
            const $style = document.createElement('style')
            $style.id = css.fontFamily
            $style.innerHTML = `@font-face{font-family: "${css.fontFamily}";src: url(${host.file + property.src}) format("woff")}\r\n`
            document.head.appendChild($style)
        }
    }

    updateCss(css) {
        const { padding, borderWidth } = this.elementJson.css
        const uselessCss = {
            // 清除不需要的属性
            left: '',
            top: '',
            zIndex: '',
            transform: ''
        }
        // 清除不需要的圆角属性
        if (Object.prototype.hasOwnProperty.call(css, 'borderRadius')) {
            delete css.borderRadius
        }

        let border = null
        if (Object.prototype.hasOwnProperty.call(css, 'border')) {
            border = css.border
            delete css.border
        }
        if (this.elementJson.css.writingMode && this.elementJson.css.writingMode === 'vertical-rl') {
            this.$text.css(css).css(uselessCss).css({
                // fontSize变化时，需要重新计算，并且需要先渲染
                width: ''
            })
            css.width = this.$text.offsetWidth - (parseInt(borderWidth) + parseInt(padding)) * 2 + 'px'
        } else {
            // 需要把缩放后的offsetHeight换算成缩放前的
            this.$text.css(css).css(uselessCss).css({
                // fontSize变化时，需要重新计算，并且需要先渲染
                height: ''
            })
            css.height = this.$text.offsetHeight - (parseInt(borderWidth) + parseInt(padding)) * 2 + 'px'
        }

        if (border) {
            super.updateCss({ border })
        }
        super.updateCss(css)
        super.setScale()

        if (Object.prototype.hasOwnProperty.call(css, 'border')) {
            delete css.border
        }

        this.$text.css(css).css(uselessCss)
    }

    static strokeOffset(size, x, y) {
        if (size < 1) return
        const offsetArray = []
        let xOffSet
        let yOffSet
        while (size > 0) {
            // 上
            xOffSet = size + x
            yOffSet = -size + y
            while (xOffSet > -size) {
                offsetArray.push([xOffSet, yOffSet])
                xOffSet--
            }
            // 右
            xOffSet = size + x
            yOffSet = size + y
            while (yOffSet > -size) {
                offsetArray.push([xOffSet, yOffSet])
                yOffSet--
            }
            // 下
            xOffSet = size + x
            yOffSet = size + y
            while (xOffSet > -size) {
                offsetArray.push([xOffSet, yOffSet])
                xOffSet--
            }
            // 左
            xOffSet = -size + x
            yOffSet = size + y
            while (yOffSet > -size) {
                offsetArray.push([xOffSet, yOffSet])
                yOffSet--
            }
            size -= 2
        }
        return offsetArray
    }

    static shadow(newProperty) {
        const { shadow } = newProperty
        const css = {}
        if (shadow) {
            css.textShadow = `${shadow.color} ${shadow.h}px ${shadow.v}px ${shadow.blur}px,`
        }
        return css
    }

    static dropShadow(newProperty) {
        const { dropShadow } = newProperty
        const css = {}
        if (dropShadow) {
            if (dropShadow.color.indexOf('#') > -1) {
                const rgba = color.hex2rgba(dropShadow.color)
                dropShadow.color = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`
            } else {
                if (dropShadow.transparency !== dropShadow.lastTransparency) {
                    const a = parseFloat((100 - dropShadow.transparency) / 100).toFixed(2)
                    const rgba = dropShadow.color.match(/(\d(\.\d+)?)+/g)
                    dropShadow.color = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${a})`
                    dropShadow.lastTransparency = dropShadow.transparency
                } else {
                    const rgba = dropShadow.color.match(/(\d(\.\d+)?)+/g)
                    const alpha = 100 - parseInt(rgba[3] * 100)
                    dropShadow.transparency = alpha
                }
            }
            css.textShadow = `${dropShadow.color} ${dropShadow.x}px ${dropShadow.y}px ${dropShadow.blur}px`
        }
        return css
    }

    static gradient(newProperty) {
        const { gradient } = newProperty
        const css = {}
        if (gradient) {
            css.backgroundImage = `linear-gradient(${gradient.angle}deg, ${gradient.colors[0]} 0%, ${gradient.colors[1]} 100%)`
        }
        return css
    }

    static cube(newProperty) {
        const css = {}
        const { cube, angle } = newProperty
        if (cube) {
            const A = angle * Math.PI / 180
            const color = cube[0].color
            const size = cube[0].size
            const textShadow = []
            for (let i = 0; i < size; i++) {
                textShadow.push(`${color} ${i * Math.cos(A)}px ${i * Math.sin(A)}px 0,`)
            }
            css.textShadow = textShadow.join('')
        }
        return css
    }

    static stroke(newProperty) {
        const css = {}
        const { stroke } = newProperty
        if (stroke) {
            const color = stroke.color
            let size = stroke.size
            const distance = stroke.distance
            const discolor = '#FFFFFF'
            let textStroke = []
            if (distance > 0) {
                size = size * 2 + distance
            }
            const distanceArr = this.strokeOffset(distance, 0, 0) || []
            const sizeArr = this.strokeOffset(size, 0, 0) || []
            distanceArr.forEach(offset => {
                textStroke += `${discolor} ${offset[0]}px ${offset[1]}px 0,`
            })
            sizeArr.forEach(offset => {
                textStroke += `${color} ${offset[0]}px ${offset[1]}px 0,`
            })
            css.textShadow = textStroke
        }
        return css
    }

    static shake(newProperty) {
        const css = {}
        const { shake, angle } = newProperty
        if (shake) {
            const A = angle * Math.PI / 180
            const color1 = shake.colors[0]
            const color2 = shake.colors[1]
            const size = shake.size
            const textShadow = []
            for (let n = 1; n <= 2; n++) {
                for (let i = 1; i <= size; i++) {
                    if (n === 1) {
                        textShadow.push(`${color1} ${-i * Math.cos(A)}px ${-i * Math.sin(A)}px 0,`)
                    } else {
                        textShadow.push(`${color2} ${i * Math.cos(A)}px ${i * Math.sin(A)}px 0,`)
                    }
                }
            }
            textShadow.push(this.shadow(newProperty).textShadow)
            textShadow.push(this.dropShadow(newProperty).textShadow)
            css.textShadow = textShadow.join('')
        }
        return css
    }

    static chartlet(newProperty) {
        const css = {}
        const { backgroundImage } = newProperty
        if (backgroundImage) {
            css.backgroundImage = `url(${host.file + newProperty.backgroundImage})`
        }
        return css
    }

    static specific(newProperty) {
        const css = {}
        let textSpecific = ''
        const stroke = this.stroke(newProperty).textShadow
        const cube = this.cube(newProperty).textShadow
        const dropShadow = this.dropShadow(newProperty).textShadow
        if (stroke.length > 0) {
            textSpecific = textSpecific + stroke
        }
        if (cube && cube.length > 0) {
            textSpecific = textSpecific + cube
        }
        if (dropShadow !== '') {
            textSpecific = textSpecific + dropShadow
        }

        css.textShadow = textSpecific
        return css
    }

    static strokeWithoutDistance(newProperty) {
        const css = {}
        const { stroke } = newProperty
        if (stroke) {
            const color = stroke.color
            const size = stroke.size
            css.webkitTextStroke = `${size}px ${color}`
        }
        return css
    }

    static borderRadius(radius) {
        const css = {}
        if (radius) {
            const lt = radius.lt ? radius.val : '0px'
            const rt = radius.rt ? radius.val : '0px'
            const lb = radius.lb ? radius.val : '0px'
            const rb = radius.rb ? radius.val : '0px'
            css.borderRadius = `${lt} ${rt} ${rb} ${lb}`
        }
        return css
    }

    deleteProperty(property, keys) {
        for (const key in property) {
            if (keys.includes(key)) {
                delete property[key]
            }
        }
    }

    updateProperty(newProperty) {
        super.updateProperty(newProperty)
        const newPropertys = this.elementJson.property
        const textTypes = newPropertys.type
        const borderRadius = this.elementJson.property.borderRadius

        switch (textTypes) {
            case textType.text:
            case textType.shadow:
            case textType.cube:
            case textType.stroke: {
                this.deleteProperty(newPropertys, ['gradient', 'shake', 'chartlet'])
                const uselessCss = {
                    backgroundImage: '',
                    textShadow: '',
                    backgroundPosition: '',
                    backgroundSize: '',
                    webkitBackgroundClip: '',
                    backgroundClip: '',
                    webkitTextStroke: ''
                }
                this.$text.css(uselessCss).css(EqxText.specific(newPropertys))
                break
            }
            case textType.gradient:
                this.deleteProperty(newPropertys, ['shake', 'chartlet', 'cube'])
                this.$text.css({
                    textShadow: ''
                }).css(EqxText.dropShadow(newPropertys))
                    .css(EqxText.strokeWithoutDistance(newProperty))
                    .css(EqxText.gradient(newPropertys))
                break
            case textType.shake:
                this.deleteProperty(newPropertys, ['cube', 'chartlet', 'gradient'])
                this.$text.css(EqxText.strokeWithoutDistance(newProperty))
                    .css(EqxText.shake(newPropertys))
                break
            case textType.chartlet:
                this.deleteProperty(newPropertys, ['shake', 'cube', 'gradient'])
                this.$text.css({
                    textShadow: ''
                }).css(EqxText.dropShadow(newPropertys))
                    .css(EqxText.strokeWithoutDistance(newProperty))
                    .css(EqxText.chartlet(newPropertys))
                break
        }
        this.deleteProperty(this.elementJson.css, ['backgroundPosition', 'backgroundSize', 'webkitBackgroundClip', 'backgroundClip', 'textShadow', 'backgroundImage'])

        // 更新文字背景的圆角属性(注意：外层div和文字div都需要同时改变才行)
        this.$el.css(EqxText.borderRadius(borderRadius))
        this.$text.css(EqxText.borderRadius(borderRadius))
    }
}
