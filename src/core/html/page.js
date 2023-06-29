import { elementType, elementClass } from '../../config/enum'
import bindDrag from './element.drag'
import bindRotate from './element.rotate'
import bindRotateThreeDElement from './element.rotatethreedelement'
import bindResize from './element.resize'
import bindLock from './element.lock'
import bindEdit from './element/text.edit'
import bindTextThreeDEdit from './element/textThreeD.edit'
import bindImageEdit from './element/image.edit'
import bindShapeEdit from './element/shape.edit'
import bindDateEdit from './element/date.edit'
import bindQcEdit from './element/qrcode.edit'
import bindComEdit from './element/combine.edit'
import bindRotateThreeD from './element.rotatethreed'
import bindPuzzle from './element/puzzle.edit'
import commonEdit from './element/common.edit'
import tableEdit from './element/table.edit'
import initElementBox from '../../vue/pages/create/workspace/element.box'
import initTableWrapper from '../../vue/pages/create/workspace/tableWrapper'
import EqxElement from './element'
import EqxHistory from './page.history'
import EqxBackground from './page.background'
import EqxRange from './page.range'
import EqxWatermark from './page.watermark'
import formatPage from './page.format'
import page2Canvas from './page.canvas'
import { host } from '../../config/env'
import gifParse from '../../utils/gifParsing'
import bindWaterMarkEdit from './page.watermark.edit'
import combineInitor from '../../vue/pages/create/workspace/combine.box.js'

export default class EqxPageHtml {
    constructor(pageJson, eqxScene) {
        const sceneJson = eqxScene.sceneJson
        if (pageJson) { // 实例化原有页
            this.pageJson = pageJson
        } else { // 实例化新页
            const pages = sceneJson.pages || []
            this.pageJson = {
                id: EqxPageHtml.newPageId(pages),
                printId: sceneJson.id,
                title: '',
                cover: '',
                version: 0,
                sort: EqxPageHtml.newPageSort(pages),
                properties: {},
                elements: []
            }
        }
        formatPage(this.pageJson)
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
        this.$elements = null
        this.$elementBoxs = null
        this.eqxHistory = new EqxHistory(this)
        this.eqxBackground = new EqxBackground(this)
        this.eqxRange = new EqxRange(this)
        this.eqxWatermark = new EqxWatermark(this)

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
     * 渲染页面，包括背景和组件
     * @param {*} pageJson
     */
    renderPage(pageJson) {
        // 重置属性
        this.$el.innerHTML = ''
        this.eqxElements.length = 0

        formatPage(pageJson)
        Object.assign(this.pageJson, pageJson)
        this.eqxBackground.setBackground(pageJson.properties.background)
        this.eqxBackground.setScale()
        this.eqxRange.setScale()
        this.eqxWatermark.setScale()
        this.$el.appendChild(this.eqxBackground.$el)
        this.$el.appendChild(this.eqxRange.$el)
        this.$el.appendChild(this.eqxWatermark.$el)
        this.renderElements(this.pageJson)
        this.$el.css({
            position: 'absolute',
            width: this.width + 'px',
            height: this.height + 'px',
            zIndex: 0
        })
        // 撤销之后 图层要重新排序
        this.sortCombineElement()
        // 绑定水印点击事件
        bindWaterMarkEdit.call(this.eqxWatermark)
    }

    /**
     * 渲染页面中的组件
     * @param {*} pageJson
     */
    renderElements(pageJson) {
        const sceneJson = this.eqxScene.sceneJson
        const css = {
            position: 'absolute',
            left: 0,
            top: 0
        }
        this.$elements = document.createElement('div').css(css).css({
            width: sceneJson.width + 'px',
            height: sceneJson.height + 'px',
            zIndex: 0,
            transform: `scale(${this.scale})`,
            transformOrigin: 'left top'
        })
        this.$elementBoxs = document.createElement('div').css(css).css({
            width: '100%',
            height: '100%',
            zIndex: 1001, // 需要在遮罩层的上面
            pointerEvents: 'none'
        })
        const elements = pageJson.elements || []
        elements.forEach(element => {
            if (element.type !== elementType.image &&
                element.type !== elementType.text &&
                element.type !== elementType.qrcode &&
                element.type !== elementType.shape &&
                element.type !== elementType.frame &&
                element.type !== elementType.combine &&
                element.type !== elementType.gif &&
                element.type !== elementType.date &&
                element.type !== elementType.table &&
                element.type !== elementType.textThreeD &&
                element.type !== elementType.puzzle) {
                return
            }
            if (element.type === elementType.shape &&
                !element.property.url) {
                return
            }
            if (element.type === elementType.frame &&
                !element.property.src) {
                return
            }
            this.renderElement(element)
        })
        this.buildAllCombineBoxConnection()
        this.$elements.attr({ class: 'eqc-elements' })
        this.$elementBoxs.attr({ class: 'eqc-element-boxs' })
        this.$el.appendChild(this.$elements)
        this.$el.appendChild(this.$elementBoxs)
    }

    /**
     *  建立元素与所有combineBox之间的关联关系
     */
    buildAllCombineBoxConnection() {
        const allElements = this.eqxElements
        // 先置空combine元素的childElements
        allElements.map(item => {
            if (item.elementJson.type === elementType.combine) {
                item.childElements = []
            }
        })
        allElements.map(item => {
            if (Object.prototype.hasOwnProperty.call(item.elementJson, 'combineBoxId')) {
                this.addElementToCombineBox(item.elementJson.combineBoxId, item)
            }
        })
    }

    /**
     *  建立元素与combineBox之间的关联关系
     */
    addElementToCombineBox(combineBoxId, eqxElement) {
        const allElements = this.eqxElements
        allElements.map(item => {
            if (item.elementJson.id === combineBoxId) {
                eqxElement.combineBox = item
                item.isCombine = eqxElement.elementJson.isCombine
                item.childElements.push(eqxElement)
                item.initCss = item.elementJson.css
            }
        })
    }

    /**
     * 添加组件
     * @param {*} elementJson
     */
    renderElement(elementJson) {
        // 生成组件
        elementJson.css.cursor = 'move' // 新加的元素都给一个可以拖动的小手
        const eqxElement = new elementClass[elementJson.type](elementJson, this)
        eqxElement.render()
        this.eqxElements.push(eqxElement)
        this.$elements.appendChild(eqxElement.$el)

        // 生成组件框
        const isText = elementJson.type === elementType.text
        const isQrcode = elementJson.type === elementType.qrcode
        const isCombine = elementJson.type === elementType.combine
        const isDate = elementJson.type === elementType.date
        const isImage = elementJson.type === elementType.image
        const isShape = elementJson.type === elementType.shape
        const isGif = elementJson.type === elementType.gif
        const isTable = elementJson.type === elementType.table
        const isTextThreeD = elementJson.type === elementType.textThreeD
        const isPuzzle = elementJson.type === elementType.puzzle

        let value = 1 + 2 + 4 + 8
        if (isText) {
            if (elementJson.css.writingMode && elementJson.css.writingMode === 'vertical-rl') {
                value = 1 + 4 + 8
            } else {
                value = 1 + 2 + 8
            }
        } else if (isQrcode) {
            value = 1 + 8
        } else if (isCombine) {
            value = 1 + 8
        } else if (isDate) {
            value = 1 + 2 + 8
        } else if (isGif) {
            value = 8
        } else if (isTable) {
            value = 2 + 4 + 16
            // 设置table wrapper
            const tableWrapper = initTableWrapper(eqxElement).$mount()
            eqxElement.setTableWrapper(tableWrapper)
            // this.$elementBoxs.appendChild(tableWrapper.$el)
            eqxElement.$table.parentElement.insertBefore(tableWrapper.$el, eqxElement.$table)
        } else if (isTextThreeD) {
            value = 1 + 8
        }

        const elementBox = initElementBox(eqxElement.elementJson.css, this.scale, value, eqxElement.elementJson.id, eqxElement.elementJson.type).$mount()
        eqxElement.setElementBox(elementBox)
        eqxElement.setScale()
        this.$elementBoxs.appendChild(elementBox.$el)
        eqxElement.$el.style.border = '1px dashed transparent'// 事先加上一个border 免得到时候hover 的时候 组件位置移动
        // 绑定事件
        bindDrag.call(eqxElement)
        bindRotate.call(eqxElement, elementBox)
        bindResize.call(eqxElement, elementBox, value)
        bindLock.call(eqxElement, elementBox, value)
        if (isText) {
            bindEdit.call(eqxElement)
        }
        if (isQrcode) {
            bindQcEdit.call(eqxElement)
        }
        if (isCombine) {
            bindComEdit.call(eqxElement)
        }
        if (isImage) {
            bindRotateThreeDElement.call(eqxElement, elementBox)
            bindImageEdit.call(eqxElement)
        }
        if (isShape) {
            bindShapeEdit.call(eqxElement)
        }
        if (isDate) {
            bindDateEdit.call(eqxElement)
        }
        if (isTable) {
            tableEdit.call(eqxElement)
        }
        if (isTextThreeD) {
            bindRotateThreeD.call(eqxElement, elementBox)
            bindTextThreeDEdit.call(eqxElement)
        }
        if (isPuzzle) {
            bindPuzzle.call(eqxElement)
        }
        commonEdit.call(eqxElement)
        return eqxElement
    }

    /**
     * 添加一个组件
     * @param {*} elementJson
     */
    addElement(elementJson) {
        const isText = elementJson.type === elementType.text
        const eqxElement = this.renderElement(elementJson)
        this.pageJson.elements.push(elementJson)
        // 添加组件之后 要重新绘制图层
        this.sortCombineElement()
        // 添加后让其选中，如果是文字则进入编辑状态
        eqxElement.$el.trigger('mousedown')
        document.trigger('mouseup')
        if (isText) {
            eqxElement.$el.trigger('dblclick')
        }
        return eqxElement
    }

    /**
     * 添加多个组件
     * @param {*} elementJson
     */
    addElements(elementJsons) {
        const eqxElements = []
        elementJsons.forEach(elementJson => {
            const eqxElement = this.renderElement(elementJson)
            eqxElement.isSelected = true
            eqxElements.push(eqxElement)
            this.pageJson.elements.push(elementJson)
            // 添加组件之后 要重新绘制图层
            this.sortCombineElement()
        })
        return eqxElements
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
     * 粘贴组件
     * @param {*} elements
     * @param {*} pasteTimes
     */
    pasteElements(elements, pasteTimes) {
        // 复制前先清除所有组件的选中状态，之后选中复制的新组件
        const arr = []
        const strlState = Vue.store.state.scene.ctrlState
        let distance = 0
        if (!strlState) {
            // 打开粘贴复制的提示框
            Vue.helpnotifier.open('copy', 'CTRL+鼠标左键拖动组件，即可快速完成复制粘贴')
            distance = Math.round(20 * pasteTimes / this.scale) // 复制left、top偏移的距离 拖拽复制不需要偏移
            this.clearElementsSelected()
        }
        const maxZIndex = EqxElement.newZIndex(this.pageJson.elements) - 1

        elements.forEach(elementJson => {
            const css = elementJson.css
            css.left = parseInt(css.left) + distance + 'px'
            css.top = parseInt(css.top) + distance + 'px'
            if (!strlState) {
                css.zIndex += maxZIndex // zIndex增加统一的基数，保存相对层级不变
            }
            elementJson.id = EqxElement.newId(this.pageJson.elements)
            if (elementJson.property.showLayerLabel) {
                delete elementJson.property.showLayerLabel // 复制的所有元素都要去掉图层编组信息 来重新编组
            }

            this.pageJson.elements.push(elementJson)
            const eqxElement = this.renderElement(elementJson)
            if (!strlState) {
                eqxElement.isSelected = true
            }
            arr.push(eqxElement)
        })
        this.pasteCombineElement(arr) // 处理粘贴的组合组件
        return arr
    }

    /**
     * 粘贴组合组件
     * @param {*} elements arr
     */
    pasteCombineElement(arr) {
        arr.forEach(eqxElement => {
            if (eqxElement.elementJson.type === elementType.combine) {
                arr.forEach(item => {
                    if (eqxElement.elementJson.combineId === item.elementJson.combineBoxId) {
                        item.elementJson.combineBoxId = eqxElement.elementJson.id
                        item.combineBox = eqxElement
                        eqxElement.childElements.push(item)
                        item.isSelected = false
                        item.elementJson.isCombine = eqxElement.elementJson.isCombine
                    }
                })
                if (eqxElement.childElements.length < 2) {
                    // console.error('复制异常。。。')
                    eqxElement.deleteCombineRefernce(eqxElement, eqxElement.eqxPage)
                } else {
                    eqxElement.elementJson.combineId = eqxElement.elementJson.id
                    eqxElement.initCss = eqxElement.elementJson.css
                    eqxElement.isCombine = eqxElement.elementJson.isCombine
                    eqxElement.fixedScale = parseFloat(eqxElement.elementJson.css.width) / parseFloat(eqxElement.elementJson.css.height)
                }
            }
        })
        // 粘贴了 组合之后 图层要重新排序
        this.sortCombineElement()
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
                    // table元素的删除
                    if (this.eqxElements[i].tableWrapper) {
                        const $tableWrapper = this.eqxElements[i].tableWrapper.$el
                        $tableWrapper.parentElement.removeChild($tableWrapper)
                    }
                    $el.parentElement.removeChild($el)
                    $elBox.parentElement.removeChild($elBox)
                    if (this.eqxElements[i].elementJson.type === elementType.textThreeD) {
                        this.eqxElements[i].dispose()
                        this.eqxElements[i] = null
                    }
                    this.eqxElements.splice(i, 1)
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
     * 更新组件层级
     * @param eqxElement
     * @param type
     */
    updateZIndex(eqxElement, type) {
        // 当小于2个时，无法进行层级操作
        if (this.eqxElements.length < 2) {
            return
        }
        this.resetCombineZindex(this.eqxElements, eqxElement, type)

        this.eqxElements.forEach(eqxElement => {
            eqxElement.$el.css({
                zIndex: eqxElement.elementJson.css.zIndex
            })
        })
    }

    /**
     * 设置批量组件层级
     * @param {*} eqxElement
     * @param {*} targetElement
     */
    setMutiZIndex(eqxElements, targetElement, upDownFlag) {
        if (!targetElement) {
            return
        }
        // 算法描述：先把
        const sort = []
        this.eqxElements.map(item => {
            // !eqxElements.includes(item) 为啥用id 不用item 是为了防止场景切换导致的vue update err
            const idArr = eqxElements.map(ele => ele.elementJson.id)
            if (!idArr.includes(item.elementJson.id)) {
                sort.push(item)
            }
        })
        let targetIndex = sort.indexOf(targetElement)
        if (!upDownFlag) {
            targetIndex = targetIndex + 1
        }
        // 把批量的插入进去
        sort.splice(targetIndex, 0, ...eqxElements)
        if (eqxElements.length > 1) {
            // 判断 targetElement是不是组内元素 且upDownFlag为true 说明批量是往组内拖的
            // 判断 targetElement是不是combine元素 且upDownFlag为true 说明批量是往组内拖的
            if ((targetElement.combineBox && targetElement.combineBox.isCombine) || (targetElement.elementJson.type === elementType.combine && targetElement.elementJson.property.open)) {
                let combineBoxElement = targetElement.combineBox
                if (targetElement.elementJson.type === elementType.combine) {
                    combineBoxElement = targetElement
                }
                eqxElements.map(item => {
                    // 如果多选的里面有组合  直接打散 重新并入target里面
                    if (item.elementJson.type === elementType.combine) {
                        const childs = item.childElements
                        item.deleteCombineRefernce(item, this)
                        // 解散组合之后 combine就消失了 更新sort数组
                        const combineIndex = sort.indexOf(item)
                        sort.splice(combineIndex, 1)

                        childs.map(childItem => {
                            childItem.combineBox = combineBoxElement
                            combineBoxElement.childElements.push(childItem)
                        })
                    } else {
                        item.combineBox = combineBoxElement
                        combineBoxElement.childElements.push(item)
                    }
                })
                // 把combine 的child里面的combineid 都指为combineid  不然保存之后 组合找不到元素
                combineBoxElement.childElements.map(child => {
                    child.elementJson.combineBoxId = combineBoxElement.elementJson.id
                })
                // 更新编组
                combineInitor.reCalculateCombineBox(combineBoxElement)
            }
            // 如果批量的都是组内元素 且 targetElement不是组内元素 说明批量的往外拖 (targetElement是临时组合也算组外元素)
            if (eqxElements[0].combineBox && eqxElements[0].combineBox.isCombine && (!targetElement.combineBox || (targetElement.combineBox && !targetElement.combineBox.isCombine))) {
                const childs = []
                const combineElement = eqxElements[0].combineBox
                eqxElements[0].combineBox.childElements.map(item => {
                    if (!eqxElements.includes(item)) {
                        childs.push(item)
                    } else {
                        item.combineBox = null
                        item.elementJson.combineBoxId = null
                    }
                })
                if (childs.length > 1) {
                    combineElement.childElements = childs
                    // 把combine 的child里面的combineid 都指为combineid  不然保存之后 组合找不到元素
                    childs.map(item => {
                        item.elementJson.ombineBoxId = combineElement.elementJson.id
                    })
                    // 更新编组
                    combineInitor.reCalculateCombineBox(combineElement)
                } else {
                    // 解散组合
                    combineElement.deleteCombineRefernce(combineElement, this)
                    // 解散组合之后 combine就消失了 更新sort数组
                    const combineIndex = sort.indexOf(combineElement)
                    sort.splice(combineIndex, 1)
                }
            }
        }

        // 给sort 倒叙排列
        let count = sort.length + 1
        sort.map(item => {
            item.elementJson.css.zIndex = count
            count--
        })
        // 最后归整
        const sortElements = sortCombineElementZIndex(sort)
        this.dealCombineSortZindex(sortElements)
    }

    /**
     * 设置移动
     * @param {*} moveX
     * @param {*} moveY
     */
    setMove(moveX, moveY) {
        Vue.store.commit('LAYOUT_WORKSPACESCROLL', { x: moveX, y: moveY })
        this.moveX = moveX
        this.moveY = moveY
        this.$el.css({
            marginLeft: this.moveX + 'px',
            marginTop: this.moveY + 'px'
        })
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
        this.eqxBackground.setScale()
        this.eqxRange.setScale()
        this.eqxWatermark.setScale()

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
            if (elementType.text === eqxElement.elementJson.type) {
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
            } else if (eqxElement.elementJson.type === elementType.textThreeD) {
                const $inputTextDiv = eqxElement.$inputTextDiv
                if ($inputTextDiv) {
                    let textContent = $inputTextDiv.innerHTML
                    textContent = textContent.replace(/<br>/g, '\n')
                    textContent = textContent.replace(/<div>/g, '\n')
                    textContent = textContent.replace(/<\/div>/g, '')
                    textContent = textContent.replace(/&nbsp;/g, ' ')
                    $inputTextDiv.remove()
                    $inputTextDiv.oninput = null
                    eqxElement.isEditing = false
                    const property = eqxElement.elementJson.property
                    // 去掉文本里面的空格
                    let newTextContent = ''
                    for (let i = 0; i < textContent.length; i++) {
                        if (textContent[i] !== ' ') {
                            newTextContent += textContent[i]
                        }
                    }
                    if (newTextContent.length > Vue.env.threeDTextMaxLength) {
                        Vue.notifier.info(`文字内容不能超过${Vue.env.threeDTextMaxLength}个字符`)
                        eqxElement.$text.style.display = 'flex'
                        return
                    }
                    if (property.textContent === newTextContent) {
                        eqxElement.$text.style.display = 'flex'
                        return
                    }
                    property.textContent = newTextContent
                    eqxElement.updateGeometry(property)
                }
            }
        })
    }

    /**
     * 清空页面上的组件和背景
     */
    clearPage() {
        this.eqxBackground.clearBackground()
        this.deleteElements(this.eqxElements.slice())
        this.eqxHistory.add(this)
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
        this.eqxElements.map(ele => {
            if (ele.elementJson.type === elementType.table) {
                // 把cell 里面的数据都保存到table元素里面去
                ele.saveTableData()
            }
        })
        return JSON.stringify(Object.assign({}, { elements: pageJson.elements }, { background: pageJson.properties.background }))
    }

    destroy() {
        this.clear()
    }

    /**
     * page2Canvas
     * @param {*} options
     * @param {使用gif场景标志 默认是true 吸色时用false} useGif
     */
    page2Canvas(options, useGif = true) {
        const { pass, gifElement, pageJsonCopy } = this.checkPageContainGifElement()
        if (pass && useGif) {
            return new Promise((resolve, reject) => {
                const gifSrc = host.file + gifElement.property.src
                // 第一步拆解gif为每帧，返回canvas list
                gifParse.getCanvasList(gifSrc).then((result) => {
                    const canvas = result
                    // 获取gif zindex
                    const gifElementZIndex = gifElement.css.zIndex
                    // 创建gif上面的canvas
                    const pageJson1 = JSON.parse(JSON.stringify(pageJsonCopy))
                    pageJson1.elements = pageJson1.elements.filter((item, index) => {
                        return item.css.zIndex > gifElementZIndex
                    })
                    // 去掉gif上方canvas的背景(含渐变色和背景贴图)
                    pageJson1.properties.background.bottom = {
                        type: 0,
                        color: '',
                        colors: ['', ''],
                        rotate: 0
                    }
                    pageJson1.properties.background.middle = {
                        type: 0,
                        src: '',
                        size: 1,
                        opacity: 1
                    }
                    pageJson1.properties.background.top = {
                        type: 0,
                        color: '',
                        colors: ['', ''],
                        rotate: 0,
                        opacity: 0.4
                    }

                    // 创建gif下面的canvas
                    const pageJson2 = JSON.parse(JSON.stringify(pageJsonCopy))
                    pageJson2.elements = pageJson2.elements.filter((item, index) => {
                        return item.css.zIndex < gifElementZIndex
                    })
                    return new Promise((resolve) => {
                        page2Canvas.call(this, null, pageJson1).then((res1) => {
                            page2Canvas.call(this, null, pageJson2).then((res2) => {
                                const topCanvas = res1
                                const bottomCanvas = res2
                                const width = bottomCanvas.width
                                const hegiht = bottomCanvas.height
                                const gifWidth = parseInt(gifElement.css.width.replace('px', ''))
                                const gifHeight = parseInt(gifElement.css.height.replace('px', ''))
                                const gifLeft = parseInt(gifElement.css.left.replace('px', ''))
                                const gifTop = parseInt(gifElement.css.top.replace('px', ''))
                                // 保存这些配置 用于裁剪大小的时候 直接进行计算
                                if (options && options.transferGifState) {
                                    this.gifOption = {
                                        gifElement: gifElement,
                                        topCanvas: topCanvas,
                                        bottomCanvas: bottomCanvas,
                                        canvas: canvas,
                                        width: width,
                                        height: hegiht
                                    }
                                }
                                canvas.forEach((item, index) => {
                                    const newCanvas = document.createElement('canvas')
                                    const newCanvasCtx = newCanvas.getContext('2d')
                                    newCanvas.height = hegiht
                                    newCanvas.width = width
                                    newCanvasCtx.drawImage(bottomCanvas, 0, 0)
                                    newCanvasCtx.drawImage(item.canvas, 0, 0, item.canvas.width, item.canvas.height, gifLeft, gifTop, gifWidth, gifHeight)
                                    newCanvasCtx.drawImage(topCanvas, 0, 0)
                                    item.canvas = newCanvas
                                })
                                resolve(canvas)
                            })
                        })
                    })
                }).then((result) => {
                    // 拿到组合的canvas 生成新的gif
                    const gifWorkerNum = Vue.store.state.scene.gifWorikerNum
                    const gifQuality = Vue.store.state.scene.gifQuality
                    gifParse.getGifByGifJs(result, gifWorkerNum, gifQuality).then((data) => {
                        if (options && options.transferGifState) {
                            resolve({
                                data: data,
                                gifOption: this.gifOption
                            })
                        } else {
                            resolve(data)
                        }
                    })
                }).catch(err => reject(err))
            })
        } else {
            return page2Canvas.call(this, options)
        }
    }

    generateCanvasToGif(gifOption) {
        // 用于gif导出 计算大小的时候调用
        if (!(gifOption && Object.prototype.hasOwnProperty.call(gifOption, 'canvas'))) {
            return this.page2Canvas({
                transferGifState: true
            })
        } else {
            const { canvas, width, height } = gifOption
            const canvasArr = []
            canvas.forEach((item, index) => {
                const newCanvas = document.createElement('canvas')
                const newCanvasCtx = newCanvas.getContext('2d')
                newCanvas.height = height
                newCanvas.width = width
                newCanvasCtx.drawImage(item.canvas, 0, 0, width, height)
                canvasArr.push({
                    canvas: newCanvas,
                    delay: item.delay
                })
            })

            return new Promise((resolve) => {
                const gifWorkerNum = Vue.store.state.scene.gifWorikerNum
                const gifQuality = Vue.store.state.scene.gifQuality
                gifParse.getGifByGifJs(canvasArr, gifWorkerNum, gifQuality).then((data) => {
                    resolve({
                        data: data,
                        gifOption: gifOption
                    })
                })
            })
        }
    }

    checkPageContainGifElement() {
        let pass = false
        let gifElement = null
        const pageJsonCopy = JSON.parse(JSON.stringify(this.pageJson))
        let gifIndex = -1
        pageJsonCopy.elements.map((element, i) => {
            if (element.type === elementType.gif) {
                pass = true
                gifElement = element
                gifIndex = i
            }
        })
        if (pass) {
            pageJsonCopy.elements.splice(gifIndex, 1) // 删除pageJson中gif所在的元素
        }

        return {
            pass: pass,
            gifElement: gifElement,
            pageJsonCopy: pageJsonCopy
        }
    }

    static newPageId(pages) {
        const ids = pages.map(page => page.id)
        return newNum(ids)
    }

    static newPageSort(pages) {
        const sorts = pages.map(page => page.sort)
        return newNum(sorts)
    }

    sortCombineElement() {
        const sortElements = sortCombineElementZIndex(this.eqxElements)
        this.dealCombineSortZindex(sortElements)
        // 图层变动之后 要及时更新
        this.eqxElements.forEach(eqxElement => {
            eqxElement.$el.css({
                zIndex: eqxElement.elementJson.css.zIndex
            })
        })
    }

    resetCombineZindex(eqxElements, currentElement, type) {
        let sortElementsArr = sortCombineElementZIndex(eqxElements)
        const index = sortElementsArr.indexOf(currentElement)
        // const minIndex = 0
        // const maxIndex = sortElementsArr.length - 1
        switch (type) {
            case 'up':
                sortElementsArr = setZIndexByUpAndDown(sortElementsArr, index, index - 1)
                break
            case 'down':
                sortElementsArr = setZIndexByUpAndDown(sortElementsArr, index, index + 1)
                break
            case 'top':
                currentElement.elementJson.css.zIndex = 10000 // 简单粗暴 后面会重新排序的
                sortElementsArr = sortCombineElementZIndex(eqxElements)
                break
            case 'bottom':
                currentElement.elementJson.css.zIndex = 0
                sortElementsArr = sortCombineElementZIndex(eqxElements)
                break
        }

        return this.dealCombineSortZindex(sortElementsArr)
    }

    dealCombineSortZindex(sortElementsArr) {
        if (Vue.store.state.scene.eqxPage) {
            const eqxElements = Vue.store.state.scene.eqxPage.eqxElements
            let maxIndexCount = eqxElements.length
            let sortArr = []
            sortElementsArr.map(item => {
                if (item.elementJson.type === elementType.combine && item.isCombine) {
                    item.childElements.map(childElement => {
                        childElement.elementJson.css.zIndex = maxIndexCount
                        maxIndexCount--
                    })
                    item.elementJson.css.zIndex = maxIndexCount
                    maxIndexCount--
                    sortArr.push(item)
                    sortArr = sortArr.concat(item.childElements)
                } else {
                    item.elementJson.css.zIndex = maxIndexCount
                    maxIndexCount--
                    sortArr.push(item)
                }
            })
            // 解决临时框的问题
            eqxElements.map(item => {
                if (item.elementJson.type === elementType.combine && !item.isCombine) {
                    if (sortArr.indexOf(item) === -1) {
                        sortArr.push(item)
                    }
                }
            })
            this.eqxElements = sortArr
            return sortArr
        } else {
            return sortElementsArr
        }
    }
}

function newNum(numArr) {
    var ids = numArr.length ? numArr : [0]
    return Math.max.apply(Math, ids) + 1
}

function setZIndexByUpAndDown(sortEqxElements, currentIndex, targetIndex) {
    if (targetIndex < 0 || targetIndex >= sortEqxElements.length) {
        return sortEqxElements
    }
    const currentCss = sortEqxElements[currentIndex].elementJson.css
    const targetCss = sortEqxElements[targetIndex].elementJson.css
    const tempZIndex = currentCss.zIndex
    currentCss.zIndex = targetCss.zIndex
    targetCss.zIndex = tempZIndex
    return sortCombineElementZIndex(sortEqxElements, targetIndex)
}

function sortCombineElementZIndex(eqxElements) {
    // 思路： 组合内的元素不参与排序 排序完毕之后 组合内的元素单独排序
    const sortElementsArr = []
    eqxElements.forEach(element => {
        if ((!element.combineBox && element.elementJson.type !== elementType.combine) || (element.elementJson.type === elementType.combine && element.isCombine) || (element.combineBox && !element.combineBox.isCombine)) {
            sortElementsArr.push(element)
        }
        if (element.elementJson.type === elementType.combine && element.isCombine) {
            // 对组合内的子组件排个序
            element.childElements.sort((a, b) => b.elementJson.css.zIndex - a.elementJson.css.zIndex)
        }
    })
    // 倒叙排列
    sortElementsArr.sort((a, b) => b.elementJson.css.zIndex - a.elementJson.css.zIndex)
    return sortElementsArr
}
