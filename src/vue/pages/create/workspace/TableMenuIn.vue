<template>
    <div
        v-if="tableMenuIn.isShow"
        class="eqc-table-menu-in"
        :style="{left:left,top:top}"
        @mouseleave="mouseleave"
        @mousedown.stop
    >
        <span
            class="item"
            @click="mergeClick"
        >{{ mergeType?'合并单元格':'取消合并单元格' }}</span>
        <span class="line" />
        <span
            class="item"
            @click="addRow(1)"
        >在上面添加行</span>
        <span
            class="item"
            @click="addRow(2)"
        >在下面添加行</span>
        <span class="line" />
        <span
            class="item"
            @click="addColumn(1)"
        >在前面添加列</span>
        <span
            class="item"
            @click="addColumn(2)"
        >在后面添加列</span>
        <span class="line" />
        <span
            class="item"
            @click="deleteItem(1)"
        >删除所选行</span>
        <span
            class="item"
            @click="deleteItem(2)"
        >删除所选列</span>
    </div>
</template>
<script>
export default {
    data() {
        return {
            left: 0,
            top: 0,
            mergeType: true //  true 合并单元格 false 取消合并单元格
        }
    },
    computed: {
        tableMenuIn() {
            return Vue.store.state.scene.tableMenuIn
        },
        eqxElement() {
            return Vue.store.state.scene.eqxElementsSelected[0]
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        }
    },
    watch: {
        // 初始化生成位置
        tableMenuIn: {
            handler(val) {
                this.initPos(val)
            },
            deep: true
        }
    },
    methods: {
        initPos({ left, top }) {
            const $workspace = this.$parent.$el
            const workspaceRect = $workspace.getBoundingClientRect()
            this.left = left - workspaceRect.left - 2 + 'px'
            this.top = top - workspaceRect.top - 2 + 'px'
            this.mergeType = this.eqxElement.checkTableCanMerge()
        },
        mergeClick() {
            if (this.mergeType) {
                if (this.eqxElement.checkTableCanShowMergeMenu()) {
                    const state = this.eqxElement.mergeCells()
                    if (state) {
                        this.mergeType = !this.mergeType
                    }
                } else {
                    Vue.notifier.fail('不满足合并条件，无法合并！')
                }
            } else {
                // 取消合并
                this.eqxElement.dismissMerge()
                this.mergeType = !this.mergeType
            }
        },
        addRow(type) {
            if (this.checkBeforeAdd(2)) {
                const { minRow, maxRow } = this.eqxElement.getMinMaxFromSelectedCells()
                if (type === 1) {
                    this.eqxElement.addNewRows(minRow)
                } else {
                    this.eqxElement.addNewRows(maxRow + 1)
                }
                this.eqxPage.eqxHistory.add(this.eqxPage)
            }
        },
        addColumn(type) {
            if (this.checkBeforeAdd(2)) {
                const { minCol, maxCol } = this.eqxElement.getMinMaxFromSelectedCells()
                if (type === 1) {
                    this.eqxElement.addNewColumns(minCol)
                } else {
                    this.eqxElement.addNewColumns(maxCol + 1)
                }
                this.eqxPage.eqxHistory.add(this.eqxPage)
            }
        },
        checkBeforeDelete(type) {
            // 当剩下的表格不足以 成为一个表格的最低表现形式时（1*2 或 2*1） 不允许删除
            const { columns, rows } = this.eqxElement.elementJson.property
            const { minRow, maxRow, minCol, maxCol } = this.eqxElement.getMinMaxFromSelectedCells()
            let pass = true
            if (type === 1 && (maxRow - minRow) >= rows - 1) {
                // 删除行额度校验
                pass = false
                Vue.notifier.fail('表格组件最低保持一行两列或者两列一行！')
            } else if (type === 2 && (maxCol - minCol) >= columns - 1) {
                // 删除列校验
                pass = false
                Vue.notifier.fail('表格组件最低保持一行两列或者两列一行！')
            }
            return pass
        },
        checkBeforeAdd(type) {
            const { width, height } = this.eqxElement.elementJson.css
            const { maxCol, maxRow, maxWidth, maxHeight, columns, rows } = this.eqxElement.elementJson.property
            let pass = true
            if (type === 1) {
                // 添加行
                if (parseInt(height) + 40 > maxHeight) {
                    pass = false
                    Vue.notifier.fail(`表格组件高度不能大于${maxHeight}px`)
                }
                if (rows + 1 > maxRow) {
                    pass = false
                    Vue.notifier.fail(`表格组件行数不能大于${maxRow}px`)
                }
            } else {
                // 添加列
                if (parseInt(width) + 108 > maxWidth) {
                    pass = false
                    Vue.notifier.fail(`表格组件宽度不能大于${maxWidth}px`)
                }
                if (columns + 1 > maxCol) {
                    pass = false
                    Vue.notifier.fail(`表格组件列数不能大于${maxCol}px`)
                }
            }
            return pass
        },
        deleteItem(type) {
            if (this.checkBeforeDelete(type)) {
                const { minRow, maxRow, minCol, maxCol } = this.eqxElement.getMinMaxFromSelectedCells()
                if (type === 1) {
                    // 删除行
                    for (let i = 0; i <= (maxRow - minRow); i++) {
                        this.eqxElement.deleteRowByIndex(minRow)
                    }
                } else {
                    // 删除列
                    for (let i = 0; i <= (maxCol - minCol); i++) {
                        this.eqxElement.deleteColumnByIndex(minCol)
                    }
                }
                this.eqxPage.eqxHistory.add(this.eqxPage)
            }
        },
        mouseleave() {
            this.close()
        },
        close() {
            this.tableMenuIn.isShow = false
        }
    }
}
</script>
<style lang="scss">
.eqc-table-menu-in {
    position: absolute;
    width: 120px;
    height: 274px;
    overflow: hidden;
    background: white;
    padding: 8px 0;
    color: #252b3f;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    border-radius: 4px;
    z-index: 1000;
    .disable {
        color: #999999;
        cursor: not-allowed;
    }
    .item {
        width: 120px;
        height: 30px;
        padding: 0 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        &:hover {
            background: #252b3f;
            color: white;
        }
    }
    .line {
        width: 120px;
        height: 1px;
        background: #ccd5db;
        margin: 8px 0;
    }
}
</style>
