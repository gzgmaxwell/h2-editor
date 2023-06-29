export default function () {
    // 双击进入编辑状态，并选中所有文字
    this.$el.addEventListener('dblclick', () => {
        // 获取元素属性
        const property = this.elementJson.property
        if (property.lock) {
            // 锁定状态下 禁止编辑
            return
        }
        // 当前选中的元素
        const eqxElementsSelected = Vue.store.state.scene.eqxElementsSelected
        // 当前选中的元素大于1个时 禁止编辑
        if (eqxElementsSelected.length > 1) {
            return
        }
        // 正在编辑状态下返回
        if (this.isEditing) {
            return
        }
        // 清除所有组件的选中状态
        Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
        this.eqxPage.clearElementsSelected()
        // 设置编辑状态为true
        this.isEditing = true
        // 3Dcanvas所在的div
        const $text = this.$text
        // 隐藏3Dcanvas所在的div
        $text.style.display = 'none'
        // 隐藏box框
        this.elementBox.$el.style.display = 'none'
        // 新建文本编辑的div
        const $inputTextDiv = this.$inputTextDiv = document.createElement('div')
        // div框样式
        let textShadow = ''
        if (property.textHeight > 0) {
            textShadow = getTextShadow({ color: property.textShadowColor, distance: 0, size: 4 })
        }
        $inputTextDiv.css({
            width: 'auto',
            height: 'auto',
            fontSize: `${property.textFontSize}px`,
            color: property.textColor,
            lineHeight: 1.2,
            letterSpacing: `${property.letterSpacing}px`,
            boxSizing: 'content-box',
            cursor: 'text',
            whiteSpace: 'nowrap',
            textAlign: property.textAlign,
            border: '1px solid #1593ff',
            padding: '10px',
            textShadow: textShadow
        })
        // 设置div框的编辑属性为true
        $inputTextDiv.attr({ contenteditable: true })
        // div框样式框赋值
        $inputTextDiv.innerText = property.textContent
        // 插入div框样式框
        this.$el.appendChild($inputTextDiv)
        // 选中div框所有文本
        selectAllContent($inputTextDiv)
        // 输入事件计算高度
        // $inputTextDiv.oninput = () => {
        // }
    })
}

/**
 * 选中所有文字
 * @param {*}
 */
function selectAllContent($text) {
    setTimeout(function () {
        if (getSelection && document.createRange) {
            const range = document.createRange()
            range.selectNodeContents($text)
            range.collapse(true)
            range.setEnd($text, $text.childNodes.length)
            range.setStart($text, 0)
            const sel = getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
        } else if (document.body.createTextRange) {
            const range = document.body.createTextRange()
            range.moveToElementText($text)
            range.collapse(true)
            range.select()
        }
        $text.focus()
    }, 1)
}

function getTextShadow(stroke) {
    const color = stroke.color
    let size = stroke.size
    const distance = stroke.distance
    const discolor = '#FFFFFF'
    let textStroke = []
    if (distance > 0) {
        size = size * 2 + distance
    }
    const distanceArr = strokeOffset(distance, 0, 0) || []
    const sizeArr = strokeOffset(size, 0, 0) || []
    distanceArr.forEach(offset => {
        textStroke += `${discolor} ${offset[0]}px ${offset[1]}px 0,`
    })
    sizeArr.forEach(offset => {
        textStroke += `${color} ${offset[0]}px ${offset[1]}px 0,`
    })
    textStroke = textStroke.substring(0, textStroke.length - 1)
    return textStroke
}

function strokeOffset(size, x, y) {
    if (size < 1) return
    const offsetArray = []
    let xOffSet
    let yOffSet
    while (size > 0) {
        // 上
        xOffSet = size + x
        yOffSet = -size + y
        while (xOffSet > -size) {
            offsetArray.push([xOffSet, yOffSet])
            xOffSet--
        }
        // 右
        xOffSet = size + x
        yOffSet = size + y
        while (yOffSet > -size) {
            offsetArray.push([xOffSet, yOffSet])
            yOffSet--
        }
        // 下
        xOffSet = size + x
        yOffSet = size + y
        while (xOffSet > -size) {
            offsetArray.push([xOffSet, yOffSet])
            xOffSet--
        }
        // 左
        xOffSet = -size + x
        yOffSet = size + y
        while (yOffSet > -size) {
            offsetArray.push([xOffSet, yOffSet])
            yOffSet--
        }
        size -= 2
    }
    return offsetArray
}
