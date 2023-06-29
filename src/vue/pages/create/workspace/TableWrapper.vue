<template>
    <div
        v-if="eqxElementsSelected && eqxElement.isSelected &&!eqxElement.elementJson.property.lock"
        class="eqc-comp-table-wrapper"
    >
        <div
            v-show="chooseColumn !== -1"
            class="top-drag-bar"
        >
            <div
                ref="leftBar"
                class="line left-line"
                :style="{height:css.height+40+'px',left:leftBarLeft + 'px'}"
            >
                <span class="bar left-bar"><span class="inner-line" /></span>
            </div>
            <div
                ref="rightBar"
                class="line right-line"
                :style="{height:css.height+40+'px',left:rightBarLeft + 'px'}"
            >
                <span class="bar right-bar"><span class="inner-line" /></span>
            </div>
        </div>
        <div
            v-show="chooseRow !== -1"
            class="left-drag-bar"
        >
            <div
                ref="upBar"
                class="line up-line"
                :style="{width:css.width+40+'px',top:topBarTop+'px'}"
            >
                <span class="bar up-bar"><span class="inner-line" /></span>
            </div>
            <div
                ref="downBar"
                class="line down-line"
                :style="{width:css.width+40+'px',top:downBarTop+'px'}"
            >
                <span class="bar down-bar"><span class="inner-line" /></span>
            </div>
        </div>
        <div
            class="top-banner"
            :style="{top:'-40px'}"
        >
            <span
                v-for="(item,i) in columnWidthArr"
                :key="i"
                class="item top-item"
                :class="{active:chooseColumn===i}"
                :style="{width:item}"
                @click="topItemClick(i)"
                @mouseleave="topHoverId=-1"
                @mouseover="topHoverId=i"
            >
                {{ getTopBannerValue(i) }}
                <i
                    v-if="topHoverId === i"
                    class="eqf-menu-down menu"
                    @click="showTopMenu($event,i)"
                />
            </span>
            <span
                class="item top-item top_plus"
                @click="addColumn"
            ><i class="eqf-plus" /></span>
        </div>
        <div
            class="left-banner"
            :style="{left:'-40px'}"
        >
            <span
                v-for="(item,i) in rowHeightArr"
                :key="i"
                class="item left-item"
                :class="{active:chooseRow===i}"
                :style="{height:item}"
                @click="leftItemClick(i)"
                @mouseleave="leftHoverId=-1"
                @mouseover="leftHoverId=i"
            >
                {{ i+1 }}
                <i
                    v-if="leftHoverId === i"
                    class="eqf-menu-down menu"
                    @click="showLeftMenu($event,i)"
                />
            </span>
            <span
                class="item left-item left_plus"
                @click="addRow"
            ><i class="eqf-plus" /></span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        eqxElement: { // 组件
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            topHoverId: -1,
            leftHoverId: -1,
            chooseColumn: -1,
            chooseRow: -1
        }
    },
    computed: {
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        tableClickTimestamp() {
            return this.scene.tableClickTimestamp
        },
        eqxElementsSelected() {
            return this.scene.eqxElementsSelected.length === 1
        },
        columnWidthArr() {
            return this.eqxElement.columnWidthArr
        },
        leftBarLeft() {
            return this.calculateArr(this.columnWidthArr, this.chooseColumn - 1)
        },
        rightBarLeft() {
            return this.calculateArr(this.columnWidthArr, this.chooseColumn)
        },
        rowHeightArr() {
            return this.eqxElement.rowHeightArr
        },
        topBarTop() {
            return this.calculateArr(this.rowHeightArr, this.chooseRow - 1)
        },
        downBarTop() {
            return this.calculateArr(this.rowHeightArr, this.chooseRow)
        },
        eqxElementCss() {
            return this.eqxElement.elementJson.css
        },
        css() {
            return {
                left: Math.round(parseInt(this.eqxElementCss.left)),
                top: Math.round(parseInt(this.eqxElementCss.top)),
                width: Math.round(parseInt(this.eqxElementCss.width)),
                height: Math.round(parseInt(this.eqxElementCss.height))
            }
        },
        // 得到A-Z
        getTopBannerValue() {
            return (index) => {
                return String.fromCharCode(65 + index % 26)
            }
        }
    },
    watch: {
        tableClickTimestamp() {
            // 触发click之后 选中取消
            this.chooseRow = -1
            this.chooseColumn = -1
        },
        'eqxElement.isSelected'(newVal) {
            // 取消选中
            if (!newVal) {
                this.chooseRow = -1
                this.chooseColumn = -1
                this.eqxElement.cancelAllSelectedCells()
            }
        }
    },
    mounted() {
        this.initDragEnvironment()
    },
    methods: {
        initDragEnvironment() {
            setTimeout(() => {
                const leftBar = this.$refs.leftBar
                const rightBar = this.$refs.rightBar
                const upBar = this.$refs.upBar
                const downBar = this.$refs.downBar
                if (this.chooseColumn !== -1) {
                    this.initDragBar(leftBar, 'left')
                    this.initDragBar(rightBar, 'right')
                }
                if (this.chooseRow !== -1) {
                    this.initDragBar(upBar, 'up')
                    this.initDragBar(downBar, 'down')
                }
            }, 100)
        },
        // 计算数组中的累计和
        calculateArr(arr, index) {
            let sum = 0
            if (index < 0 || index >= arr.length) {
                sum = 0
            }
            for (let i = 0; i < arr.length; i++) {
                if (i <= index) {
                    sum += parseInt(arr[i])
                }
            }
            return sum
        },
        initDragBar(nodeBar, type) {
            nodeBar && nodeBar.addEventListener('mousedown', e => {
                const startX = e.pageX
                const startY = e.pageY
                const startLeft = parseInt(nodeBar.style.left)
                const tableWidth = parseInt(this.eqxElement.elementJson.css.width)
                const tableHeight = parseInt(this.eqxElement.elementJson.css.height)
                let columnWidth = 0
                let rowHeight = 0
                if (type === 'left') {
                    if (this.chooseColumn > 0) {
                        columnWidth = this.eqxElement.columnWidthArr[this.chooseColumn - 1]
                    }
                } else if (type === 'right') {
                    columnWidth = this.eqxElement.columnWidthArr[this.chooseColumn]
                } else if (type === 'up') {
                    if (this.chooseRow > 0) {
                        rowHeight = this.eqxElement.rowHeightArr[this.chooseRow - 1]
                    }
                } else if (type === 'down') {
                    rowHeight = this.eqxElement.rowHeightArr[this.chooseRow]
                }
                const mousemove = e => {
                    const xplus = e.pageX - startX
                    const yplus = e.pageY - startY
                    const newColumnWidth = parseInt(columnWidth) + xplus
                    const newRowHeight = parseInt(rowHeight) + yplus
                    const newTableWidth = tableWidth + xplus + 'px'
                    const newTableHeight = tableHeight + yplus + 'px'
                    if (newColumnWidth >= 40 && ['left', 'right'].includes(type)) {
                        // 判断极值  最左边第一根第一列是不能拖动的
                        if (type === 'left' && this.chooseColumn === 0) {
                            return
                        }
                        nodeBar.style.left = startLeft + xplus + 'px'
                        if (type === 'left') {
                            this.eqxElement.updateColumnWidthByIndex(this.chooseColumn - 1, newColumnWidth + 'px', newTableWidth)
                        } else if (type === 'right') {
                            this.eqxElement.updateColumnWidthByIndex(this.chooseColumn, newColumnWidth + 'px', newTableWidth)
                        }
                    }
                    if (newRowHeight >= 40 && ['up', 'down'].includes(type)) {
                        // 判断极值  最上边第一根第一行是不能拖动的
                        if (type === 'up' && this.chooseRow === 0) {
                            return
                        }
                        nodeBar.style.top = startLeft + yplus + 'px'
                        if (type === 'up') {
                            this.eqxElement.updateRowHeightByIndex(this.chooseRow - 1, newRowHeight + 'px', newTableHeight)
                        } else if (type === 'down') {
                            this.eqxElement.updateRowHeightByIndex(this.chooseRow, newRowHeight + 'px', newTableHeight)
                        }
                    }
                }
                const mouseup = e => {
                    this.eqxPage.eqxHistory.add(this.eqxPage)
                    document.removeEventListener('mousemove', mousemove)
                    document.removeEventListener('mouseup', mouseup)
                }
                document.addEventListener('mousemove', mousemove)
                document.addEventListener('mouseup', mouseup)
            })
        },
        topItemClick(index) {
            this.chooseRow = -1
            this.chooseColumn = index
            this.initDragEnvironment()
        },
        leftItemClick(index) {
            this.chooseColumn = -1
            this.chooseRow = index
            this.initDragEnvironment()
        },
        addColumn() {
            this.eqxElement.addNewColumns(this.columnWidthArr.length)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        addRow() {
            this.eqxElement.addNewRows(this.rowHeightArr.length)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        showTopMenu(e, index) {
            e.stopPropagation()
            Vue.store.commit('SCENE_TABLE_TABLE_MENU', {
                isShow: true,
                left: parseInt(e.pageX) - 2,
                top: parseInt(e.pageY) - 2,
                type: 'column',
                index: index,
                id: this.eqxElement.elementJson.id
            })
        },
        showLeftMenu(e, index) {
            e.stopPropagation()
            Vue.store.commit('SCENE_TABLE_TABLE_MENU', {
                isShow: true,
                left: parseInt(e.pageX) - 2,
                top: parseInt(e.pageY) - 2,
                type: 'row',
                index: index,
                id: this.eqxElement.elementJson.id
            })
        }
    }
}
</script>

<style lang="scss">
.eqc-comp-table-wrapper {
    position: absolute;
    .top-drag-bar {
        position: relative;
        z-index: 1000;
        .line {
            width: 2px;
            background: #1593ff;
            position: absolute;
            top: -40px;
        }
        .bar {
            margin-left: -6px;
            display: inline-block;
            width: 12px;
            height: 28px;
            background: white;
            box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.16);
            border-radius: 6px;
            text-align: center;
            line-height: 28px;
            cursor: ew-resize;
            .inner-line {
                display: inline-block;
                width: 2px;
                height: 12px;
                background: rgba(37, 43, 63, 1);
                &:hover {
                    background: #1593ff;
                }
            }
        }
    }
    .left-drag-bar {
        position: relative;
        z-index: 1000;
        .line {
            height: 2px;
            background: #1593ff;
            position: absolute;
            left: -40px;
        }
        .bar {
            margin-top: -6px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 12px;
            background: white;
            box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.16);
            border-radius: 6px;
            text-align: center;
            line-height: 12px;
            cursor: ns-resize;
            .inner-line {
                display: inline-block;
                width: 12px;
                height: 2px;
                background: rgba(37, 43, 63, 1);
                &:hover {
                    background: #1593ff;
                }
            }
        }
    }
    .item {
        position: relative;
        background: #1d2024;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        &:hover {
            background: #2e333a;
        }
        &.active {
            color: white;
            background: #1593ff;
        }
        .menu {
            font-size: 16px;
            color: white;
        }
    }
    .top-banner {
        position: absolute;
        display: flex;
        .top-item {
            border-right: 1px solid #404955;
            height: 32px;
            .menu {
                position: absolute;
                right: 3px;
            }
        }
        .top_plus {
            width: 24px;
        }
    }
    .left-banner {
        position: absolute;
        display: flex;
        flex-direction: column;
        .left-item {
            border-bottom: 1px solid #404955;
            width: 32px;
            &:hover {
                transition: all 0.3s;
                width: 52px;
            }
            .menu {
                position: absolute;
                right: 3px;
            }
        }
        .left_plus {
            height: 24px;
        }
    }
}
</style>
