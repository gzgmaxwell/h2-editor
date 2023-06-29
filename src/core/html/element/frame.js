import EqxElement from '../element'
import elementType from '../../../config/enum.element.type'
import { host } from '../../../config/env'
import loader from '../../../utils/loader'
import imgToBase64 from '../../../utils/imgToBase64'
import frameImgSrc from '../../../img/frame.svg'

export default class EqxFrame extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)
        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.frame
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
                rotateY: false,
                rotateX: false
            }
        }
        this.elementJson = elementJson
    }

    render() {
        super.render()
        const property = this.elementJson.property
        this.setSvg(property.src, property.frames)
    }

    setSvg(src, frames) {
        const css = this.elementJson.css
        const newCss = Object.assign({}, css, {
            left: '', // 清除多余的样式
            top: '',
            transform: '',
            zIndex: '',
            verticalAlign: 'top',
            boxSizing: 'content-box'
        })
        let imgSrc = frameImgSrc
        if (frames && frames[0].crop) {
            const { width, height, top, left } = frames[0].crop
            imgSrc = host.file + frames[0].src + `?imageMogr2/auto-orient/crop/!${width}x${height}a${left}a${top}`
        }
        return Promise.all([loader.svg(src), imgToBase64(imgSrc)]).then(([$svgTemp, url]) => {
            // 从xml中筛选出svg元素，没有直接用这个svg而是新创建了一个，是为了setScale
            const $svg = this.$svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            const width = parseFloat($svgTemp.attr('width'))
            const height = parseFloat($svgTemp.attr('height'))
            let image = `<image width='${width}'  xlink:href='${url}'/>`
            if (width < height) {
                image = `<image height='${height}'  xlink:href='${url}'/>`
            }
            $svg.css(newCss)
                .attr({
                    width,
                    height,
                    opacity: 0,
                    viewBox: `0 0 ${width} ${height}`,
                    preserveAspectRatio: 'none'
                })
                .innerHTML = `<g>
                                <defs>
                                    <clipPath  id="${src}">
                                    ${$svgTemp.innerHTML}
                                    </clipPath>
                                </defs>
                                <g  style="clip-path:url(#${src})">
                                    ${image}
                                </g>
                            </g>`

            this.$image = $svg.querySelector('image')
            this.$el.appendChild($svg)
            this.$el.classList.add('h2-core-check-ele')

            this.updateProperty(this.elementJson.property)
        })
    }

    getImageSrc(frames) {
        let tail = ''
        if (frames[0].crop) {
            const { width, height, top, left } = frames[0].crop
            tail = `?imageMogr2/auto-orient/crop/!${width}x${height}a${left}a${top}`
        }
        return new Promise((resolve, reject) => {
            const imgSrc = host.file + frames[0].src + tail
            resolve(imgSrc)
        })
    }

    setImageSrc(frames) {
        this.getImageSrc(frames).then(res => {
            imgToBase64(res).then((src) => {
                this.$image && this.$image.attr({
                    'xlink:href': src
                })
            })
        })
    }

    updateCss(css) {
        super.updateCss(css)
        super.setScale()
        if (Object.prototype.hasOwnProperty.call(css, 'border')) {
            delete css.border
        }
        this.$svg && this.$svg.css(css).css({
            // 清除不需要的属性
            left: '',
            top: '',
            zIndex: '',
            transform: ''
        })

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
        if (property.frames) {
            this.setImageSrc(property.frames)
        }
        super.updateProperty(property)

        const { dropShadow, rotateX, rotateY, borderRadius } = this.elementJson.property
        const transforms = []
        // 更新形状翻转
        if (rotateX) {
            transforms.push('rotateX(180deg)')
        }
        if (rotateY) {
            transforms.push(' rotateY(180deg)')
        }
        this.$svg && this.$svg.css({
            transform: transforms.join(' ')
        })
        // 更新形状的dropShadow
        this.$svg && this.$svg.css(EqxFrame.dropShadow(dropShadow))
        // 更新形状的圆角属性
        this.$svg && this.$svg.css(EqxFrame.borderRadius(borderRadius))
    }
}
