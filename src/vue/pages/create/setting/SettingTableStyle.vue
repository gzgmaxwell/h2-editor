<template>
    <div
        id="table-style-layer"
        :style="getPositionStyle"
        class="eqc-setting-table-style"
    >
        <div
            v-drag-style-layer="{target: '#table-style-layer', container: '.eqc-create'}"
            class="head"
        >
            <span>表格样式</span>
            <i
                class="close eqf-no"
                @click="close"
            />
        </div>
        <div
            v-scroll-bar
            class="content"
        >
            <ul class="list">
                <li
                    v-for="(item, index) of tableStyleList"
                    :key="index"
                    class="item"
                    @click="select(item)"
                >
                    <table-style-item :config="item" />
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import dragStyleLayer from './dragSettingFontStyleLayer'
import TableStyleItem from './TableStyleItem.vue'
import tableStyleList from './tableStyleListConfig'

export default {
    components: {
        TableStyleItem
    },
    directives: {
        dragStyleLayer
    },
    data() {
        return {
            tableStyleList
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElementsSelected() {
            return this.scene.eqxElementsSelected
        },
        eqxElement() {
            return this.eqxElementsSelected[0]
        },
        // 获取所在位置
        getPositionStyle() {
            return {
                left: (document.body.clientWidth - 460) + 'px',
                top: '137px'
            }
        }
    },
    created() {
    },
    methods: {
        close() {
            this.$store.commit('SCENE_TABLE_STYLE_LAYER_CHANGE', { show: false })
        },
        select(item) {
            // 设置样式
            this.eqxElement.renderAllCells({
                headerColor: item[0],
                leftHeaderColor: item[1],
                borderColor: item[2],
                backgroundColor: item[3]
            })
            this.eqxPage.eqxHistory.add(this.eqxPage)
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-table-style {
    position: fixed;
    width: 292px;
    height: calc(100% - 137px - 48px); // 443px;
    box-shadow: $boxShadow;
    font-size: 12px;
    background: #fdfdfd;
    z-index: 93;
    border-radius: 3px;
    .head {
        height: 40px;
        padding: 0 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ccd5db;
        font-weight: bold;
        color: #2f3c4d;
        background: rgba(236, 238, 240, 1);
        cursor: move;
        .close {
            font-size: 20px;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                color: $red-normal;
            }
        }
        span {
            font-size: 13px;
        }
    }
    .content {
        position: relative;
        height: calc(100% - 40px); // 392px;
        .list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: center;
            padding-top: 8px;
            .item {
                width: 112px;
                height: 52px;
                margin: 8px 16px;
                overflow: hidden;
                position: relative;
                cursor: pointer;
                &:hover {
                    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.4);
                }
                .flag {
                    width: 32px;
                    height: 16px;
                    background: #ff296a;
                    border-radius: 3px;
                    color: #ffffff;
                    font-size: 12px;
                    line-height: 16px;
                    text-align: center;
                    position: absolute;
                    top: -8px;
                    right: -6px;
                }
            }
            .item:nth-child(even) {
                margin: 8px 12px 8px 4px;
            }
        }
    }
}
</style>
