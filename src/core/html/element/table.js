import EqxElement from '../element'
import elementType from '../../../config/enum.element.type'
import TableCell from './tableCell'
import { host } from '../../../config/env'
import tableMerge from './table.merge'

export default class EqxTable extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)
        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.table
            elementJson.css = Object.assign({
                left: css.left,
                top: css.top,
                width: css.width,
                height: css.height,
                opacity: css.opacity,
                transform: css.transform,
                display: css.display,
                borderWidth: css.borderWidth,
                borderStyle: css.borderStyle
            }, elementJson.css, { zIndex: EqxElement.newZIndex(elements) })
            elementJson.property = elementJson.property || {}
            if (!elementJson.property.headerColor) {
                // 初始化表格样式
                elementJson.property.headerColor = '#E5F1F5'
                elementJson.property.leftHeaderColor = '#f0f3f4'
                elementJson.property.borderColor = ''
                elementJson.property.contentColor = 'white'
                elementJson.property.fontFamilyName = '默认字体'
            }
        }
        // 最高限制
        elementJson.property.maxCol = 20
        elementJson.property.maxRow = 20
        elementJson.property.maxWidth = 2500
        elementJson.property.maxHeight = 1200
        this.childCells = []
        this.tableData = elementJson.property.tableData
        this.elementJson = elementJson
    }

    render() {
        super.render()
        const { css, property } = this.elementJson
        const $table = this.$table = document.createElement('div')
        this.initTableCell()
        this.updateCss(css)
        this.updateTableCss(css)
        this.updateProperty(property)
        this.$el.appendChild($table)
    }

    // 右边设置栏 批量设置选中cell的字号 颜色等
    updateCellCss(css, property) {
        this.childCells.map(cell => {
            if (cell.isSelected) {
                Object.assign(cell.css, css)
                property && Object.assign(cell.property, property)
                cell.$cell.css(cell.css)
            }
        })
    }

    updateTableCss(css) {
        // 处理table
        const tableCss = this.elementJson.tableCss
        tableCss.gridTemplateRows = this.rowHeightArr.join(' ')
        tableCss.gridTemplateColumns = this.columnWidthArr.join(' ')
        if (css.width) {
            tableCss.width = css.width
        }
        if (css.height) {
            tableCss.height = css.height
        }
        if (css.display) {
            if (css.display === 'block') {
                tableCss.display = 'grid'
            } else {
                tableCss.display = css.display
            }
        }
        this.$table.css(tableCss)
        // 处理 table下的所有cell
        this.renderAllCells()
    }

    updateCss(css, isNoNeedScale) {
        if (!isNoNeedScale && (css.width || css.height)) {
            const { maxWidth, maxHeight } = this.elementJson.property
            //  处理表格横向或者纵向拖动 同比例放缩
            const width = this.columnWidthArr.reduce((a, b) => parseFloat(a) + parseFloat(b))
            const height = this.rowHeightArr.reduce((a, b) => parseFloat(a) + parseFloat(b))
            // 拖拽高时，判断rowHeight 里面有没有小于等于40px的cell 如果有则不能缩小 只能放大
            // 拖拽宽时，判断columnWidth 里面有没有小于40px的cell 如果有则不能缩小，只能放大
            if (css.height && parseFloat(css.height) < height) {
                // 说明往下拖
                if (this.rowHeightArr.some(item => parseFloat(item) <= 40)) {
                    // 行的高度里面有最小小于40的 不允许拖
                    css.height = height + 'px'
                }
            }
            if (css.width && parseFloat(css.width) < width) {
                // 说明往下拖
                if (this.columnWidthArr.some(item => parseFloat(item) <= 40)) {
                    // 行的高度里面有最小小于40的 不允许拖
                    css.width = width + 'px'
                }
            }
            if (parseFloat(css.width) < this.elementJson.property.columns * 40) {
                // 小于这个尺码  不允许拖动
                css.width = this.elementJson.property.columns * 40 + 'px'
            } else if (parseFloat(css.width) > maxWidth && !this.elementJson.property.isMultiple) {
                css.width = maxWidth + 'px'
            }
            if (parseFloat(css.height) < this.elementJson.property.rows * 40) {
                css.height = this.elementJson.property.rows * 40 + 'px'
            } else if (parseFloat(css.height) > maxHeight && !this.elementJson.property.isMultiple) {
                css.height = maxHeight + 'px'
            }
            if (parseFloat(css.width) !== width) {
                const scale = parseInt(css.width) / parseInt(width)
                this.columnWidthArr = this.columnWidthArr.map(item => parseFloat(item) * scale + 'px')
            }
            if (parseFloat(css.height) !== height) {
                const scale = parseInt(css.height) / parseInt(height)
                this.rowHeightArr = this.rowHeightArr.map(item => parseFloat(item) * scale + 'px')
            }
        }
        this.updateTableCss(css)
        super.updateCss(css)
        super.setScale()
    }

    // 初始化表格
    initTableCell() {
        const { rows, columns } = this.elementJson.property
        const { width, height } = this.elementJson.css
        if (this.elementJson.property.columnWidthArr) {
            this.columnWidthArr = this.elementJson.property.columnWidthArr
            this.rowHeightArr = this.elementJson.property.rowHeightArr
        } else {
            this.columnWidthArr = [] // 列宽数组
            this.rowHeightArr = [] // 行高数组

            const columnWidth = parseInt(width) / this.elementJson.property.columns + 'px'
            const rowHeight = parseInt(height) / this.elementJson.property.rows + 'px'
            for (let i = 0; i < columns; i++) {
                this.columnWidthArr.push(columnWidth)
            }
            for (let i = 0; i < rows; i++) {
                this.rowHeightArr.push(rowHeight)
            }
            this.elementJson.tableCss = {
                display: 'grid',
                width: width,
                height: height,
                gridTemplateColumns: this.columnWidthArr.join(' '),
                gridTemplateRows: this.rowHeightArr.join(' '),
                fontSize: '13px',
                borderColor: '#CCD5DB'
            }
        }
        if (this.tableData && this.tableData.length !== 0) {
            for (let i = 0; i < this.tableData.length; i++) {
                this.createSingleCell(this.tableData[i])
            }
        } else {
            for (let i = 0; i < this.elementJson.property.rows; i++) {
                for (let j = 0; j < this.elementJson.property.columns; j++) {
                    const option = {
                        rowIndex: i,
                        columnIndex: j
                    }
                    this.createSingleCell(option)
                }
            }
        }
    }

    createSingleCell(option) {
        if (option && option.property && option.property.src) {
            this.createFontFace(option.property)
        }
        const cellObj = TableCell.createTableCell(option)
        this.$table.appendChild(cellObj.$cell)
        this.childCells.push(cellObj)
    }

    addNewCellByIndex(type, index) {
        // 行末尾追加 列末尾添加
        if ((type === 'row' && index === this.elementJson.property.rows) || (type === 'column' && index === this.elementJson.property.columns)) {
            if (type === 'row') {
                for (let i = 0; i < this.elementJson.property.columns; i++) {
                    const option = {
                        rowIndex: index, // 因为计数是从0 开始的 所以第六行 计数为5
                        columnIndex: i
                    }
                    const cellObj = TableCell.createTableCell(option)
                    this.childCells.push(cellObj)
                    this.$table.appendChild(cellObj.$cell)
                }
            } else {
                for (let i = 0; i < this.elementJson.property.rows; i++) {
                    const option = {
                        rowIndex: i, // 因为计数是从0 开始的 所以第六行 计数为5
                        columnIndex: index
                    }
                    const cellObj = TableCell.createTableCell(option)
                    this.childCells.push(cellObj)
                    this.$table.appendChild(cellObj.$cell)
                }
            }
        } else {
            const newChildCells = []
            this.childCells.map(cell => {
                const { rowIndex, columnIndex } = cell
                if (type === 'row') {
                    if (index === rowIndex) {
                        // 添加一整行
                        const { colSpan } = cell.property
                        for (let i = 0; i < colSpan; i++) {
                            const option = {
                                rowIndex: index,
                                columnIndex: columnIndex + i
                            }
                            const cellObj = TableCell.createTableCell(option)
                            newChildCells.push(cellObj)
                            this.$table.insertBefore(cellObj.$cell, cell.$cell)
                        }
                        // 这个需要特殊处理
                        TableCell.moveCellRow.call(cell, 1)
                    } else if (rowIndex > index) {
                        // 比它高的都抬高一行
                        TableCell.moveCellRow.call(cell, 1)
                    }
                    newChildCells.push(cell)
                } else if (type === 'column') {
                    const { rowSpan } = cell.property
                    if (index === columnIndex) {
                        for (let i = 0; i < rowSpan; i++) {
                            const option = {
                                rowIndex: rowIndex + i,
                                columnIndex: index
                            }
                            const cellObj = TableCell.createTableCell(option)
                            newChildCells.push(cellObj)
                            this.$table.insertBefore(cellObj.$cell, cell.$cell)
                        }
                        TableCell.moveCellCol.call(cell, 1)
                    } else if (columnIndex > index) {
                        // 比它大的都向右移一列
                        TableCell.moveCellCol.call(cell, 1)
                    }
                    newChildCells.push(cell)
                }
            })
            // 更新childCells
            this.childCells = newChildCells
        }
        // 特殊处理 合并cell的展示方式
        this.childCells.map(cell => {
            const { rowSpan, colSpan } = cell.property
            const { rowIndex, columnIndex } = cell
            const { gridRowStart, gridRowEnd, gridColumnStart, gridColumnEnd } = cell.css
            if (rowSpan > 1 || colSpan > 1) {
                if (type === 'row') {
                    if (gridRowStart - 1 >= index) {
                        // 如果新增的行在合并cell的上面  则把这个合并cell 抬高一层即可
                        // cell.css.gridRowStart = gridRowStart + 1
                        // cell.css.gridRowEnd = gridRowEnd + 1
                    } else {
                        // 如果新增的行在合并cell的下面  判断这个合并cell的rowSpan 有没有在其中，如果在其中就把这个合并cell rowSpan延长
                        if (rowIndex + rowSpan - 1 >= index) {
                            cell.css.gridRowEnd = gridRowEnd + 1
                            cell.property.rowSpan = rowSpan + 1
                        }
                    }
                } else {
                    if (gridColumnStart - 1 >= index) {
                        // 如果新增的列在合并cell的左边 则把合并cell 往右挪一格就行
                        // cell.css.gridColumnStart = gridColumnStart + 1
                        // cell.css.gridColumnEnd = gridColumnEnd + 1
                    } else {
                        if (columnIndex + colSpan - 1 >= index) {
                            cell.css.gridColumnEnd = gridColumnEnd + 1
                            cell.property.colSpan = colSpan + 1
                        }
                    }
                }
                // 更新cell
                cell.$cell.css(cell.css)
            }
        })
    }

    // 添加行或者列 会导致头部样式的改变
    updateAllCellsHeader() {
        const { headerColor, leftHeaderColor, contentColor } = this.elementJson.property
        this.childCells.map(cell => {
            const { rowIndex, columnIndex, css } = cell
            if (rowIndex === 0) {
                css.background = headerColor
            } else if (columnIndex === 0) {
                css.background = leftHeaderColor
            } else {
                css.background = contentColor
            }
            cell.$cell.css(css)
        })
    }

    setTableWrapper(tableWrapper) {
        this.tableWrapper = tableWrapper
    }

    cancelAllSelectedCells() {
        this.childCells.map(cell => {
            cell.isSelected = false
            const color = this.elementJson.tableCss.borderColor
            const css = {
                border: '',
                borderRight: `1px solid ${color}`,
                borderBottom: `1px solid ${color}`
            }
            if (cell.rowIndex === 0) {
                css.borderTop = `1px solid ${color}`
            }
            if (cell.columnIndex === 0) {
                css.borderLeft = `1px solid ${color}`
            }
            cell.$cell.css(css)
        })
    }

    // 更新指定列的宽度 既要更新指定列的宽度也要更新整体的宽度
    updateColumnWidthByIndex(index, newColumnWidth, newTableWidth, addFlag) {
        const flag = addFlag ? 0 : 1
        this.columnWidthArr.splice(index, flag, newColumnWidth)
        const css = { width: newTableWidth }
        this.updateCss(css, true)
    }

    // 更新指定行的宽度
    updateRowHeightByIndex(index, newRowHeight, newTableHeight, addFlag) {
        const flag = addFlag ? 0 : 1
        this.rowHeightArr.splice(index, flag, newRowHeight)
        const css = { height: newTableHeight }
        this.updateCss(css, true)
    }

    // 根据位置添加新的行 默认为最右
    addNewRows(index) {
        const { maxRow, rows } = this.elementJson.property
        if (rows + 1 > maxRow) {
            Vue.notifier.warn(`表格最多限制${maxRow}行`)
            return
        }
        // 新增的列都是标准行 高度40px
        const newTableHeight = parseInt(this.elementJson.css.height) + 40 + 'px'
        this.updateRowHeightByIndex(index, '40px', newTableHeight, true)
        this.addNewCellByIndex('row', index)
        this.elementJson.property.rows++
    }

    // 根据位置添加新的列 默认为最下
    addNewColumns(index) {
        const { maxCol, columns } = this.elementJson.property
        if (columns + 1 > maxCol) {
            Vue.notifier.warn(`表格最多限制${maxCol}列`)
            return
        }
        // 新增的列都是标准列 宽度108px
        const newTableWidth = parseInt(this.elementJson.css.width) + 108 + 'px'
        this.updateColumnWidthByIndex(index, '108px', newTableWidth, true)
        this.addNewCellByIndex('column', index)
        this.elementJson.property.columns++
    }

    // 根据索引删除行
    deleteRowByIndex(index) {
        if (index > this.elementJson.property.rows || this.index < 0) {
            return
        }
        const willDeleteRowHeight = this.rowHeightArr[index]
        this.rowHeightArr.splice(index, 1)
        const newChildCells = []
        this.childCells.map(cell => {
            const { rowSpan, colSpan } = cell.property
            const { rowIndex } = cell
            // 特殊判断合并的cell
            const { gridRowEnd } = cell.css
            if (rowSpan > 1 || colSpan > 1) {
                if (rowIndex === index) {
                    // 判断这个合并cell 是不是多列一行 如果是直接删除  否则这个合并cell 删除第一行
                    if (rowSpan === 1) {
                        // 直接删除
                        this.$table.removeChild(cell.$cell)
                    } else {
                        cell.property.rowSpan = colSpan - 1
                        cell.css.gridRowEnd = gridRowEnd - 1
                        newChildCells.push(cell)
                    }
                } else if (rowIndex < index && rowIndex + rowSpan - 1 >= index) {
                    // 如果删除的行在合并cell的下面  判断这个合并cell的rowSpan 有没有在其中，如果在其中就把这个合并cell rowSpan延长
                    cell.property.rowSpan = colSpan - 1
                    cell.css.gridRowEnd = gridRowEnd - 1
                }
                // 更新cell
                cell.$cell.css(cell.css)
            }
            if (rowIndex !== index) {
                if (rowIndex > index) {
                    // 高位的往下调
                    TableCell.moveCellRow.call(cell, -1)
                }
                newChildCells.push(cell)
            } else {
                // 删除节点
                if (!(rowSpan > 1 || colSpan > 1)) {
                    this.$table.removeChild(cell.$cell)
                }
            }
        })
        // 更新childcell
        this.childCells = newChildCells
        this.updateCss({
            height: parseInt(this.elementJson.css.height) - parseInt(willDeleteRowHeight) + 'px'
        }, true)
        this.elementJson.property.rows--
    }

    // 根据索引删除列
    deleteColumnByIndex(index) {
        if (index > this.elementJson.property.columns || this.index < 0) {
            return
        }
        const willDeleteColumnWidth = this.columnWidthArr[index]
        this.columnWidthArr.splice(index, 1)
        this.elementJson.property.columns--
        const newChildCells = []
        this.childCells.map(cell => {
            const { rowSpan, colSpan } = cell.property
            const { columnIndex } = cell
            // 统一处理特殊判断合并的cell
            const { gridColumnEnd } = cell.css
            if (rowSpan > 1 || colSpan > 1) {
                if (columnIndex === index) {
                    // 判断这个合并cell 是不是多行一列 如果是直接删除  否则这个合并cell 删除第一列
                    if (colSpan === 1) {
                        // 直接删除
                        this.$table.removeChild(cell.$cell)
                    } else {
                        cell.property.colSpan = colSpan - 1
                        cell.css.gridColumnEnd = gridColumnEnd - 1
                        newChildCells.push(cell)
                    }
                } else if (columnIndex < index && columnIndex + colSpan - 1 >= index) {
                    cell.property.colSpan = colSpan - 1
                    cell.css.gridColumnEnd = gridColumnEnd - 1
                }
                // 更新cell
                cell.$cell.css(cell.css)
            }
            // 处理剩下的cell
            if (columnIndex !== index) {
                if (columnIndex > index) {
                    // 高位的往下调
                    TableCell.moveCellCol.call(cell, -1)
                }
                newChildCells.push(cell)
            } else {
                // 删除节点
                if (!(rowSpan > 1 || colSpan > 1)) {
                    this.$table.removeChild(cell.$cell)
                }
            }
        })
        // 更新childcell
        this.childCells = newChildCells
        this.updateCss({
            width: parseInt(this.elementJson.css.width) - parseInt(willDeleteColumnWidth) + 'px'
        }, true)
    }

    renderAllCells(cellCss) {
        const css = {
            borderColor: this.elementJson.tableCss.borderColor
        }
        this.childCells.map(cell => {
            // 判断cellCss的渲染
            if (cellCss) {
                const { headerColor, leftHeaderColor, borderColor, backgroundColor } = cellCss
                Object.assign(this.elementJson.property, cellCss)
                let bgColor = backgroundColor
                if (cell.rowIndex === 0) {
                    bgColor = headerColor
                } else if (cell.columnIndex === 0) {
                    bgColor = leftHeaderColor
                }
                cell.css.background = bgColor
                cell.css.borderColor = borderColor
                cell.$cell.css({
                    background: bgColor,
                    borderColor: borderColor
                })
            }
            cell.css.borderColor = css.borderColor
            if (cell.isSelected) {
                cell.css.borderColor = '#1593FF'
                cell.$cell.css(css)
            } else {
                cell.$cell.css(css)
            }
        })
    }

    saveTableData() {
        const tableData = []
        this.childCells.map(cell => {
            const css = JSON.parse(JSON.stringify(cell.css))
            delete css.border
            tableData.push({
                value: cell.value ? cell.value : '',
                css: css,
                property: cell.property,
                rowIndex: cell.rowIndex,
                columnIndex: cell.columnIndex
            })
        })
        this.elementJson.property.rowHeightArr = this.rowHeightArr
        this.elementJson.property.columnWidthArr = this.columnWidthArr
        this.elementJson.property.tableData = tableData
    }

    // 设置表格里面的字体
    createFontFace(item) {
        if (!document.querySelector('#' + item.fontFamily)) {
            const $style = document.createElement('style')
            $style.id = item.fontFamily
            $style.innerHTML = `@font-face{font-family: "${item.fontFamily}";src: url(${host.file + item.src}) format("woff")}\r\n`
            document.head.appendChild($style)
        }
    }

    updateCellFontFace(item) {
        this.createFontFace(item)
        this.childCells.map(cell => {
            if (cell.isSelected) {
                cell.property.fontFamilyName = item.name
                cell.property.fontFamily = item.fontFamily
                cell.property.src = item.src
                cell.css.fontFamily = item.fontFamily
            }
        })
        this.updateCellCss({})
    }

    // 便捷方法得到选中的全部cell
    getAllSelectedCell() {
        const mutiChooseCells = []
        for (let i = 0; i < this.childCells.length; i++) {
            if (this.childCells[i].isSelected) {
                mutiChooseCells.push(this.childCells[i])
            }
        }
        return mutiChooseCells
    }

    // 合并单元格 只有矩形的才能合并 L形状的就不行
    mergeCells() {
        return tableMerge.mergeCells.call(this)
    }

    // 取消合并的单元格
    dismissMerge() {
        return tableMerge.dismissMerge.call(this)
    }

    // 校验多选的单元格是否能合并
    checkTableCanMerge() {
        return tableMerge.checkTableCanMerge.call(this)
    }

    // 校验可否打开合并菜单
    checkTableCanShowMergeMenu() {
        return tableMerge.checkTableCanShowMergeMenu.call(this)
    }

    // 查询表格所选cell的范围
    getMinMaxFromSelectedCells() {
        return tableMerge.getMinMaxFromSelectedCells.call(this)
    }
}
