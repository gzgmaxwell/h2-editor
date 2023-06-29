<template>
    <div
        class="eqc-panel-grid"
        @click.stop
    >
        <div class="form">
            <div class="col">
                <span class="name">横格</span>
                <!-- 限制只能输入两位，type为number时，maxlength不起作用 -->
                <input
                    v-model.number="rowNum"
                    type="number"
                    oninput="if (value.length > 2) value = value.slice(0, 2)"
                    @blur="blurRow"
                >
            </div>
            <div class="col">
                <span class="name">纵格</span>
                <!-- 限制只能输入两位，type为number时，maxlength不起作用 -->
                <input
                    v-model.number="colNum"
                    type="number"
                    oninput="if (value.length > 2) value = value.slice(0, 2)"
                    @blur="blurCol"
                >
            </div>
        </div>
        <div class="switch">
            <span>显示网格</span>
            <base-switch
                :is-open="grid.show"
                @onChange="showGrid"
            />
        </div>
    </div>
</template>

<script>
import storageLocal from '../../../../utils/storageLocal'
export default {
    data() {
        return {
            rowNum: 3,
            colNum: 3
        }
    },
    computed: {
        grid() {
            return this.$store.state.guideLine.grid
        }
    },
    watch: {
        rowNum() {
            // 拖拽组件时，mousedown比blur快，所以要在这里处理，不能放在blur里
            this.$store.commit('GRID_SET', { rowNum: this.rowNum || 1 })
        },
        colNum() {
            // 拖拽组件时，mousedown比blur快，所以要在这里处理，不能放在blur里
            this.$store.commit('GRID_SET', { colNum: this.colNum || 1 })
        }
    },
    created() {

    },
    mounted() {
        this.getConfigHistory()
        this.rowNum = this.grid.rowNum
        this.colNum = this.grid.colNum
    },
    methods: {
        blurRow() {
            // 当输入为0或者空时，其实就是1
            if (!this.rowNum) {
                this.rowNum = 1
                this.setConfigHistory()
            }
        },
        blurCol() {
            // 当输入为0或者空时，其实就是1
            if (!this.colNum) {
                this.colNum = 1
                this.setConfigHistory()
            }
        },
        showGrid() {
            this.$store.commit('GRID_SET', { show: !this.grid.show })
            this.setConfigHistory()
        },
        getConfigHistory() {
            const key = storageLocal.key.gridConfigHistory
            const res = storageLocal.getItem(key)
            if (res) {
                Vue.store.commit('GRID_SET', { show: res.show })
                Vue.store.commit('GRID_SET', { rowNum: res.rowNum })
                Vue.store.commit('GRID_SET', { colNum: res.colNum })
            }
        },
        setConfigHistory() {
            const key = storageLocal.key.gridConfigHistory
            storageLocal.setItem(key, this.grid)
        }
    }
}
</script>

<style lang="scss">
.eqc-panel-grid {
    padding: 28px;
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    cursor: default;
    transform-origin: right;
    .form {
        display: flex;
        .col {
            &:not(:first-child) {
                margin-left: 16px;
            }
            .name {
                font-size: 14px;
                color: #111111;
                font-weight: bold;
            }
            input {
                width: 80px;
                height: 36px;
                margin-top: 8px;
                padding: 0 12px;
                border: 1px solid #ccd5db;
                border-radius: 3px;
            }
        }
    }
    > .switch {
        height: 36px;
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        color: #111111;
    }
}
</style>
