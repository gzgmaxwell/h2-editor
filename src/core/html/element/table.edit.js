export default function () {
    // 双击提示
    this.$table.addEventListener('click', (e) => {
        Vue.store.commit('SCENE_TABLE_CLICK_TIMESTAMP')
        const selectedCell = getTargetNode(this.childCells, e.target)
        if (!selectedCell) return
        if (e.shiftKey) {
            // shift 多选
            selectedCell.isSelected = true
            showShiftChooseCell(this.childCells)
            showMutiChooseCell(this)
        } else if (e.ctrlKey) {
            // ctrl多选
            selectedCell.isSelected = true
            showMutiChooseCell(this)
        } else {
            // 单选
            // 关闭全部的选中
            closeAllChooseCell(this.childCells, this)
            showChooseCell(selectedCell)
        }
    })
    function showShiftChooseCell(childCells) {
        const mutiChooseCells = getAllSelectedCell(childCells)
        let minRow = mutiChooseCells[0].rowIndex
        let maxRow = mutiChooseCells[0].rowIndex
        let minColumn = mutiChooseCells[0].columnIndex
        let maxColumn = mutiChooseCells[0].columnIndex
        mutiChooseCells.map(cell => {
            if (cell.rowIndex < minRow) {
                minRow = cell.rowIndex
            }
            if (cell.rowIndex > maxRow) {
                maxRow = cell.rowIndex
            }
            if (cell.columnIndex < minColumn) {
                minColumn = cell.columnIndex
            }
            if (cell.columnIndex > maxColumn) {
                maxColumn = cell.columnIndex
            }
        })
        // 选中符合要求的全部cell
        childCells.map(cell => {
            if (cell.rowIndex >= minRow && cell.rowIndex <= maxRow && cell.columnIndex >= minColumn && cell.columnIndex <= maxColumn) {
                cell.isSelected = true
            }
        })
    }
    function getAllSelectedCell(childCells) {
        const mutiChooseCells = []
        for (let i = 0; i < childCells.length; i++) {
            if (childCells[i].isSelected) {
                mutiChooseCells.push(childCells[i])
            }
        }
        return mutiChooseCells
    }
    // 遍历选中的全部的cells 然后显示样式
    function showMutiChooseCell(that) {
        const childCells = that.childCells
        const mutiChooseCells = getAllSelectedCell(childCells)
        const color = that.elementJson.tableCss.borderColor
        const showState = that.checkTableCanShowMergeMenu()
        // 遍历选中的
        mutiChooseCells.map(cell => {
            let up = false
            let down = false
            let left = false
            let right = false

            mutiChooseCells.map(item => {
                if (item !== cell) {
                    if (item.rowIndex - cell.rowIndex === 1) {
                        if (item.property.colSpan > 1 && cell.columnIndex < item.columnIndex + item.property.colSpan) {
                            down = true
                        } else if (item.columnIndex === cell.columnIndex) {
                            down = true
                        }
                    } else if (item.rowIndex - cell.rowIndex === -1) {
                        if (item.property.colSpan > 1 && cell.columnIndex < item.columnIndex + item.property.colSpan) {
                            up = true
                        } else if (item.columnIndex === cell.columnIndex) {
                            up = true
                        }
                    }
                    if (item.columnIndex - cell.columnIndex === 1) {
                        if (item.property.rowSpan > 1 && cell.rowIndex < item.rowIndex + item.property.rowSpan) {
                            right = true
                        } else if (item.rowIndex === cell.rowIndex) {
                            right = true
                        }
                    } else if (item.columnIndex - cell.columnIndex === -1) {
                        if (item.property.rowSpan > 1 && cell.rowIndex < item.rowIndex + item.property.rowSpan) {
                            left = true
                        } else if (item.rowIndex === cell.rowIndex) {
                            left = true
                        }
                    }
                }
            })
            cell.$cell.style.border = '2px solid #1593FF'
            if (showState) {
                if (up) {
                    cell.$cell.style.borderTop = `1px solid ${color}`
                }
                if (down) {
                    cell.$cell.style.borderBottom = `1px solid ${color}`
                }
                if (left) {
                    cell.$cell.style.borderLeft = `1px solid ${color}`
                }
                if (right) {
                    cell.$cell.style.borderRight = `1px solid ${color}`
                }
            }
        })
    }
    // 把选中的cell 展示出来
    function showChooseCell(cell) {
        cell.isSelected = true
        cell.$cell.css({ border: '2px solid #1593FF' })
    }
    //  取消所有选中
    function closeAllChooseCell(childCells, that) {
        const color = that.elementJson.tableCss.borderColor
        childCells.map(cell => {
            cell.isSelected = false
            cell.$cell.style.border = ''
            cell.$cell.style.borderRight = `1px solid ${color}`
            cell.$cell.style.borderBottom = `1px solid ${color}`
        })
    }
    // 得到选中的cell
    function getTargetNode(childCells, target) {
        for (let i = 0; i < childCells.length; i++) {
            if (childCells[i].$cell === target) {
                return childCells[i]
            }
        }
        return null
    }
}
