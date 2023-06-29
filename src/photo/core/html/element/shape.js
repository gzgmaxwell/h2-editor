import EqxElement from '../element'
import elementType from '../../../../config/enum.element.type'
import loader from '../../../../utils/loader'

export default class EqxShape extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)

        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.photoShape
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
        this.setSvg(property.url)
            .then(() => {
                // this.setPathColor(property)
                this.updateCss(this.elementJson.css)
            })
    }

    // 非标准svg文件内含有一些属性需要去除，否则保存会失败
    formatSvg($svgTemp) {
        const $defs = $svgTemp.getElementsByTagName('defs')
        if ($defs && $defs[0]) {
            $svgTemp.removeChild($defs[0])
        }

        const $sodipodi = $svgTemp.getElementsByTagName('sodipodi:namedview')
        if ($sodipodi && $sodipodi[0]) {
            $svgTemp.removeChild($sodipodi[0])
        }

        const $g = $svgTemp.getElementsByTagName('g')
        if ($g && $g[0]) {
            $g[0].removeAttr('inkscape:label')
            $g[0].removeAttr('inkscape:groupmode')
        }

        const $paths = $svgTemp.getElementsByTagName('path')
        for (let i = 0; i < $paths.length; i++) {
            $paths[i].removeAttr('inkscape:connector-curvature')
            $paths[i].removeAttr('sodipodi:nodetypes')
        }

        return $svgTemp
    }

    setSvg(src) {
        const css = this.elementJson.css
        const newCss = Object.assign({}, css, {
            left: '', // 清除多余的样式
            top: '',
            transform: '',
            zIndex: '',
            border: '',
            verticalAlign: 'top',
            boxSizing: 'content-box'
        })
        return loader.svg(src)
            .then($svgTemp => {
                $svgTemp = this.formatSvg($svgTemp)
                // 从xml中筛选出svg元素，没有直接用这个svg而是新创建了一个，是为了setScale
                const $svg = this.$svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                const width = parseFloat($svgTemp.attr('width'))
                const height = parseFloat($svgTemp.attr('height'))
                $svg.css(newCss)
                    .attr({
                        width,
                        height,
                        viewBox: `0 0 ${width} ${height}`,
                        preserveAspectRatio: 'none'
                    })
                    .innerHTML = `<defs>
                                    <linearGradient id="Gradient_${this.elementJson.id}" class="gradient-direction" x1="0" x2="0" y1="0" y2="1">
                                        <stop class="stop-color-1" offset="0%" stop-color="#ffffff"/>
                                        <stop class="stop-color-2" offset="100%" stop-color="#ffffff"/>
                                    </linearGradient>
                                </defs>
                                ${$svgTemp.innerHTML}`

                // transform清空了翻转会失效，所以再处理一遍
                this.updateProperty(this.elementJson.property)

                this.$paths = $svg.querySelectorAll("[fill], [style*='fill:']")

                this.$el.appendChild($svg)

                this.$el.classList.add('h2-core-check-ele')
                this.$stop1 = $svg.querySelector('.stop-color-1')
                this.$stop2 = $svg.querySelector('.stop-color-2')
                this.$direction = $svg.querySelector('.gradient-direction')
            })
    }

    setPathColor(property) {
        const { items, gradient } = property

        if (items && items.length > 0 && this.$paths && this.$paths.length > 0) {
            if (items.length === 1 && items[0].fill === property.lastModifyColor && gradient && gradient.enabled) {
                this.$paths.forEach((path, i) => path.css({
                    fill: `url(#Gradient_${this.elementJson.id})`
                }))
                if (gradient.colors) {
                    this.$stop1.attr({ 'stop-color': gradient.colors[0] })
                    this.$stop2.attr({ 'stop-color': gradient.colors[1] })
                }
                if ([0, 90, 180, 270].includes(gradient.angle)) {
                    if (gradient.angle === 90) { // 从左到右
                        this.$direction.attr({ x1: '0', x2: '1', y1: '0', y2: '0' })
                    } else if (gradient.angle === 270) { // 从右到左
                        this.$direction.attr({ x1: '1', x2: '0', y1: '0', y2: '0' })
                    } else if (gradient.angle === 180) { // 从上到下
                        this.$direction.attr({ x1: '1', x2: '1', y1: '0', y2: '1' })
                    } else if (gradient.angle === 0) { // 从下到上
                        this.$direction.attr({ x1: '1', x2: '1', y1: '1', y2: '0' })
                    }
                }
            } else {
                // 复杂的形状items没有值，不需要设置颜色
                // 需要this.$paths有值了再设置，因为在setting里的watch会先于它执行
                this.$paths.forEach((path, i) => path.css({ fill: items[i].fill }))
                if (property.gradient && items.length === 1) {
                    property.lastModifyColor = items[0].fill
                    property.gradient.enabled = false
                }
            }
        }
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
        const { dropShadow, rotateX, rotateY, borderRadius } = this.elementJson.property
        const transforms = []

        this.setPathColor(property)
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
        this.$svg && this.$svg.css(EqxShape.dropShadow(dropShadow))
        // 更新形状的圆角属性
        this.$svg && this.$svg.css(EqxShape.borderRadius(borderRadius))
    }
}
