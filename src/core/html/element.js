import util from '../../utils/util'
import elementType from '../../config/enum.element.type'

export default class EqxElementHtml {
    constructor(eqxPage) {
        this.eqxPage = eqxPage
        this.isSelected = false // 是否选中
        this.$el = null // 组件的dom
        this.elementBox = null // 组件的选择框，这是一个vue组件对象，里面有自己的$el
        this.combineBox = null // 组件的编组框
        this.fixedScale = 0 // 每个元素固定的宽高比 保证元素组合的时候不变形
    }

    static get defaultCss() {
        return {
            left: '0px',
            top: '0px',
            width: '0px',
            height: '0px',
            opacity: 1,
            transform: 'rotateZ(0deg)',
            display: 'block',
            zIndex: 0,

            fontFamily: '',
            fontSize: '12px',
            fontWeight: '', // bold
            fontStyle: '', // italic
            lineHeight: 1.2,
            color: 'rgba(0,0,0,1)',
            backgroundColor: '',
            textAlign: 'center', // left right
            textDecoration: '', // underline line-through

            borderWidth: '0px',
            letterSpacing: '0px',
            borderRadius: '0px',
            borderStyle: 'solid',
            borderColor: 'rgba(255,255,255,1)'
        }
    }

    /**
     * 生成组件id
     * @returns {*}
     */
    static newId(elements) {
        let randomId = 0
        do {
            randomId = util.getRandom(100, 999)
        } while (elements.map(elementJson => elementJson.id).indexOf(randomId) > -1)
        return randomId
    }

    /**
     * 生成组件层级
     * @returns {number}
     */
    static newZIndex(elements) {
        const arr = elements.map(elementJson => elementJson.css.zIndex)
        const zIndexes = arr.length ? arr : [0]
        return Math.max.apply(Math, zIndexes) + 1
    }

    render() {
        const { left, top, transform, zIndex, fontSize } = this.elementJson.css
        // 组件的最外层dom
        const $el = this.$el = document.createElement('div')
        const eleType = this.elementJson.type
        // 只有秀客才显示
        if (Vue.user.allow('showComponentWarning') && [elementType.shape, elementType.frame, elementType.textThreeD, elementType.puzzle].includes(eleType)) {
            const pageScale = Vue.store.state.scene.eqxPage.scale
            if (eleType === elementType.shape) { // 形状
                $el.setAttribute('data-hint', 'app和小程序暂不支持svg组件')
            } else if (eleType === elementType.frame) {
                $el.setAttribute('data-hint', 'app和小程序暂不支持容器组件')
            } else if (eleType === elementType.textThreeD) {
                $el.setAttribute('data-hint', 'app和小程序暂不支持3D立体字组件')
            } else if (eleType === elementType.table) {
                $el.setAttribute('data-hint', 'app和小程序暂不支持表格组件')
            } else if (eleType === elementType.puzzle) {
                $el.setAttribute('data-hint', 'app和小程序暂不支持拼图组件')
            }
            $el.classList.add('hint--top')
            $el.classList.add('hint--rounded')
            $el.classList.add('eqc-hint-lbl')
            const fontSize = Math.round(12 / pageScale) + 'px'
            const paddingLeft = Math.round(10 / pageScale) + 'px'
            const paddingTop = Math.round(8 / pageScale) + 'px'
            const style = document.createElement('style')
            style.innerText = `.eqc-hint-lbl::after { font-size:${fontSize};line-height:${fontSize};padding:${paddingTop} ${paddingLeft}}`
            document.body.appendChild(style)
        } else if ([elementType.shape, elementType.image].includes(eleType)) {
            // 图片形状组件 hover 时提示
            const pageScale = Vue.store.state.scene.eqxPage.scale
            $el.setAttribute('data-hint', '双击或从素材库拖拽进行替换')
            $el.classList.add('hint--top')
            $el.classList.add('hint--rounded')
            $el.classList.add('eqc-hint-lbl')
            const fontSize = Math.round(12 / pageScale) + 'px'
            const paddingLeft = Math.round(10 / pageScale) + 'px'
            const paddingTop = Math.round(8 / pageScale) + 'px'
            const style = document.createElement('style')
            style.innerText = `.eqc-hint-lbl::after { font-size:${fontSize};line-height:${fontSize};padding:${paddingTop} ${paddingLeft}}`
            document.body.appendChild(style)
        }

        $el.css({
            position: 'absolute',
            left,
            top,
            transform,
            zIndex,
            fontSize
        })

        if (eleType === elementType.image) {
            // image el元素需要添加透视
            const maxSize = `${Math.max(parseInt(this.elementJson.css.width), parseInt(this.elementJson.css.height))}px`
            $el.css({
                perspective: maxSize
            })
        }
    }

    setScale(pElementScale = 1, topDiff = 0, leftDiff = 0) {
        const scale = this.eqxPage.scale
        const { left, top, width, height, borderWidth, padding, zIndex, transform, fontSize, border } = this.elementJson.css
        const borderAndPadding = (parseInt(borderWidth) + parseInt(padding || 0)) * 2
        this.$el.css({
            left,
            top,
            zIndex,
            transform,
            fontSize,
            border
        })
        if (this.elementJson.type === elementType.image) {
            // image el元素需要添加透视
            const maxSize = `${Math.max(parseInt(this.elementJson.css.width), parseInt(this.elementJson.css.height))}px`
            this.$el.css({
                perspective: maxSize
            })
        }
        if (pElementScale !== 1 || topDiff !== 0 || leftDiff !== 0 || isNaN(topDiff) || isNaN(leftDiff)) {
            topDiff = isNaN(topDiff) ? 0 : topDiff
            leftDiff = isNaN(leftDiff) ? 0 : leftDiff
            this.updateCss({
                top: Math.round(parseInt(top) * pElementScale + topDiff) + 'px',
                left: Math.round(parseInt(left) * pElementScale + leftDiff) + 'px',
                width: Math.round(parseInt(width) * pElementScale) + 'px',
                height: Math.round(parseInt(height) * pElementScale) + 'px'
            })
            if (this.elementJson.type === 101 || this.elementJson.type === 107) {
                this.updateCss({
                    fontSize: parseInt(fontSize) * pElementScale + 'px'
                })
            }
        }
        const borderPx = 1
        this.elementBox && this.elementBox.$el.css({
            top: Math.round(parseFloat(top) * scale) + 'px',
            left: Math.round(parseFloat(left) * scale) + 'px',
            width: Math.round((parseFloat(width) + borderAndPadding) * scale) + borderPx + 'px',
            height: Math.round((parseFloat(height) + borderAndPadding) * scale) + borderPx + 'px',
            zIndex,
            transform
            // fontSize  去掉fontSize 因为elementBox换成svg之后 font-size会撑大导致svg定位不准
        })
    }

    updateCss(css) {
        Object.assign(this.elementJson.css, css)
        if (this.elementJson.css.display === 'none') {
            this.isSelected = false
        }
    }

    updateProperty(newProperty) {
        const property = this.elementJson.property
        Object.assign(property, newProperty)
        // 清除无用的属性
        for (const key in property) {
            if (property[key] === undefined) {
                delete property[key]
            }
        }
    }

    setElementBox(elementBox) {
        this.elementBox = elementBox
    }
}
