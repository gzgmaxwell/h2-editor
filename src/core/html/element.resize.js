import elementType from '../../config/enum.element.type'
import qrCodeType from '../../config/enum.qrcode.type'

const Cursor = {
    RESIZE_W: 'ml', // 'w-resize',
    RESIZE_E: 'mr', // 'e-resize',
    RESIZE_N: 'tm', // 'n-resize',
    RESIZE_S: 'bm', // 's-resize',
    RESIZE_SE: 'br', // 'se-resize',
    RESIZE_SW: 'bl', // 'sw-resize',
    RESIZE_NE: 'tr', // 'ne-resize',
    RESIZE_NW: 'tl'// 'nw-resize'
}

export default function (elementBox, value) {
    const self = this
    if ((value | 2) === value) { // 可调宽度
        resize(elementBox.$refs.barE, Cursor.RESIZE_E, self)
        resize(elementBox.$refs.barW, Cursor.RESIZE_W, self)
    }
    if ((value | 4) === value) { // 可调高度
        resize(elementBox.$refs.barN, Cursor.RESIZE_N, self)
        resize(elementBox.$refs.barS, Cursor.RESIZE_S, self)
    }
    if ((value | 8) === value) { // 可调四个角
        resize(elementBox.$refs.barNE, Cursor.RESIZE_NE, self)
        resize(elementBox.$refs.barSE, Cursor.RESIZE_SE, self)
        resize(elementBox.$refs.barSW, Cursor.RESIZE_SW, self)
        resize(elementBox.$refs.barNW, Cursor.RESIZE_NW, self)
    }
}

function resize($bar, handle, self) {
    $bar.addEventListener('mousedown', e => {
        const oldWidth = parseFloat(self.elementJson.css.width)
        const oldHeight = parseFloat(self.elementJson.css.height)
        let lastMouseX = 0
        let lastMouseY = 0
        let lastElmX = 0
        let lastElmY = 0
        let lastElmW = 0
        let lastElmH = 0
        let fixedXName = ''
        let fixedYName = ''
        let fixedX = 0
        let fixedY = 0
        const cssText = {}
        let textComCss = {}
        // 阻止workspace上的点击
        e.stopPropagation()
        // 阻止mousemove默认会选中其它元素的情况
        e.preventDefault()

        const guideLine = Vue.store.state.guideLine.instance
        if ([Cursor.RESIZE_E, Cursor.RESIZE_W, Cursor.RESIZE_N, Cursor.RESIZE_S].includes(handle)) {
            guideLine.startEqualWidthHeight()
        }

        // 关闭颜色选择框
        // 因为阻止冒泡了，如果颜色选择框是打开的，点击组件虽然组件设置项变了，但颜色选择框还在
        Vue.colorPicker.close()
        const componentCss = self.elementJson.css
        const rotate = componentCss.transform.replace(/\D/g, '')
        const css = {
            top: parseFloat(componentCss.top),
            left: parseFloat(componentCss.left),
            width: parseFloat(componentCss.width),
            height: parseFloat(componentCss.height)
        }
        // 如果是文字组件或日期组件且操作4个角时，需要获取单行最大字数，更新fontSize使用
        if ([elementType.text, elementType.date].includes(self.elementJson.type) && handle.indexOf('m') === -1) {
            const textCss = self.elementJson.css
            const fontSize = parseFloat(textCss.fontSize)
            const oneLineCount = parseInt(css.width / fontSize)
            const oneLineCountHeight = parseInt(css.height / fontSize)
            textComCss = { oneLineCount, fontSize, oneLineCountHeight }
        }
        let elmW = css.width
        let elmH = css.height
        let elmX = css.left
        let elmY = css.top
        const { x: mouseX, y: mouseY } = getMouseCoordinate(e)
        lastMouseX = mouseX
        lastMouseY = mouseY
        const scale = self.eqxPage.scale
        const ratio = css.width / css.height

        handleResizeDown(handle, e)
        document.addEventListener('mousemove', handleMove)
        document.addEventListener('mouseup', handleUp)
        function handleResizeDown(handle) {
            // 固定点
            const fixed = {
                x: handle[1] === 'l' ? 'right' : 'left',
                y: handle[0] === 't' ? 'bottom' : 'top'
            }
            const rect = {
                top: css.top,
                right: css.left + css.width,
                bottom: css.top + css.height,
                left: css.left
            }
            // 固定点旋转后的位置
            const fixedCoordinate = rotatedPoint(rect, rotate, fixed)
            fixedXName = fixed.x
            fixedYName = fixed.y
            fixedX = fixedCoordinate.x
            fixedY = fixedCoordinate.y
            lastElmX = elmX
            lastElmY = elmY
            lastElmW = elmW
            lastElmH = elmH
        }
        function getMouseCoordinate(e) {
            return {
                x: e.pageX,
                y: e.pageY
            }
        }
        // 拖拽的过程中让固定点保持不动
        function fixedTo() {
            const rect = {
                top: elmY,
                right: elmX + elmW,
                bottom: elmY + elmH,
                left: elmX
            }
            const fixed = {
                x: fixedXName,
                y: fixedYName
            }
            const { x, y } = rotatedPoint(rect, rotate, fixed)
            const dX = Math.round(fixedX - x)
            const dY = Math.round(fixedY - y)
            elmX += dX
            elmY += dY
        }
        // 旋转一定角度后固定点的位置
        function rotatedPoint(rect, rotate, point) {
            const { top, right, bottom, left } = rect
            const rad = Math.PI / 180 * rotate
            const cos = Math.cos(rad)
            const sin = Math.sin(rad)
            const originX = (right - left + 1) / 2 + left
            const originY = (bottom - top + 1) / 2 + top
            let x = rect[point.x]
            let y = rect[point.y]
            x -= originX
            y -= originY
            return {
                x: x * cos - y * sin + originX,
                y: x * sin + y * cos + originY
            }
        }
        function getAngle(x, y) {
            let theta = Math.atan2(y, x) // range (-PI, PI]
            theta = Math.round(180 / Math.PI * theta) // rads to degs, range (-180, 180]
            if (theta < 0) theta = 360 + theta // range [0, 360)
            return theta
        }
        function handleMove(e) {
            const { x: mouseX, y: mouseY } = getMouseCoordinate(e)
            const width = mouseX - lastMouseX
            const height = mouseY - lastMouseY
            // 拖拽时鼠标移动的距离
            const c = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
            // 拖拽时，X方向和y方向的角度
            const angle = getAngle(width, height)
            const rad = Math.PI / 180 * (angle - rotate)
            const h = Math.abs(Math.cos(rad)) / Math.cos(rad)
            let diffX = Math.round(Math.cos(rad) * c) / scale
            let diffY = 0
            const X = Math.abs(diffX)
            if (handle.indexOf('m') > -1) {
                // 当拖拽中间四边的时
                diffY = Math.round(Math.sin(rad) * c) / scale
            } else {
                // 当拖拽四个角的时候，需要保持原宽高比例不变
                diffX = X * (h)
                if (['tl', 'br'].includes(handle)) {
                    diffY = X / ratio * (h)
                } else {
                    diffY = X / ratio * (-h)
                }
            }
            elmX = lastElmX
            elmY = lastElmY
            elmW = lastElmW
            elmH = lastElmH
            const [handleY, handleX] = handle
            if (handleX !== 'm') {
                elmW += diffX * (handleX === 'r' ? 1 : -1)
            }
            if (handleY !== 'm') {
                elmH += diffY * (handleY === 'b' ? 1 : -1)
            }
            if (elmW < 0) {
                elmW = 0
            }
            if (elmH < 0) {
                elmH = 0
            }
            // 当是文字组件或日期组件时且操作调宽度小于当前字号需要将宽度设为当前字号
            // 目的在于操作字体四角缩放时避免参考点和位置出现问题
            if ([elementType.text, elementType.date].includes(self.elementJson.type) &&
                (handle === Cursor.RESIZE_E || handle === Cursor.RESIZE_W || handle === Cursor.RESIZE_S || handle === Cursor.RESIZE_N)) {
                const textCss = self.elementJson.css
                const fontSize = parseFloat(textCss.fontSize)
                if (elmW < fontSize) {
                    elmW = fontSize
                }
                if (elmH < fontSize) {
                    elmH = fontSize
                }
            }
            fixedTo()
            cssText.left = Math.round(elmX)
            cssText.top = Math.round(elmY)
            cssText.width = Math.round(elmW)
            cssText.height = Math.round(elmH)
            if (self.elementJson.type === elementType.combine && (cssText.width <= 5 || cssText.height <= 5)) {
                return
            }

            const widthScale = cssText.width / oldWidth
            const heightScale = cssText.height / oldHeight
            // 添加校验  表格组件 最低宽高都是40
            if (moveBeforeCheck(cssText)) {
                self.updateCss({
                    left: cssText.left + 'px',
                    top: cssText.top + 'px',
                    width: (cssText.width === 0 ? 1 : cssText.width) + 'px', // 放缩至最小为1px
                    height: (cssText.height === 0 ? 1 : cssText.height) + 'px'
                })
            }

            // 公众号二维码缩放时不需要重新请求
            if (self.elementJson.type === elementType.qrcode && self.elementJson.property.qcType !== qrCodeType.wechat && !self.elementJson.property.isArt) {
                self.updateProperty(self.elementJson.property)
            } else if ([elementType.text, elementType.date].includes(self.elementJson.type) &&
                handle.indexOf('m') === -1) { // 文本组件或日期组件操作四个角时需更新字体大小
                if (textComCss.oneLineCount > 0) {
                    let minWidth = cssText.width
                    let minHeight = cssText.height
                    let wsize = parseInt(cssText.width / textComCss.oneLineCount)
                    let hsize = parseInt(cssText.height / textComCss.oneLineCountHeight)
                    const minFontSize = 12
                    // 缩到最小时也不允许换行并将最小字号设为12

                    if (self.elementJson.css.writingMode && self.elementJson.css.writingMode === 'vertical-rl') {
                        if (cssText.height < minFontSize * textComCss.oneLineCountHeight) {
                            minHeight = minFontSize * textComCss.oneLineCountHeight
                            hsize = minFontSize
                        }
                        self.updateCss({
                            fontSize: hsize + 'px',
                            height: minHeight + 'px'
                        })
                    } else {
                        if (cssText.width < minFontSize * textComCss.oneLineCount) {
                            minWidth = minFontSize * textComCss.oneLineCount
                            wsize = minFontSize
                        }
                        self.updateCss({
                            fontSize: wsize + 'px',
                            width: minWidth + 'px'
                        })
                    }
                }
            } else if ([elementType.textThreeD].includes(self.elementJson.type)) {
                // 获取缩放的比例
                const elementScale = Math.max(widthScale, heightScale)
                self.updateReSize(elementScale)
            } else if ([elementType.combine].includes(self.elementJson.type)) {
                // 获取缩放的比例
                const elementScale = Math.max(widthScale, heightScale)
                self.childElements.forEach(element => {
                    if ([elementType.textThreeD].includes(element.elementJson.type)) {
                        element.updateReSize(elementScale)
                    }
                })
            }

            // 显示等宽/高参考线
            if ([Cursor.RESIZE_E, Cursor.RESIZE_W, Cursor.RESIZE_N, Cursor.RESIZE_S].includes(handle)) {
                const rect = self.$el.getBoundingClientRect()
                let width = cssText.width
                let height = cssText.height
                if ([elementType.text, elementType.date].includes(self.elementJson.type)) {
                    // 文字和日期组件的实际矩形框宽高需要加上内边距
                    width = parseInt(self.elementJson.css.width) + parseInt(self.elementJson.css.padding) + 4
                    height = parseInt(self.elementJson.css.height) + parseInt(self.elementJson.css.padding) + 10
                }

                const tg = {
                    handle,
                    width,
                    height,
                    top: rect.top,
                    left: rect.left,
                    bottom: rect.bottom,
                    right: rect.right,
                    eRotate: self.elementJson.css.transform
                }
                guideLine.setTargetRect(tg)
                guideLine.clearEqualWHGuideLine()
                guideLine.showEqualWHGuideLine()
            }
        }
        function moveBeforeCheck(cssText) {
            let pass = true
            if (self.elementJson.type === elementType.table) {
                // table 表格组件宽高最低为40  小于就不能调整了
                if (cssText.width < self.columns * 40 || cssText.height < self.rows * 40) {
                    pass = false
                }
            }
            return pass
        }
        function handleUp(e) {
            if ([Cursor.RESIZE_E, Cursor.RESIZE_W, Cursor.RESIZE_N, Cursor.RESIZE_S].includes(handle)) {
                guideLine.clearEqualWHGuideLine()
            }

            // 更新3D文字的尺寸
            const updateTextThreeDSize = (pElement) => {
                // 真实渲染3D文字
                const canvas = pElement.$el.querySelector('canvas')
                const canvasShowWidth = canvas.getBoundingClientRect().width / pElement.eqxPage.scale
                canvas.css({
                    transform: 'scale(1)'
                })
                // 将文字画布变大
                pElement.$renderer.setSize(canvasShowWidth, canvasShowWidth)
                pElement.updateProperty({
                    // 画布样式
                    canvasStyle: {
                        // 宽度
                        width: canvasShowWidth,
                        // 高度
                        height: canvasShowWidth,
                        // 左边距
                        marginLeft: canvas.style.marginLeft,
                        // 右边距
                        marginTop: canvas.style.marginTop
                    }
                })
            }

            const { x: mouseX, y: mouseY } = getMouseCoordinate(e)
            lastMouseX = mouseX
            lastMouseY = mouseY
            elmX = cssText.left
            elmY = cssText.top
            if (self.elementJson.type === elementType.combine) {
                // 更新初始位置
                self.initCss = self.elementJson.css
                // 更新3D文字的大小
                self.childElements.forEach(element => {
                    if ([elementType.textThreeD].includes(element.elementJson.type)) {
                        updateTextThreeDSize(element)
                    }
                })
            } else if (self.elementJson.type === elementType.textThreeD) {
                updateTextThreeDSize(self)
            }
            mouseup()
        }
        function mouseup() {
            document.removeEventListener('mousemove', handleMove)
            document.removeEventListener('mouseup', handleUp)
            self.eqxPage.eqxHistory.add(self.eqxPage)
        }
    })
}
