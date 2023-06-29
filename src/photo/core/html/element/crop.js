import EqxElement from '../element'
import elementType from '../../../../config/enum.element.type'
import loader from '../../../../utils/loader'

export default class EqxCrop extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)
        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.crop
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
            }, elementJson.css, { zIndex: 0 })
            elementJson.property = elementJson.property || {
                rotateY: false,
                rotateX: false
            }
        }
        this.elementJson = elementJson
    }

    boxLineColor() {
        return '#FF296A'
    }

    render() {
        super.render()
        const property = this.elementJson.property
        this.setSvg(property.svgSrc, property.imageBase64)
    }

    setSvg(svgSrc, imageBase64) {
        const css = this.elementJson.css
        const newCss = Object.assign({}, css, {
            left: '', // 清除多余的样式
            top: '',
            transform: '',
            zIndex: '',
            verticalAlign: 'top',
            boxSizing: 'content-box'
        })
        return Promise.all([loader.svg(svgSrc)]).then(([$svgTemp]) => {
            // 从xml中筛选出svg元素，没有直接用这个svg而是新创建了一个，是为了setScale
            const $svg = this.$svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            const width = parseFloat($svgTemp.attr('width'))
            const height = parseFloat($svgTemp.attr('height'))
            this.svgWidth = width
            this.svgHeight = height
            let image = `<image x="${-parseFloat(css.left)}" y="${-parseFloat(css.top)}" width='${this.eqxPage.width / this.eqxPage.scale}'  xlink:href='${imageBase64}'/>`
            if (width < height) {
                image = `<image x="${-parseFloat(css.left)}" y="${-parseFloat(css.top)}" height='${this.eqxPage.height / this.eqxPage.scale}'  xlink:href='${imageBase64}'/>`
            }
            $svg.css(newCss)
                .attr({
                    width: newCss.width,
                    height: newCss.height,
                    opacity: 0,
                    viewBox: `0 0 ${parseFloat(newCss.width)} ${parseFloat(newCss.height)}`,
                    preserveAspectRatio: 'none'
                })
                .innerHTML = `<g>
                                <defs>
                                    <clipPath  id="${svgSrc.replace('.svg', '')}" transform="scale(${parseFloat(newCss.width) / width},${parseFloat(newCss.height) / height})">
                                    ${$svgTemp.innerHTML}
                                    </clipPath>
                                </defs>
                                <g style="clip-path:url(#${svgSrc.replace('.svg', '')})">
                                    ${image}
                                </g>
                            </g>`

            this.$image = $svg.querySelector('image')
            this.$el.appendChild($svg)
            // 增加格子
            const borderStyle = `1px solid ${this.boxLineColor()}`
            this.$rowBox = document.createElement('div').css({
                width: '100%',
                height: 'calc(100% / 3)',
                position: 'absolute',
                top: 'calc(100% / 3)',
                left: '0px',
                borderTop: borderStyle,
                borderBottom: borderStyle
            })
            this.$rowBox.attr({ class: 'eqc-photo-element-crop-rowline' })
            this.$el.appendChild(this.$rowBox)
            this.$colBox = document.createElement('div').css({
                width: 'calc(100% / 3)',
                height: '100%',
                position: 'absolute',
                top: '0px',
                left: 'calc(100% / 3)',
                borderLeft: borderStyle,
                borderRight: borderStyle
            })
            this.$colBox.attr({ class: 'eqc-photo-element-crop-colline' })
            this.$el.appendChild(this.$colBox)
            this.$el.classList.add('h2-core-check-ele')

            this.updateProperty(this.elementJson.property)
        })
    }

    setMoveStyle(pIsMove) {
        const borderStyle = pIsMove ? 'dashed' : 'solid'
        this.$rowBox && this.$rowBox.css({
            borderTop: `1px ${borderStyle} ${this.boxLineColor()}`,
            borderBottom: `1px ${borderStyle} ${this.boxLineColor()}`
        })
        this.$colBox && this.$colBox.css({
            borderLeft: `1px ${borderStyle} ${this.boxLineColor()}`,
            borderRight: `1px ${borderStyle} ${this.boxLineColor()}`
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

        if (css.left && css.top) {
            const svgImage = this.$svg.querySelector('g > g > image')
            svgImage.setAttribute('x', -parseFloat(css.left))
            svgImage.setAttribute('y', -parseFloat(css.top))
        }

        if (css.width && css.height) {
            this.$svg.attr({
                width: css.width,
                height: css.height,
                opacity: 0,
                viewBox: `0 0 ${parseFloat(css.width)} ${parseFloat(css.height)}`,
                preserveAspectRatio: 'none'
            })
            const svgClipPath = this.$svg.querySelector('g > defs > clipPath')
            svgClipPath.setAttribute('transform', `scale(${parseFloat(css.width) / this.svgWidth}, ${parseFloat(css.height) / this.svgHeight})`)
            // 通知界面更改显示
            Vue.store.commit('PHOTO_TOOL_CROP_CHANGE_EVENT', {
                action: 'resize',
                params: {
                    width: parseInt(css.width),
                    height: parseInt(css.height)
                }
            })
        }

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
        const { allowResize, lockScale } = this.elementJson.property
        // 1 可调角度 2 可调宽度 4 可调高度 8 可调四个角
        let resizeValue = 0
        if (allowResize) {
            if (lockScale) {
                resizeValue = 8
            } else {
                resizeValue = 2 + 4 + 8
            }
        }
        this.elementBox.updateResizeValue(resizeValue)
    }
}
