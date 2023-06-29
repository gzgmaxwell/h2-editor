import elementType from '../../../../config/enum.element.type'
export default class GuideLine {
    constructor() {
        this.threshold = 3 // 吸附的阈值
        this.startBigRect = {} // 多选组件的大矩形初始位置
        this.bigRect = {} // 多选组件的大矩形位置
        this.workspaceRect = {} // 工作区的矩形
        this.guideRects = [] // 需要参考的矩形
        this.moveObj = { // 参考线吸附时目标对象移动距离
            left: 0,
            top: 0
        }
        this.targetRect = {} // 目标矩形位置
    }

    /**
     * 启动时需要重置的一些变量
     */
    start(moveObj) {
        this.moveObj = moveObj
        this.workspaceRect = Vue.store.state.scene.eqxPage.$el.parentElement.getBoundingClientRect()
        this.startBigRect = {
            left: Number.MAX_SAFE_INTEGER,
            top: Number.MAX_SAFE_INTEGER,
            right: Number.MIN_SAFE_INTEGER,
            bottom: Number.MIN_SAFE_INTEGER,
            width: 0,
            height: 0,
            centerX: 0,
            centerY: 0
        }
        this.bigRect = {}
        this.guideRects = []
        this.setGuideRects()
    }

    /**
     * 初始化等高等宽线
     */
    startEqualWidthHeight() {
        this.workspaceRect = Vue.store.state.scene.eqxPage.$el.parentElement.getBoundingClientRect()
        this.targetRect = {}
        this.guideRects = []
        this.setEqualWHGuideRects()
    }

    /**
     * 设置多选组件的大矩形位置，在移动时动态设置
     */
    setBigRect() {
        const bigRect = this.bigRect
        const startBigRect = this.startBigRect
        bigRect.left = startBigRect.left + this.moveObj.left
        bigRect.top = startBigRect.top + this.moveObj.top
        bigRect.right = bigRect.left + startBigRect.width
        bigRect.bottom = bigRect.top + startBigRect.height
        bigRect.centerX = bigRect.left + startBigRect.width / 2
        bigRect.centerY = bigRect.top + startBigRect.height / 2
        bigRect.width = bigRect.right - bigRect.left
        bigRect.height = bigRect.bottom - bigRect.top
    }

    /**
     * 设置多选组件的大矩形初始位置，需要循环设置
     */
    setBigRectStart(eqxElement) {
        const startBigRect = this.startBigRect
        const rect = eqxElement.$el.getBoundingClientRect()
        startBigRect.left = Math.min(startBigRect.left, rect.left)
        startBigRect.top = Math.min(startBigRect.top, rect.top)
        startBigRect.right = Math.max(startBigRect.right, rect.left + rect.width)
        startBigRect.bottom = Math.max(startBigRect.bottom, rect.top + rect.height)
        startBigRect.width = startBigRect.right - startBigRect.left
        startBigRect.height = startBigRect.bottom - startBigRect.top
        startBigRect.centerX = startBigRect.left + startBigRect.width / 2
        startBigRect.centerY = startBigRect.top + startBigRect.height / 2
    }

    /**
     * 设置需要参考的矩形
     */
    setGuideRects() {
        const eqxPage = Vue.store.state.scene.eqxPage
        const eqxElementsSelected = Vue.store.state.scene.eqxElementsSelected
        const grid = Vue.store.state.guideLine.grid
        const ruler = Vue.store.state.guideLine.ruler

        // 将画布作为参考
        const editorRect = eqxPage.$el.getBoundingClientRect()
        this.guideRects.push(editorRect)

        // 将每个组件作为参考(未选中)
        eqxPage.eqxElements.forEach(eqxElement => {
            if (!eqxElementsSelected.includes(eqxElement)) {
                const rect = eqxElement.$el.getBoundingClientRect()
                this.guideRects.push(rect)
            }
        })

        // 将网络线作为参考
        if (grid.show) {
            // 横线
            for (let j = 1; j < grid.colNum; j++) {
                // 这种情况和画布的中线重合，可以排除，这样能减少一次循环
                if (j === grid.colNum / 2) {
                    return
                }
                this.guideRects.push({ top: editorRect.top + j / grid.colNum * editorRect.height })
            }
            // 竖线
            for (let i = 1; i < grid.rowNum; i++) {
                // 这种情况和画布的中线重合，可以排除，这样能减少一次循环
                if (i === grid.rowNum / 2) {
                    return
                }
                this.guideRects.push({ left: editorRect.left + i / grid.rowNum * editorRect.width })
            }
        }

        if (ruler.show) {
            ruler.xLines.forEach(item => {
                this.guideRects.push({ left: editorRect.left + item.left * eqxPage.scale })
            })
            ruler.yLines.forEach(item => {
                this.guideRects.push({ top: editorRect.top + item.top * eqxPage.scale })
            })
        }
    }

    /**
     * 显示参考线
     */
    showGuideLine() {
        const bigRect = this.bigRect
        const guideList = []
        this.guideRects.forEach(rect => {
            const { left, top, right, bottom, width, height } = rect

            // 垂直方向上的参考
            const rectY = {}
            // 为了减少循环的次数，而且需要考虑0的情况
            if (top !== undefined) rectY.top = top
            if (bottom !== undefined) rectY.bottom = bottom
            if (height !== undefined) rectY.centerY = top + height / 2

            // 水平方向上的参考
            const rectX = {}
            // 为了减少循环的次数，而且需要考虑0的情况
            if (left !== undefined) rectX.left = left
            if (right !== undefined) rectX.right = right
            if (width !== undefined) rectX.centerX = left + width / 2

            // 垂直方向上的坐标
            const bigRectY = {
                top: bigRect.top,
                bottom: bigRect.bottom,
                centerY: bigRect.centerY
            }

            // 水平方向上的坐标
            const bigRectX = {
                left: bigRect.left,
                right: bigRect.right,
                centerX: bigRect.centerX
            }

            // 参考矩形的React
            const guideEleRect = {}
            if (top !== undefined) guideEleRect.top = top
            if (bottom !== undefined) guideEleRect.bottom = bottom
            if (left !== undefined) guideEleRect.left = left
            if (right !== undefined) guideEleRect.right = right
            if (width !== undefined) guideEleRect.width = width
            if (height !== undefined) guideEleRect.height = height
            guideList.push(guideEleRect)

            // 分别显示垂直参考线和水平参考线，最多能显示6条线
            this.showGuideLinePart('left', rectX, bigRectX)
            this.showGuideLinePart('top', rectY, bigRectY)
        })
        // 移动大矩形的Rect
        const moveBigRect = {
            top: bigRect.top,
            bottom: bigRect.bottom,
            left: bigRect.left,
            right: bigRect.right,
            width: bigRect.width,
            height: bigRect.height
        }
        // 显示间距
        this.showSpacing('top', guideList, moveBigRect)
        this.showSpacing('left', guideList, moveBigRect)
    }

    /**
     * 显示部分参考线，分为水平和垂直的，type为left或top
     */
    showGuideLinePart(type, eqxElementRect, bigRect) {
        for (const key1 in eqxElementRect) {
            for (const key2 in bigRect) {
                if (Math.abs(eqxElementRect[key1] - bigRect[key2]) <= this.threshold) {
                    // 吸附时移动的距离
                    this.moveObj[type] = eqxElementRect[key1] - this.startBigRect[key2]
                    Vue.store.commit('GUIDE_LINE_' + key2.toUpperCase(), { css: { display: 'block', [type]: eqxElementRect[key1] - this.workspaceRect[type] + 'px' } })
                }
            }
        }
    }

    /**
     * 清除参考线
     * 对齐线和等间距矩形
     */
    clearGuideLine() {
        Vue.store.commit('GUIDE_LINE_CLEAR')
        Vue.store.commit('GUIDE_SPACING_CLEAR')
    }

    /**
     * 显示间距
     * type分为两种：top：显示间宽  left：显示间高
     */
    showSpacing(type, list, moveRect) {
        const dlist = this.formatListByDirection(type, list, moveRect)
        // 显示目标矩形四周相同的间距
        this.showSpaceByDirection('left', dlist.leftList, moveRect)
        this.showSpaceByDirection('right', dlist.rightList, moveRect)
        this.showSpaceByDirection('top', dlist.topList, moveRect)
        this.showSpaceByDirection('bottom', dlist.bottomList, moveRect)
    }

    /**
     * 把参考矩形按照目标矩形的上下左右分组排序
     * 参考矩形在下方|右方，从小到大排序
     * 参考矩形在上方|左方，从大到小排序
     * @param {*} type
     * @param {*} list
     */
    formatListByDirection(type, list, moveRect) {
        const leftList = []
        const rightList = []
        const topList = []
        const bottomList = []
        list.forEach(v => {
            // 左
            if (type === 'top' && v.right < moveRect.left) {
                leftList.push(v)
            }
            // 右
            if (type === 'top' && v.left > moveRect.right) {
                rightList.push(v)
            }
            // 上
            if (type === 'left' && v.bottom < moveRect.top) {
                topList.push(v)
            }
            // 下
            if (type === 'left' && v.top > moveRect.bottom) {
                bottomList.push(v)
            }
        })
        const key = type === 'top' ? 'left' : 'top'
        leftList.sort((a, b) => b[key] - a[key])
        topList.sort((a, b) => b[key] - a[key])
        rightList.sort((a, b) => a[key] - b[key])
        bottomList.sort((a, b) => a[key] - b[key])
        return { leftList, rightList, topList, bottomList }
    }

    /**
     *
     * @param {*} direction 左 left  右 right 上 top 下 bottom
     * @param {*} list
     * @param {*} moveRect
     */
    showSpaceByDirection(direction, list, moveRect) {
        const eqxPage = Vue.store.state.scene.eqxPage
        const showSpaces = [] // 待显示的等间距框
        let currentRect = moveRect // 当前矩形
        let standardSquare = null // 等距参考矩形
        for (let i = 0; i < list.length; i++) {
            const eleRect = list[i]
            let dis = 0
            let t = 0
            let l = 0
            let w = 0
            let h = 0
            let numCss = null
            if (direction === 'left') {
                dis = currentRect.left - eleRect.right
            } else if (direction === 'right') {
                dis = eleRect.left - currentRect.right
            } else if (direction === 'top') {
                dis = currentRect.top - eleRect.bottom
            } else if (direction === 'bottom') {
                dis = eleRect.top - currentRect.bottom
            }

            if (direction === 'left' || direction === 'right') {
                h = Math.max(currentRect.bottom, eleRect.bottom) - Math.min(currentRect.top, eleRect.top)
                t = Math.min(currentRect.top, eleRect.top) - this.workspaceRect.top
                w = dis
                l = (direction === 'left' ? eleRect.right : currentRect.right) - this.workspaceRect.left
                numCss = {
                    'border-bottom': '1px solid #ff2a6a',
                    'line-height': '14px',
                    width: '100%'
                }
            } else if (direction === 'top' || direction === 'bottom') {
                w = Math.max(currentRect.right, eleRect.right) - Math.min(currentRect.left, eleRect.left)
                l = Math.min(currentRect.left, eleRect.left) - this.workspaceRect.left
                h = dis
                t = (direction === 'top' ? eleRect.bottom : currentRect.bottom) - this.workspaceRect.top
                numCss = {
                    'border-right': '1px solid #ff2a6a',
                    'line-height': dis + 'px',
                    height: '100%',
                    'padding-right': '2px'
                }
            }

            const item = {
                id: 'space_' + i,
                top: t + 'px',
                left: l + 'px',
                width: w + 'px',
                height: h + 'px',
                num: parseInt(dis / eqxPage.scale),
                numCss
            }

            if (showSpaces.length === 0 && standardSquare === null) {
                // 离目标矩形最近的间距框作为标准框
                standardSquare = item
            } else if (Math.abs(standardSquare.num - item.num) < this.threshold) {
                // 间距相同的才加入待显示数组
                // 标准框
                standardSquare.num = item.num
                showSpaces.push(standardSquare)
                // 其他框
                const index = showSpaces.findIndex(v => v.id === item.id)
                if (index === -1) {
                    showSpaces.push(item)
                } else {
                    showSpaces.splice(index, 1, item)
                }
            }

            currentRect = eleRect
        }
        showSpaces.map(v => {
            v.num = showSpaces[0].num // 修复显示有差别问题
        })
        Vue.store.commit('GUIDE_SPACING_ADD', { list: showSpaces })
    }

    /**
     * 设置等宽等高参考矩形
     */
    setEqualWHGuideRects() {
        const eqxPage = Vue.store.state.scene.eqxPage
        const eqxElementsSelected = Vue.store.state.scene.eqxElementsSelected
        // 将每个组件作为参考(未选中且未旋转)
        eqxPage.eqxElements.forEach(eqxElement => {
            if (!eqxElementsSelected.includes(eqxElement)) {
                const rect = eqxElement.$el.getBoundingClientRect()
                const { top, left, right, bottom } = rect
                let width = parseInt(eqxElement.elementJson.css.width)
                let height = parseInt(eqxElement.elementJson.css.height)
                if ([elementType.text, elementType.date].includes(eqxElement.elementJson.type)) {
                    // 文字和日期组件的实际矩形框宽高需要加上内边距
                    width = parseInt(eqxElement.elementJson.css.width) + parseInt(eqxElement.elementJson.css.padding) + 4
                    height = parseInt(eqxElement.elementJson.css.height) + parseInt(eqxElement.elementJson.css.padding) + 10
                }

                const eRotate = eqxElement.elementJson.css.transform
                const degs = eRotate.match(/\d+/g)
                if (degs.includes('0')) {
                    this.guideRects.push({ top, left, right, bottom, width, height, eRotate })
                }
            }
        })
    }

    /**
     * 显示等高等宽线
     */
    showEqualWHGuideLine() {
        if (this.targetRect.handle) {
            if (this.targetRect.handle === 'mr' || this.targetRect.handle === 'ml') {
                this.showEquaLine('width')
            }
            if (this.targetRect.handle === 'bm' || this.targetRect.handle === 'tm') {
                this.showEquaLine('height')
            }
        }
    }

    /**
     * 显示线
     * type: eWidth :宽线   eHeight：高线
     */
    showEquaLine(type) {
        const eqxPage = Vue.store.state.scene.eqxPage
        const showLines = [] // 待显示的线段
        const targetRect = this.targetRect
        const list = this.guideRects
        for (let i = 0; i < list.length; i++) {
            const eleRect = list[i]
            const degs = targetRect.eRotate.match(/\d+/g)
            if (Math.abs(eleRect[type] - targetRect[type]) < this.threshold && degs.includes('0')) {
                const item = {
                    id: 'equal_line' + i,
                    top: eleRect.top + (type === 'width' ? eleRect.height * eqxPage.scale : 0) - this.workspaceRect.top + 'px',
                    left: eleRect.left - (type === 'width' ? 0 : 10) - this.workspaceRect.left + 'px',
                    [type]: eleRect[type] * eqxPage.scale + 'px',
                    num: parseInt(eleRect[type]),
                    rotate: eleRect.eRotate
                }
                const index = showLines.findIndex(v => v.id === item.id)
                if (index === -1) {
                    showLines.push(item)
                } else {
                    showLines.splice(index, 1, item)
                }
            }
        }
        if (showLines.length > 0) {
            const targetItem = {
                id: 'equal_line_target',
                top: targetRect.top + (type === 'width' ? targetRect.height * eqxPage.scale : 0) - this.workspaceRect.top + 'px',
                left: targetRect.left - (type === 'width' ? 0 : 10) - this.workspaceRect.left + 'px',
                [type]: targetRect[type] * eqxPage.scale + 'px',
                num: showLines[0].num,
                rotate: targetRect.eRotate
            }

            showLines.unshift(targetItem)
        }
        showLines.map(v => {
            v.num = showLines[0].num // 修复显示有差别问题
        })

        Vue.store.commit('GUIDE_EQUAL_' + type.toUpperCase(), { list: showLines })
    }

    /**
     * 设置目标矩形
     */
    setTargetRect(rect) {
        this.targetRect = rect
    }

    /**
     * 清除等宽高参考线
     */
    clearEqualWHGuideLine() {
        Vue.store.commit('GUIDE_EQUAL_WIDTH_HEIGHT_CLEAR')
    }
}
