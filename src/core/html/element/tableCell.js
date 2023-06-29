// 创建一个tablecell
function createTableCell(option) {
    const cell = {}
    const $cell = document.createElement('div')
    const css = {
        borderTop: option.rowIndex === 0 ? '1px solid #CCD5DB' : '',
        borderLeft: option.columnIndex === 0 ? '1px solid #CCD5DB' : '',
        borderRight: '1px solid #CCD5DB',
        borderBottom: '1px solid #CCD5DB',
        borderColor: '#CCD5DB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        color: '#666666',
        lineHeight: '18px',
        overflow: 'hidden',
        textAlign: 'center',
        fontWeight: 'normal',
        fontStyle: '',
        userSelect: 'none',
        fontFamily: '',
        background: 'white'
        // background: option.rowIndex === 0 ? '#E5F1F5' : option.columnIndex === 0 ? '#f0f3f4' : 'white'
    }
    if (option.value) {
        $cell.innerHTML = option.value
        cell.value = option.value
    }
    if (option.property) {
        cell.property = option.property
        if (!option.property.rowSpan) {
            cell.property.rowSpan = 1
        }
        if (!option.property.colSpan) {
            cell.property.colSpan = 1
        }
    } else {
        cell.property = {}
        // 默认占据一行一列
        cell.property.rowSpan = 1
        cell.property.colSpan = 1
    }
    //  设置表格的跨行跨列
    css.gridRowStart = option.rowIndex + 1
    css.gridRowEnd = option.rowIndex + 1 + cell.property.rowSpan
    css.gridColumnStart = option.columnIndex + 1
    css.gridColumnEnd = option.columnIndex + 1 + cell.property.colSpan
    cell.property.fontFamilyName = '默认字体'

    if (option.css) {
        $cell.css(option.css)
        cell.css = option.css
    } else {
        $cell.css(css)
        cell.css = css
    }

    cell.$cell = $cell
    cell.rowIndex = option.rowIndex
    cell.columnIndex = option.columnIndex

    cell.isSelected = false
    // 绑定tablecell的 双击
    // bindClick(cell)
    bindDbClick(cell)
    bindCellEvent(cell)

    return cell
}
// 移动cell的行
function moveCellRow(num) {
    this.rowIndex += num
    this.css.gridRowStart = this.rowIndex + 1
    this.css.gridRowEnd = this.rowIndex + 1 + this.property.rowSpan
    this.$cell.css(this.css)
}
// 移动cell的列
function moveCellCol(num) {
    this.columnIndex += num
    this.css.gridColumnStart = this.columnIndex + 1
    this.css.gridColumnEnd = this.columnIndex + 1 + this.property.colSpan
    this.$cell.css(this.css)
}
// 绑定tablecell的 双击
function bindDbClick(cell) {
    cell.$cell.addEventListener('dblclick', () => {
        //  设置为可编辑
        const height = window.getComputedStyle(cell.$cell).height
        cell.$cell.attr({ contenteditable: true })
        if (!cell.value) {
            cell.$cell.css({ lineHeight: height })
        }
        selectAllContent(cell.$cell)
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
    }, 0)
}
// 绑定leaveOut
function bindCellEvent(cell) {
    cell.$cell.addEventListener('mouseout', (e) => {
        //  设置为可编辑
        if (!cell.isSelected) {
            cell.$cell.removeAttr('contenteditable')
            cell.$cell.css({ lineHeight: '18px' })
        }
        cell.value = e.currentTarget.innerText
    })
}

export default {
    createTableCell, moveCellRow, moveCellCol
}
