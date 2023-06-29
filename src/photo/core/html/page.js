import { elementType, elementClass } from '../../../config/enum'
import EqxBackground from './page.background'
import page2Canvas from './page.canvas'
import initElementBox from '../../vue/pages/photo/workspace/element.box'
import bindRotate from './element.rotate'
import bindEdit from './element/text.edit'
import bindDrag from './element.drag'
import bindResize from './element.resize'
import commonEdit from './element/common.edit'

export default class EqxPageHtml {
    constructor(pageJson, eqxScene) {
        const sceneJson = eqxScene.sceneJson
        if (pageJson) {
            // 实例化原有页
            this.pageJson = pageJson
        } else {
            // 实例化新页
            const pages = sceneJson.pages || []
            this.pageJson = {
                id: EqxPageHtml.newPageId(pages),
                sort: EqxPageHtml.newPageSort(pages),
                cover: '',
                properties: {},
                elements: []
            }
        }

        this.eqxScene = eqxScene
        this.eqxElements = []
        this.savedJson = ''
        this.sceneWidth = sceneJson.width // 修改尺寸时，判断是否能保存
        this.sceneHeight = sceneJson.height // 修改尺寸时，判断是否能保存
        this.width = sceneJson.width // 实际展示时的width，随scale变化
        this.height = sceneJson.height // 实际展示时的height，随scale变化
        this.scale = 1
        this.moveX = 0
        this.moveY = 0
        this.$el = null
        this.eqxBackground = new EqxBackground(this)
        this.setSavedJson(this.pageJson)
    }

    /**
     * 将page中的dom挂载到某个dom下
     * @param {*}
     */
    mount($el) {
        this.$el = $el
    }

    /**
     * 渲染页面，包括背景
     * @param {*} pageJson
     * @param {*} drawBackground false：如果是形状裁切则需要把背景隐藏
     */
    renderPage(pageJson, drawBackground = true) {
        // 清空html
        this.$el.innerHTML = ''
        // 合并pageJson
        Object.assign(this.pageJson, pageJson)
        // 设置背景
        this.eqxBackground.setBackground(pageJson.properties.background)
        // 添加背景dom
        this.$el.appendChild(this.eqxBackground.$el)
        // 如果是形状裁切则需要把背景隐藏
        if (!drawBackground) {
            this.eqxBackground.$el.css({ display: 'none' })
        }
        // 渲染元素
        this.renderElements(this.pageJson, drawBackground)
        // 属性赋值
        if (pageJson.properties.background) {
            this.width = pageJson.properties.background.width
            this.height = pageJson.properties.background.height
            this.eqxScene.sceneJson.width = this.width
            this.eqxScene.sceneJson.height = this.height
        }
        // 设置样式
        this.$el.css({
            position: 'absolute',
            width: this.width + 'px',
            height: this.height + 'px',
            zIndex: 0
        })
    }

    /**
     * 渲染元素
     * @param {页面json} pageJson
     * @param {是否渲染背景} drawBackground
     */
    renderElements(pageJson, drawBackground) {
        const sceneJson = this.eqxScene.sceneJson
        const css = {
            position: 'absolute',
            left: 0,
            top: 0
        }
        // 创建元素dom根节点
        this.$elements = document.createElement('div').css(css).css({
            width: sceneJson.width + 'px',
            height: sceneJson.height + 'px',
            zIndex: 0,
            transform: `scale(${this.scale})`,
            transformOrigin: 'left top'
        })
        // 创建元素box根节点
        this.$elementBoxs = document.createElement('div').css(css).css({
            width: '100%',
            height: '100%',
            zIndex: 1001, // 需要在遮罩层的上面
            pointerEvents: 'none'
        })
        const elements = pageJson.elements || []
        // 遍历并渲染元素
        elements.forEach(element => {
            if (drawBackground) {
                // 如果渲染背景只允许文本、形状、图片
                if (element.type !== elementType.photoText &&
                    element.type !== elementType.photoShape &&
                    element.type !== elementType.photoImage) {
                    return
                }
                // 形状判断url属性
                if (element.type === elementType.photoShape && !element.property.url) {
                    return
                }
            } else {
                // 如果不渲染背景只允许裁切框
                if (element.type !== elementType.crop) {
                    return
                }
            }
            // 渲染元素
            this.renderElement(element)
        })
        // 元素dom根节点添加class
        this.$elements.attr({ class: 'eqc-photo-elements' })
        // 元素box根节点添加class
        this.$elementBoxs.attr({ class: 'eqc-photo-element-boxs' })
        // 添加到页面
        this.$el.appendChild(this.$elements)
        this.$el.appendChild(this.$elementBoxs)
    }

    /**
     * 添加组件
     * @param {*} elementJson
     */
    renderElement(elementJson) {
        const isPhotoText = elementJson.type === elementType.photoText
        const isCrop = elementJson.type === elementType.crop
        // 新加的元素都给一个可以拖动的小手
        elementJson.css.cursor = 'move'
        // 根据元素类型实例化元素对象
        const eqxElement = new elementClass[elementJson.type](elementJson, this)
        // 渲染元素
        eqxElement.render()
        // 保存元素到eqxElements
        this.eqxElements.push(eqxElement)
        // 将元素添加到elements的DOM节点后
        this.$elements.appendChild(eqxElement.$el)
        // 计算组件框的规则
        let value = 1 + 2 + 4 + 8
        if (isPhotoText) {
            if (elementJson.css.writingMode && elementJson.css.writingMode === 'vertical-rl') {
                value = 1 + 4 + 8
            } else {
                value = 1 + 2 + 8
            }
        } else if (isCrop) {
            value = 2 + 4 + 8
        }
        // 初始化组件框
        const elementBox = initElementBox(eqxElement.elementJson.css, this.scale, value, eqxElement.elementJson.id).$mount()
        // 组件关联框
        eqxElement.setElementBox(elementBox)
        // 设置比例尺
        eqxElement.setScale()
        // 将组件框的dom添加到elementBoxs上
        this.$elementBoxs.appendChild(elementBox.$el)
        // 事先加上一个border 免得到时候hover 的时候 组件位置移动
        eqxElement.$el.style.border = '1px dashed transparent'
        // 绑定点击事件
        bindDrag.call(eqxElement)
        // 绑定旋转事件
        bindRotate.call(eqxElement, elementBox)
        // 绑定改变大小事件
        bindResize.call(eqxElement, elementBox, value)
        // 绑定mouseover、mouseleave事件
        commonEdit.call(eqxElement)
        // 文本组件 绑定双击编辑事件
        isPhotoText && bindEdit.call(eqxElement)
        return eqxElement
    }

    /**
     * 批量添加元素
     */
    addElements(elementJsons) {
        elementJsons.forEach(elementJson => {
            // 渲染元素
            this.renderElement(elementJson)
            // 将元素json保存到pageJson的elements数组里面
            this.pageJson.elements.push(elementJson)
        })
    }

    /**
     * 添加一个组件
     * @param {*} elementJson
     */
    addElement(elementJson) {
        // 渲染元素
        const eqxElement = this.renderElement(elementJson)
        // 将元素json保存到pageJson的elements数组里面
        this.pageJson.elements.push(elementJson)
        // 触发元素的mousedown事件让其选中
        eqxElement.$el.trigger('mousedown')
        // 为了触发元素的mouseup事件去触发documnet的mouseup事件
        document.trigger('mouseup')
        // text元素 触发双击事件让其处于编辑状态
        const isPhotoText = elementJson.type === elementType.photoText
        isPhotoText && eqxElement.$el.trigger('dblclick')
        // 裁切元素 添加蒙层
        const isCrop = elementJson.type === elementType.crop
        if (isCrop) {
            this.$cropMask = document.createElement('div').css({
                width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', position: 'absolute', left: 0, top: 0
            })
            this.$cropMask.attr({ class: 'eqc-photo-crop-mask' })
            this.$el.insertBefore(this.$cropMask, this.$elements)
            // 将其他元素穿透
            this.eqxElements.forEach(item => {
                if (item.elementJson.type !== elementType.crop) {
                    item.$el.style.pointerEvents = 'none'
                }
            })
        }
        return eqxElement
    }

    /**
     * 获取组件需要居中时的位置
     * @param {*} eleWidth
     * @param {*} eleHeight
     * @param {*} scale
     */
    getElementPosOfCenter(eleWidth, eleHeight, scale) {
        const tranlsate = /translate\((.*?)px,\s*(.*?)px\)/.exec(this.$el.css('transform')) || ['', 0, 0]
        const tranlsateX = Number(tranlsate[1] || 0)
        const tranlsateY = Number(tranlsate[2] || 0)
        const { width, height } = this.eqxScene.sceneJson
        return {
            left: (width - eleWidth) / 2 - tranlsateX / scale,
            top: (height - eleHeight) / 2 - tranlsateY / scale
        }
    }

    /**
     * 删除选中的组件
     * @param {*} eqxElements
     */
    deleteElements(eqxElements) {
        const deleteIds = []
        for (let j = eqxElements.length - 1; j >= 0; j--) {
            for (let i = this.eqxElements.length - 1; i >= 0; i--) {
                if (this.eqxElements[i].elementJson.id === eqxElements[j].elementJson.id) {
                    const $el = this.eqxElements[i].$el
                    const $elBox = this.eqxElements[i].elementBox.$el
                    $el.parentElement.removeChild($el)
                    $elBox.parentElement.removeChild($elBox)
                    this.eqxElements.splice(i, 1)
                    // 由于可能有置顶|置底|上移|下移操作，所以
                    // this.eqxElements 里的元素有可能与
                    // this.pageJson.eqxElements里的顺序不一致，
                    // 此时不能根据i来删除this.pageJson.elements中的元素
                    // this.pageJson.elements.splice(i, 1)
                    deleteIds.push(eqxElements[j].elementJson.id)
                }
            }
        }

        this.pageJson.elements = this.pageJson.elements.filter((v) => deleteIds.indexOf(v.id) === -1)
        // 多加一个保险
        if (this.eqxElements.length === 0) {
            this.pageJson.elements = []
        }
    }

    /**
     * 移动选中的组件
     * @param {*} eqxElements
     * @param {*} param1 x===1时往右移动，x===-1时往左移动，y===1时往下移动，y===-1时往上移动，
     */
    moveElements(eqxElements, { x = 1, y = 1 }) {
        const value = Math.round(1 / this.scale) || 1 // 最小需要移动1个像素
        eqxElements.forEach(eqxElement => {
            const property = eqxElement.elementJson.property
            if (!property.lock) { // 检测当前选中组件中是否含锁定组件，锁定组件不许移动
                const css = eqxElement.elementJson.css
                const left = parseInt(css.left) + value * x + 'px'
                const top = parseInt(css.top) + value * y + 'px'
                eqxElement.updateCss({ left, top })
            }
        })
    }

    /**
     * 设置移动
     * @param {*} moveX
     * @param {*} moveY
     */
    setMove(moveX, moveY) {
        this.moveX = moveX
        this.moveY = moveY
        if (moveX !== 0 || moveY !== 0) {
            this.$el.css({
                marginLeft: this.moveX + 'px',
                marginTop: this.moveY + 'px'
            })
        }
    }

    /**
     * 设置缩放
     * @param {*} type + 放大，- 缩小
     * @param {*} workspaceWidth 工作区宽度
     * @param {*} workspaceHeight 工作区高度
     * @param {*} step 缩放叠加量
     */
    setScale(type, workspaceWidth, workspaceHeight, step = 0.2) {
        const { width, height } = this.eqxScene.sceneJson
        // 先把比例保存到临时变量，因为标尺要依赖页面宽高，页面宽高要根据比例计算，如果放在前面则比例以改变就会绘制标尺，则有问题
        let tempScale = this.scale
        // 判断是放大还是缩小
        if (type === '+') {
            tempScale *= 1 + step
        } else if (type === '-') {
            tempScale *= 1 - step
        } else if (type === '1') {
            tempScale = 1
        } else if (type === 'fit' || type === 'changeCategoryFit') {
            const sceneJson = this.eqxScene.sceneJson
            const workspaceRatio = workspaceWidth / workspaceHeight
            const editorRatio = sceneJson.width / sceneJson.height
            // 最大尺寸不能超过工作区，并用两边需要各留50px
            // 如果工作区特别小，则给一个最小值100
            // 如果作品尺寸比100还小，是取作品尺寸
            // 值越大越扁 值越小越窄
            if (editorRatio > workspaceRatio) {
                this.width = Math.min(sceneJson.width, Math.max(Math.abs(workspaceWidth - 100), 100))
                this.height = this.width / editorRatio
            } else {
                this.height = Math.min(sceneJson.height, Math.max(Math.abs(workspaceHeight - 100), 100))
                this.width = this.height * editorRatio
            }
            tempScale = this.width / sceneJson.width
        }

        // 限制放大缩小的边界值
        if (this.scale > 4) {
            tempScale = 4
        } else if (this.scale < 0.1) {
            tempScale = 0.1
        }

        this.width = width * tempScale
        this.height = height * tempScale

        // 如果编辑区宽高都小于工作区，则居中显示
        if (this.width <= workspaceWidth && this.height <= workspaceHeight) {
            this.setMove(0, 0)
        }
        this.$el.css({
            width: this.width + 'px',
            height: this.height + 'px'
        })
        this.$elements.css({
            width: width + 'px',
            height: height + 'px',
            transform: `scale(${tempScale})`
        })
        this.scale = tempScale
        // this.eqxBackground.setScale()
        // this.eqxRange.setScale()

        let elementScale = 1
        let topDiff = 0
        let leftDiff = 0
        if (type === 'changeCategoryFit') {
            const oldWidth = this.eqxScene.sceneJson.oldWidth
            const oldHeight = this.eqxScene.sceneJson.oldHeight
            const newWidth = this.eqxScene.sceneJson.width
            const newHeight = this.eqxScene.sceneJson.height
            const oldEditorRatio = oldWidth / oldHeight
            const newEditorRatio = newWidth / newHeight
            if (oldEditorRatio === newEditorRatio) {
                elementScale = newWidth / oldWidth
            } else if (oldEditorRatio < newEditorRatio) {
                elementScale = newHeight / oldHeight
                leftDiff = (newWidth - (oldWidth * elementScale)) / 2
            } else {
                elementScale = newWidth / oldWidth
                topDiff = (newHeight - (oldHeight * elementScale)) / 2
            }
        }
        this.eqxElements.forEach((eqxElement) => {
            if (type === 'changeCategoryFit') {
                // 智能
                // 只调整非子元素
                if (eqxElement.combineBox === null) {
                    eqxElement.setScale(elementScale, topDiff, leftDiff)
                }
            } else {
                // 非智能
                eqxElement.setScale()
            }
        })
    }

    /**
     * 初始化尺寸
     * @param {*} workspaceWidth
     * @param {*} workspaceHeight
     */
    initSize(workspaceWidth, workspaceHeight) {
        const sceneJson = this.eqxScene.sceneJson
        const workspaceRatio = workspaceWidth / workspaceHeight
        const editorRatio = sceneJson.width / sceneJson.height

        // 最大尺寸不能超过工作区，并用两边需要各留50px
        // 如果工作区特别小，则给一个最小值100
        // 如果作品尺寸比100还小，是取作品尺寸
        // 值越大越扁 值越小越窄
        if (editorRatio > workspaceRatio) {
            this.width = Math.min(sceneJson.width, Math.max(Math.abs(workspaceWidth - 100), 100))
            this.height = this.width / editorRatio
        } else {
            this.height = Math.min(sceneJson.height, Math.max(Math.abs(workspaceHeight - 100), 100))
            this.width = this.height * editorRatio
        }

        // 设置缩放比例
        this.scale = this.width / sceneJson.width
    }

    /**
     * 清除页面所有组件的状态
     */
    clearElementsSelected() {
        this.eqxElements.forEach(eqxElement => {
            // 清除页面所有组件的选中状态
            eqxElement.isSelected = false
            // 如果是文本则清除编辑状态
            if (elementType.photoText === eqxElement.elementJson.type) {
                const $text = eqxElement.$text
                const content = eqxElement.formatContent($text.innerText) || '双击进行编辑'
                $text.removeAttr('contenteditable')
                $text.innerHTML = content
                $text.oninput = null // 清除编辑时绑定的事件
                $text.onpaste = null
                eqxElement.isEditing = false
                eqxElement.updateProperty({
                    content
                })
            }
        })
    }

    /**
     * 清空页面上的组件和背景
     */
    clearPage() {
        // 只删除裁切组件
        this.deleteElements(this.eqxElements.slice())
        this.eqxBackground.clearBackground()
    }

    /**
     * 清空元素
     */
    clearElements() {
        this.deleteElements(this.eqxElements.slice())
    }

    /**
     * 清空页面上的裁切组件
     */
    clearCrop() {
        if (this.$cropMask) {
            this.deleteElements(this.eqxElements.filter(item => { return item.elementJson.type === elementType.crop }))
            this.$el.removeChild(this.$cropMask)
            this.$cropMask = null
            // 将其他元素穿透属性删除
            this.eqxElements.forEach(item => {
                if (item.elementJson.type !== elementType.crop) {
                    item.$el.style.pointerEvents = null
                }
            })
        }
    }

    setSavedJson(pageJson) {
        this.savedJson = this.transformJson(pageJson)
    }

    get isModified() {
        const { width, height } = this.eqxScene.sceneJson
        return this.transformJson(this.pageJson) !== this.savedJson ||
            this.sceneWidth !== width ||
            this.sceneHeight !== height
    }

    transformJson(pageJson) {
        return JSON.stringify(Object.assign({}, { elements: pageJson.elements }, { background: pageJson.properties.background }))
    }

    /**
     * page2Canvas
     * @param {*} options
     */
    page2Canvas(options) {
        return page2Canvas.call(this, options)
    }

    /**
     * 高级裁切不需要显示背景
     */
    page2CanvasWithOutBackground() {
        return page2Canvas.call(this, null, null, false)
    }

    /**
     * 销毁
     */
    destroy() {
        // TODO
        // this.clear()
    }

    /**
     * 生成pageId
     * @param {*} pages
     */
    static newPageId(pages) {
        const ids = pages.map(page => page.id)
        return EqxPageHtml.newNum(ids)
    }

    /**
     * 生成pageSort
     * @param {*} pages
     */
    static newPageSort(pages) {
        const sorts = pages.map(page => page.sort)
        return EqxPageHtml.newNum(sorts)
    }

    static newNum(numArr) {
        var ids = numArr.length ? numArr : [0]
        return Math.max.apply(Math, ids) + 1
    }
}
