import EqxElement from '../element'
import elementType from '../../../config/enum.element.type'
import { host } from '../../../config/env'

export default class EqxGif extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)

        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.gif
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
        const $gif = this.$gif = document.createElement('div')
        $gif.css({
            verticalAlign: 'top',
            boxSizing: 'content-box'
        })

        this.updateCss(css)
        this.updateProperty(property)
        // 给gif元素添加假水印
        this.$el.appendChild($gif)
    }

    updateCss(css) {
        super.updateCss(css)
        super.setScale()
        if (Object.prototype.hasOwnProperty.call(css, 'border')) {
            delete css.border
        }
        this.$gif
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
            if (dropShadow.transparency) {
                const a = parseFloat((100 - dropShadow.transparency) / 100).toFixed(2)
                const rgba = dropShadow.color.match(/(\d(\.\d+)?)+/g)
                dropShadow.color = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${a})`
            }
            css.filter = `drop-shadow(${dropShadow.x}px ${dropShadow.y}px ${dropShadow.blur}px ${dropShadow.color})`
        }
        return css
    }

    updateProperty(property) {
        super.updateProperty(property)
        let { src, crop, rotateX, rotateY, dropShadow } = this.elementJson.property
        const transforms = []
        src = src.split('?')[0] + '?imageMogr2/auto-orient'
        if (crop) {
            src = src + `/crop/!${crop.width}x${crop.height}a${crop.left}a${crop.top}`
        }
        if (rotateX) {
            transforms.push('rotateX(180deg)')
        }
        if (rotateY) {
            transforms.push(' rotateY(180deg)')
        }

        this.$gif.css({
            background: `url(${host.file + src}) center / cover`,
            transform: transforms.join(' ')
        })
        // 更新图片的dropShadow
        this.$gif.css(EqxGif.dropShadow(dropShadow))
    }
}
