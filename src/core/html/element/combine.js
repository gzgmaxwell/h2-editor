import EqxElement from '../element'
import elementType from '../../../config/enum.element.type'

export default class EqxCombine extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)
        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.combine
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
            elementJson.property = elementJson.property || {}
        }

        this.childElements = [] // 组合框内的元素
        this.elementJson = elementJson
        this.initCss = null // 保存初始化的css 便于放大缩小时进行比较
        this.isCombine = false // 是不是组合 如果是true 那么鼠标移出的时候 该组合组件还在 否则只是临时存在
        this.startRotate = [] // 开始旋转  true为才开始 false为已经开始
    }

    /**
         * 生成组合层级 正式组合的时候
         * @returns {number}
         */
    getMaxZIndexByChildren() {
        const arr = this.childElements.map(element => element.elementJson.css.zIndex)
        const zIndexes = arr.length ? arr : [0]
        return Math.max.apply(Math, zIndexes)
    }

    updateSelfCss(css) {
        super.updateCss(css)
        super.setScale()
        this.$box.css(css)
            .css({
                // 清除不需要的属性
                left: '',
                top: '',
                zIndex: '',
                transform: '',
                border: ''
            })
    }

    updateCss(css) {
        if (css && Object.prototype.hasOwnProperty.call(css, 'width')) {
            // 放大
            // 保证自己的是同比例缩放 优先满足宽度
            const width = this.transferPxtoNum(css.width)
            if (this.fixedScale) {
                css.height = width / this.fixedScale + 'px'
            } else {
                this.fixedScale = parseFloat(width / this.transferPxtoNum(css.height))
                css.height = width / this.fixedScale + 'px'
            }

            // 带着下面的组合元素一起动
            this.childElements.forEach(item => {
                const changeCss = this.calculatePosition(css, item.elementJson.css, item)
                if (changeCss) {
                    item.updateCss(changeCss)
                }
            })
        } else if (css && Object.prototype.hasOwnProperty.call(css, 'transform')) {
            // 旋转
            this.childElements.forEach(item => {
                item.updateCss(this.calculateRotateCordinate(css, item))
            })
        } else if (css && (Object.prototype.hasOwnProperty.call(css, 'left') || Object.prototype.hasOwnProperty.call(css, 'top'))) {
            // 拖动
            this.childElements.forEach(item => {
                const changeCss = {
                    left: css.left ? (this.transferPxtoNum(item.elementJson.css.left) + this.transferPxtoNum(css.left) - this.transferPxtoNum(this.elementJson.css.left)) + 'px' : item.elementJson.css.left,
                    top: css.top ? (this.transferPxtoNum(item.elementJson.css.top) + this.transferPxtoNum(css.top) - this.transferPxtoNum(this.elementJson.css.top)) + 'px' : item.elementJson.css.top
                }
                if (!item.isDrag) {
                    item.updateCss(changeCss)
                }
            })
        }
        super.updateCss(css)
        super.setScale()
        this.$box.css(css)
            .css({
                // 清除不需要的属性
                left: '',
                top: '',
                zIndex: '',
                transform: '',
                border: ''
            })
    }

    moveTogether(addX, addY) {
        if (isNaN(addX) || isNaN(addY)) {
            return
        }
        const css = {
            left: this.transferPxtoNum(this.elementJson.css.left) + Number(addX) + 'px',
            top: this.transferPxtoNum(this.elementJson.css.top) + Number(addY) + 'px'
        }
        let childElements = []
        if (this.combineBox) {
            childElements = this.combineBox.childElements
        } else {
            childElements = this.childElements
        }
        childElements.forEach(item => {
            const changeCss = {
                left: (this.transferPxtoNum(item.elementJson.css.left) + Number(addX)) + 'px',
                top: (this.transferPxtoNum(item.elementJson.css.top) + Number(addY)) + 'px'
            }
            if (!item.isDrag) {
                item.updateCss(changeCss)
            }
        })
        super.updateCss(css)
        super.setScale()
        this.$box.css(css)
            .css({
                // 清除不需要的属性
                left: '',
                top: '',
                zIndex: '',
                transform: '',
                border: ''
            })
    }

    calculatePosition(currentParentPosition, childrenPosition, eqxElement) {
        // 根据父亲的现在的位置和初始的位置，算出扩大了多少，然后根据子孙的位置 算出现在应该在哪个位置
        const gap = this.transferPxtoNum(currentParentPosition.width) / this.transferPxtoNum(this.initCss.width)
        if (this.transferPxtoNum(currentParentPosition.width) === 1 || this.transferPxtoNum(this.initCss.width) === 1) {
            return childrenPosition
        }
        if (gap > 10000000 || gap <= 0 || isNaN(gap)) {
            return childrenPosition
        }
        const resultTop = (this.transferPxtoNum(childrenPosition.top) - this.transferPxtoNum(this.initCss.top)) * gap + this.transferPxtoNum(currentParentPosition.top)
        const resultLeft = (this.transferPxtoNum(childrenPosition.left) - this.transferPxtoNum(this.initCss.left)) * gap + this.transferPxtoNum(currentParentPosition.left)
        const resultWidth = this.transferPxtoNum(childrenPosition.width) * gap
        const resultHeight = this.transferPxtoNum(childrenPosition.height) * gap
        const changeCss = {
            top: resultTop + 'px',
            left: resultLeft + 'px',
            width: resultWidth + 'px',
            height: resultHeight + 'px'
        }
        if (childrenPosition.padding) {
            const padding = this.transferPxtoNum(childrenPosition.padding)
            changeCss.padding = padding * gap + 'px'
        }
        if (childrenPosition.borderWidth) {
            const borderWidth = this.transferPxtoNum(childrenPosition.borderWidth)
            changeCss.borderWidth = borderWidth * gap + 'px'
        }
        // 放大缩小的时候  关于文字和日期的特殊处理
        if (eqxElement.elementJson.type === elementType.text || eqxElement.elementJson.type === elementType.date) {
            const fontSize = this.transferPxtoNum(childrenPosition.fontSize)
            changeCss.fontSize = fontSize * gap + 'px'
        }
        return changeCss
    }

    transferPxtoNum(pxValue) {
        if (pxValue !== '' && pxValue !== undefined) { return Number(pxValue.toString().replace('px', '')) }
    }

    render() {
        super.render()
        const { css } = this.elementJson
        const $box = this.$box = document.createElement('div')

        this.$box.css(css)
            .css({
                // 清除不需要的属性
                left: '',
                top: '',
                zIndex: '',
                transform: ''
            })
        // $box.className = 'eqc-combine-box-box-bbox'
        this.$el.appendChild($box)
    }

    deleteCombineRefernce(eqxElement, eqxPage) {
        eqxPage.eqxElements.forEach(item => {
            if (item.combineBox && item.combineBox.elementJson.id === eqxElement.elementJson.id) {
                item.combineBox = null
                item.elementJson.combineBoxId = null
            }
        })
        eqxPage.deleteElements([eqxElement])
        this.removeChildBorderStyle()
        this.setRotateEnd(this)
        this.removeConnectionWithElements(eqxElement)
    }

    flatCombine(eqxElement, eqxPage) {
        // 组合框只能保留一层 多余的去除
        if (eqxElement.elementJson.type !== elementType.combine) return
        const childElements = []
        eqxElement.childElements.map(item => {
            if (item.elementJson.type === elementType.combine) {
                // 把删除的combine元素下面的子元素绑定到现在的this上面
                item.childElements.map(element => {
                    element.combineBox = this
                    childElements.push(element)
                })
                this.deleteCombineRefernce(item, eqxPage, true)
            } else {
                childElements.push(item)
            }
        })
        eqxElement.childElements = childElements
        // 保存父元素id到子元素中
        this.buildConnecttionWidthElements()
        // 确认组合的时候  要重新排序图层 把组合的层级设置为子元素中层级最高的
        this.elementJson.css.zIndex = this.getMaxZIndexByChildren()
        eqxPage.sortCombineElement(true, this)
        eqxPage.eqxHistory.add(eqxPage)
    }

    getCenterPoint(eqxElement) {
        let css = null
        this.combineBox ? css = this.combineBox.elementJson.css : css = this.elementJson.css
        let { width, height, left, top } = css
        width = this.transferPxtoNum(width)
        height = this.transferPxtoNum(height)
        left = this.transferPxtoNum(left)
        top = this.transferPxtoNum(top)
        let childrenWidth = this.transferPxtoNum(eqxElement.elementJson.css.width) + 2 // 这个多余的2 是border的双倍 因为后面中心点要除以2
        let childrenHeight = this.transferPxtoNum(eqxElement.elementJson.css.height) + 2

        if (Object.prototype.hasOwnProperty.call(eqxElement.elementJson.css, 'padding')) {
            const padding = this.transferPxtoNum(eqxElement.elementJson.css.padding)
            childrenWidth += padding * 2
            childrenHeight += padding * 2
        }
        if (Object.prototype.hasOwnProperty.call(eqxElement.elementJson.css, 'borderWidth')) {
            const borderWidth = this.transferPxtoNum(eqxElement.elementJson.css.borderWidth)
            childrenWidth += borderWidth * 2
            childrenHeight += borderWidth * 2
        }
        return {
            x: left + width / 2 - childrenWidth / 2,
            y: top + height / 2 - childrenHeight / 2
        }
    }

    getRotetaPosition(originPoint, centerPoint, angle) {
        // 任意点(x,y)，绕一个坐标点(x1,y1)逆时针旋转a角度后的新的坐标设为(x0, y0)，有公式：
        // x0= (x - x1)*cos(a) - (y - y1)*sin(a) + x1 ;
        // y0= (x - x1)*sin(a) + (y - y1)*cos(a) + y1;
        return {
            x: (originPoint.x - centerPoint.x) * Math.cos(angle / 180 * Math.PI) - (originPoint.y - centerPoint.y) * Math.sin(angle / 180 * Math.PI) + centerPoint.x,
            y: (originPoint.x - centerPoint.x) * Math.sin(angle / 180 * Math.PI) + (originPoint.y - centerPoint.y) * Math.cos(angle / 180 * Math.PI) + centerPoint.y
        }
    }

    calculateRotateCordinate(changeCss, eqxElement) {
        // 找出旋转中心点
        const centerPoint = this.getCenterPoint(eqxElement)
        let angle = changeCss.transform.replace(/\D/g, '')
        const angleOrigin = eqxElement.elementJson.css.transform.replace(/\D/g, '')
        let rotateAngle = angle = parseFloat(angle)

        if (Object.prototype.hasOwnProperty.call(eqxElement.elementJson.property, 'lastRotate') && eqxElement.elementJson.property.lastRotate) {
            // 已经开始旋转
            const lastRotate = Number(eqxElement.elementJson.property.lastRotate)
            // if (angle !== 0) {
            rotateAngle = angle - lastRotate + 360
            // }
            eqxElement.elementJson.property.lastRotate = angle
        } else {
            // 刚刚开始旋转
            eqxElement.elementJson.property.lastRotate = angle
        }
        // 点坐标  原坐标(left,top)
        const originPoint = {
            x: this.transferPxtoNum(eqxElement.elementJson.css.left),
            y: this.transferPxtoNum(eqxElement.elementJson.css.top)
        }
        const newPostion = this.getRotetaPosition(originPoint, centerPoint, rotateAngle)
        return {
            left: newPostion.x + 'px',
            top: newPostion.y + 'px',
            // backgroundColor: 'gray',
            transform: `rotateZ(${(Number(angleOrigin) + Number(rotateAngle)) % 360}deg)`
        }
    }

    setRotateEnd(combineElement) {
        combineElement.childElements.map(item => {
            if (item.elementJson.type === elementType.combine) {
                item.setRotateEnd(item)
            } else {
                delete item.elementJson.property.lastRotate
            }
        })
    }

    removeChildBorderStyle() {
        this.childElements.map(item => {
            item.updateCss({ border: '1px dashed transparent' })
        })
        this.updateCss({ border: '1px dashed transparent' }) // 自身的也要去掉
    }

    addChildBorderStyle() {
        const { lock } = this.elementJson.property
        this.childElements.map(item => {
            const borderCss = lock ? { border: '1px dashed #ff5448' } : { border: '1px dashed #1593ff' }
            item.updateCss(borderCss)
            if (item.elementJson.type === elementType.combine) {
                item.addChildBorderStyle()
            }
        })
    }

    buildConnecttionWidthElements() {
        this.childElements.map(item => {
            item.elementJson.combineBoxId = this.elementJson.id
            item.elementJson.isCombine = this.isCombine
        })
    }

    removeConnectionWithElements(combineElement) {
        combineElement.childElements.map(item => {
            if (item.elementJson.combineBoxId === combineElement.elementJson.id) {
                delete item.elementJson.combineBoxId
                delete item.elementJson.isCombine
            }
        })
    }

    dbCheckCombine(combineElement) {
        // 50ms之后 检查combine
        setTimeout(() => {
            if (combineElement && combineElement.elementJson.type === elementType.combine) {
                // 如果combine 没有子元素 则直接删除
                if (combineElement.childElements.length === 0) {
                    combineElement.deleteCombineRefernce(combineElement, combineElement.eqxPage)
                }
            }
        }, 50)
    }

    copyCombineBox(combineElement) {
        combineElement.childElements.map(item => {
            if (item.elementJson.type === elementType.combine) {
                combineElement.copyCombineBox(item)
            } else {
                Vue.store.state.scene.elementsCopied.push(JSON.parse(JSON.stringify(item.elementJson)))
            }
        })
        combineElement.elementJson.isCombine = combineElement.isCombine // 保存组合框是临时组合还是已经组合
        combineElement.elementJson.combineId = combineElement.elementJson.id // 保存自身的id 粘贴的时候好匹配子元素
        Vue.store.state.scene.elementsCopied.push(JSON.parse(JSON.stringify(combineElement.elementJson)))
    }

    deleteCombineElement(combineElement) {
        combineElement.childElements.map(item => {
            if (item.elementJson.type === elementType.combine) {
                combineElement.deleteCombineElement(item)
                combineElement.eqxPage.deleteElements([item])
            } else {
                combineElement.eqxPage.deleteElements([item])
            }
        })
        combineElement.eqxPage.deleteElements([combineElement])
    }

    removeCombineDragCursor() {
        // 当combine 一旦锁定的时候 拖动的标志要变为鼠标箭头
        // 因为锁定只有一层 所以不会出现多层嵌套的情况
        this.childElements.map(item => {
            item.updateCss({ cursor: 'default' })
        })
        this.updateCss({ cursor: 'default' })
    }

    addCombineDragCursor() {
        this.childElements.map(item => {
            item.updateCss({ cursor: 'move' })
        })
        this.updateCss({ cursor: 'move' })
    }
}
