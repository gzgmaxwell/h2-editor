import EqxElement from '../element'
import elementType from '../../../config/enum.element.type'
import { host } from '../../../config/env'

export default class EqxImage extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)

        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.image
            elementJson.css = Object.assign({
                left: css.left,
                top: css.top,
                width: css.width,
                height: css.height,
                opacity: css.opacity,
                transform: css.transform,
                display: css.display,
                borderWidth: css.borderWidth,
                borderStyle: css.borderStyle,
                borderColor: css.borderColor
            }, elementJson.css, { zIndex: EqxElement.newZIndex(elements) })
            elementJson.property = elementJson.property || {
                src: '',
                crop: {},
                rotateY: false,
                rotateX: false
            }
        }

        this.elementJson = elementJson
    }

    render() {
        super.render()

        const { css, property } = this.elementJson
        const $image = this.$image = document.createElement('div')
        $image
            .css({
                verticalAlign: 'top',
                boxSizing: 'content-box'
            })
        this.updateCss(css)
        this.updateProperty(property)
        this.$el.appendChild($image)
    }

    updateCss(css) {
        super.updateCss(css)
        super.setScale()
        if (Object.prototype.hasOwnProperty.call(css, 'border')) {
            delete css.border
        }
        this.$image
            .css(css)
            .css({
                // 清除不需要的属性
                left: '',
                top: '',
                zIndex: '',
                transform: ''
            })
        // transform清空了翻转会失效，所以再处理一遍
        this.updateProperty(this.elementJson.property)
    }

    static dropShadow(dropShadow) {
        const css = {}
        if (dropShadow) {
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
            css.filter = `drop-shadow(${dropShadow.x}px ${dropShadow.y}px ${dropShadow.blur}px ${dropShadow.color})`
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

    updateProperty(property) {
        super.updateProperty(property)
        const { src } = this.elementJson.property
        if (!property.isSvg) {
            this.elementJson.property.src = src.split('?')[0] + '?imageMogr2/auto-orient'
            this.updateCommonProperty()
        }
    }

    updateCommonProperty() {
        const { src, crop, rotateX, rotateY, dropShadow, borderRadius } = this.elementJson.property
        let url = src
        const transforms = []
        if (crop) {
            url = `${url}/crop/!${crop.width}x${crop.height}a${crop.left}a${crop.top}`
        }
        if (rotateX) {
            transforms.push(`rotateX(${rotateX}deg)`)
        }
        if (rotateY) {
            transforms.push(`rotateY(${rotateY}deg)`)
        }

        this.$image.css({
            background: `url(${host.file + url}) center / cover`,
            transform: transforms.join(' ')
        })
        // 更新图片的dropShadow
        this.$image.css(EqxImage.dropShadow(dropShadow))
        // 更新图片的圆角属性
        this.$image.css(EqxImage.borderRadius(borderRadius))
    }
}
