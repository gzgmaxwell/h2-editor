import TableCell from './tableCell'
// 判断用户能不能打开合并菜单
function checkTableCanShowMergeMenu() {
    /**
     * 可以merge情况分析：
     *  必须是矩形才可以merge，L型或者单个的cell不可以
     *  矩形里面可以包括已经合并过的单元格
     * 算法： 计算所选cell的全部宽高面积和所占行列的面积  是否相等
     * */
    const mutiCells = this.getAllSelectedCell()
    //  起码要俩个以上才能合并
    if (mutiCells.length === 1) {
        const { rowSpan, colSpan } = mutiCells[0].property
        if (rowSpan > 1 || colSpan > 1) {
            return true
        }
        return false
    } else if (mutiCells.length > 1) {
        // 先计算所占行列的面积
        const { minRow, maxRow, minCol, maxCol } = this.getMinMaxFromSelectedCells()
        let totalArea = 0
        mutiCells.map(cell => {
            const width = window.getComputedStyle(cell.$cell).width
            const height = window.getComputedStyle(cell.$cell).height
            totalArea += parseFloat(width) * parseFloat(height)
        })
        let totalWidth = 0
        let totalHeight = 0
        for (let i = minRow; i <= maxRow; i++) {
            totalHeight += parseFloat(this.rowHeightArr[i])
        }
        for (let i = minCol; i <= maxCol; i++) {
            totalWidth += parseFloat(this.columnWidthArr[i])
        }
        const totalCellArea = totalWidth * totalHeight
        if (Math.abs(totalCellArea - totalArea) <= 10) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}
function checkTableCanMerge() {
    /**
     * 可以merge情况分析：
     *  必须是矩形才可以merge，L型或者单个的cell不可以
     *  合并的必须是单元格，已经合并的不能再次合并，处理方式同excel一样
     * */
    const mutiCells = this.getAllSelectedCell()
    return checkSelectedIsSingleCell(mutiCells)
}
//  校验选中的cell 是不是single的
function checkSelectedIsSingleCell(mutiCells) {
    return mutiCells.every(cell => {
        return cell.property.colSpan === 1 && cell.property.rowSpan === 1
    })
}
// 解散合并
function dismissMerge() {
    const excuteCellConfig = []
    const newChildCells = []
    const { columns } = this.elementJson.property
    this.childCells.map(cell => {
        const { rowSpan, colSpan } = cell.property
        const { rowIndex, columnIndex } = cell
        // 找到 已经合并了的cell
        if (cell.isSelected && (rowSpan > 1 || colSpan > 1)) {
            // 更新该合并的cell 为单表格
            cell.property.rowSpan = 1
            cell.property.colSpan = 1
            const css = {
                gridRowEnd: cell.css.gridRowStart + 1,
                gridColumnEnd: cell.css.gridColumnStart + 1
            }
            Object.assign(cell.css, css)
            cell.$cell.css(css)
            // 把拆散cell的其余cell 加入excuteCellConfig
            for (let i = 0; i < rowSpan; i++) {
                // 存放除了一个cell之外的其余cell的位置
                const cellPosition = []
                for (let j = 0; j < colSpan; j++) {
                    cellPosition.push({
                        rowIndex: rowIndex + i,
                        columnIndex: columnIndex + j
                    })
                }
                if (i === 0) {
                    // 删除第一个
                    cellPosition.splice(0, 1)
                }
                if (cellPosition.length > 0) {
                    excuteCellConfig.push({
                        afterRowIndex: rowIndex + i,
                        aftereColIndex: columnIndex,
                        cellPosition: cellPosition,
                        state: 1 // 1 待执行  0 已经执行了
                    })
                }
            }
        }

        // 添加新的cell
        excuteCellConfig.map(item => {
            const { afterRowIndex, aftereColIndex, cellPosition, state } = item
            if (state && rowIndex * columns + columnIndex > afterRowIndex * columns + aftereColIndex) {
                for (let i = 0; i < cellPosition.length; i++) {
                    const option = {
                        rowIndex: cellPosition[i].rowIndex,
                        columnIndex: cellPosition[i].columnIndex,
                        property: null,
                        value: '',
                        css: null
                    }
                    const cellObj = TableCell.createTableCell(option)
                    this.$table.insertBefore(cellObj.$cell, cell.$cell)
                    newChildCells.push(cellObj)
                    item.state = 0 // 这个cell已经执行了
                }
            }
        })
        newChildCells.push(cell)
    })
    // 末尾添加新的cell
    excuteCellConfig.map(item => {
        const { cellPosition, state } = item
        if (state) {
            for (let i = 0; i < cellPosition.length; i++) {
                const option = {
                    rowIndex: cellPosition[i].rowIndex,
                    columnIndex: cellPosition[i].columnIndex,
                    property: null,
                    value: '',
                    css: null
                }
                const cellObj = TableCell.createTableCell(option)
                this.$table.appendChild(cellObj.$cell)
                newChildCells.push(cellObj)
                item.state = 0 // 这个cell已经执行了
            }
        }
    })
    this.childCells = newChildCells
}
// 计算所选表格占据的范围
function getMinMaxFromSelectedCells() {
    const mutiCells = this.getAllSelectedCell()
    // 先计算所占行列的面积
    let minRow = mutiCells[0].rowIndex
    let maxRow = mutiCells[0].rowIndex
    let minCol = mutiCells[0].columnIndex
    let maxCol = mutiCells[0].columnIndex
    mutiCells.map(cell => {
        const { rowIndex, columnIndex } = cell
        const { rowSpan, colSpan } = cell.property
        if (minRow > rowIndex) {
            minRow = rowIndex
        }
        if (maxRow < rowIndex) {
            maxRow = rowIndex
        }
        if (rowSpan > 1) {
            if (maxRow < rowIndex + rowSpan - 1) {
                maxRow = rowIndex + rowSpan - 1
            }
        }
        if (minCol > columnIndex) {
            minCol = columnIndex
        }
        if (maxCol < columnIndex) {
            maxCol = columnIndex
        }
        if (colSpan > 1) {
            if (maxCol < columnIndex + colSpan - 1) {
                maxCol = columnIndex + colSpan - 1
            }
        }
    })
    return {
        minRow: minRow,
        maxRow: maxRow,
        minCol: minCol,
        maxCol: maxCol
    }
}
function mergeCells() {
    const allSelectCells = this.getAllSelectedCell()
    const { rows, columns } = this.elementJson.property
    const { minRow, maxRow, minCol, maxCol } = this.getMinMaxFromSelectedCells()
    // 设置第一个cell 占据全部 其余的都删除掉
    if (maxRow - minRow >= rows - 1 && maxCol - minCol >= columns - 1) {
        Vue.notifier.fail('表格组件最低保持一行两列或者两列一行！')
        return false
    }

    let firstCell = allSelectCells.find(cell => (cell.rowIndex === minRow && cell.columnIndex === minCol))
    if (!firstCell) {
        // 有异常
        firstCell = allSelectCells[0]
    }
    // firstCell.rowIndex = minRow
    // firstCell.columnIndex = minCol
    const css = {}
    css.gridRowStart = minRow + 1
    css.gridRowEnd = maxRow + 2
    css.gridColumnStart = minCol + 1
    css.gridColumnEnd = maxCol + 2
    // 占据了几行
    firstCell.property.rowSpan = maxRow + 1 - minRow
    // 占据了几列
    firstCell.property.colSpan = maxCol + 1 - minCol
    css.border = '2px solid #1593FF'

    Object.assign(firstCell.css, css)
    firstCell.$cell.css(css)
    // 更新tablecells
    const newTableCells = []
    // 找到最小的那个cell
    this.childCells.map(cell => {
        // 除开选中的第一个cell  其余的cell 都不要
        if (allSelectCells.indexOf(cell) === -1 || cell === firstCell) {
            newTableCells.push(cell)
        }
    })
    // 更新tablecells
    this.childCells = newTableCells
    // 删除除开第一个的全部
    allSelectCells.map(cell => {
        if (cell !== firstCell) {
            this.$table.removeChild(cell.$cell)
        }
    })
    return true
}

export default {
    checkTableCanMerge,
    checkTableCanShowMergeMenu,
    mergeCells,
    dismissMerge,
    getMinMaxFromSelectedCells
}
