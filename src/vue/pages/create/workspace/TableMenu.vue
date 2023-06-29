<template>
    <div
        v-if="tableMenu.isShow"
        class="eqc-table-menu"
        :style="{left:left,top:top}"
        @mouseleave="mouseleave"
        @mousedown.stop
    >
        <span
            class="item"
            @click="addBeforeClick"
        >{{ tableMenu.type==="row"?'在前面添加行':'在前面添加列' }}</span>
        <span
            class="item"
            @click="addAfterClick"
        >{{ tableMenu.type==="row"?'在后面添加行':'在后面添加列' }}</span>
        <span class="line" />
        <span
            class="item"
            @click="centerclick"
        >{{ tableMenu.type==="row"?'行水平均分':'列垂直均分' }}</span>
        <span class="line" />
        <span
            class="item"
            @click="deleteItem"
        >{{ tableMenu.type==="row"?'删除此行':'删除此列' }}</span>
    </div>
</template>
<script>
export default {
    data() {
        return {
            left: 0,
            top: 0,
            eqxElement: null
        }
    },
    computed: {
        tableMenu() {
            return Vue.store.state.scene.tableMenu
        },
        allElements() {
            return Vue.store.state.scene.eqxPage.eqxElements
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
        tableMenu: {
            handler(val) {
                this.initPos(val)
                this.eqxElement = this.allElements.filter(item => item.elementJson.id === val.id)[0]
            },
            deep: true
        }
    },
    methods: {
        initPos({ left, top }) {
            const $workspace = this.$parent.$el
            const workspaceRect = $workspace.getBoundingClientRect()
            this.left = left - workspaceRect.left + 'px'
            this.top = top - workspaceRect.top + 'px'
        },
        // 前面增加行或列
        addBeforeClick() {
            if (this.checkBeforeAdd()) {
                if (this.tableMenu.type === 'column') {
                    this.checkBeforeAdd(2) && this.eqxElement.addNewColumns(this.tableMenu.index)
                } else {
                    this.checkBeforeAdd(1) && this.eqxElement.addNewRows(this.tableMenu.index)
                }
                this.eqxPage.eqxHistory.add(this.eqxPage)
                this.close()
            }
        },
        //  后面增加行或列
        addAfterClick() {
            if (this.checkBeforeAdd()) {
                if (this.tableMenu.type === 'column') {
                    this.checkBeforeAdd(2) && this.eqxElement.addNewColumns(this.tableMenu.index + 1)
                } else {
                    this.checkBeforeAdd(1) && this.eqxElement.addNewRows(this.tableMenu.index + 1)
                }
                this.eqxPage.eqxHistory.add(this.eqxPage)
                this.close()
            }
        },
        checkBeforeAdd(type) {
            // table 宽高都不能超过5000px
            let pass = true
            const { width, height } = this.eqxElement.elementJson.css
            const { rows, columns } = this.eqxElement.elementJson.property
            const { maxCol, maxRow, maxWidth, maxHeight } = this.eqxElement.elementJson.property
            if (parseFloat(width) >= maxWidth - 108 && type === 1) {
                pass = false
                Vue.notifier.fail(`表格组件宽度不能大于${maxWidth}px`)
            }
            if (rows > maxRow && type === 1) {
                pass = false
                Vue.notifier.fail(`表格组件行数不能大于${maxRow}px`)
            }
            if (parseFloat(height) >= maxHeight - 40 && type === 2) {
                pass = false
                Vue.notifier.fail(`表格组件高度不能大于${maxHeight}px`)
            }
            if (columns > maxCol && type === 2) {
                pass = false
                Vue.notifier.fail(`表格组件列数不能大于${maxCol}px`)
            }
            return pass
        },
        checkBeforeDelete(type) {
            // table 行和列的和至少为3
            let pass = true
            if (this.eqxElement.elementJson.property.rows + this.eqxElement.elementJson.property.columns <= 3) {
                pass = false
                Vue.notifier.fail('表格组件要求至少1行2列或者2列1行！')
            } else if (type === 1 && this.eqxElement.elementJson.property.columns <= 1) {
                pass = false
                Vue.notifier.fail('表格组件要求至少1列！')
            } else if (type === 2 && this.eqxElement.elementJson.property.rows <= 1) {
                pass = false
                Vue.notifier.fail('表格组件要求至少1行！')
            }
            return pass
        },
        // 垂直均分
        centerclick() {
            if (this.tableMenu.type === 'row') {
                // 行水平均分
                const width = parseInt(this.eqxElement.elementJson.css.width)
                const cols = this.eqxElement.elementJson.property.columns
                const newArr = []
                for (let i = 0; i < cols; i++) {
                    newArr.push(width / cols + 'px')
                }
                this.eqxElement.columnWidthArr = newArr
            } else {
                // 列垂直均分
                const height = parseInt(this.eqxElement.elementJson.css.height)

                const rows = this.eqxElement.elementJson.property.rows
                const newArr = []
                for (let i = 0; i < rows; i++) {
                    newArr.push(height / rows + 'px')
                }
                this.eqxElement.rowHeightArr = newArr
            }
            this.eqxElement.updateTableCss({})
            this.eqxPage.eqxHistory.add(this.eqxPage)
            this.close()
        },
        // 删除行或列
        deleteItem() {
            if (this.tableMenu.type === 'column') {
                this.checkBeforeDelete(1) && this.eqxElement.deleteColumnByIndex(this.tableMenu.index)
            } else {
                this.checkBeforeDelete(2) && this.eqxElement.deleteRowByIndex(this.tableMenu.index)
            }
            this.eqxPage.eqxHistory.add(this.eqxPage)
            this.close()
        },
        mouseleave() {
            this.close()
        },
        close() {
            this.tableMenu.isShow = false
        }
    }
}
</script>
<style lang="scss">
.eqc-table-menu {
    position: absolute;
    width: 120px;
    height: 158px;
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
