<template>
    <transition name="moveright">
        <div
            v-if="detail.show"
            class="eqc-template-detail"
        >
            <div class="header format">
                <span class="title">{{ detail.title }}</span>
                <span
                    class="close"
                    @click="closeDetailPage"
                > <i class="icon eqf-left" /> 返回</span>
            </div>
            <div
                class="condition-bar-detail flex-center-detail"
            >
                <condition-bar :condition="condition" />
            </div>

            <!-- 展示匹配的模板 -->
            <div
                ref="wrap"
                v-scroll-bar="{onScrollMove}"
                class="content-List"
            >
                <ul class="list">
                    <!-- <condition-bar :condition="condition" /> -->
                    <template-item
                        v-for="item of info.list"
                        :key="item.id"
                        :item="item"
                        :item-css="itemCss"
                        :is-two-col="isTwoCol"
                        :is-sys="true"
                        :eqx-scene="eqxScene"
                        :eqx-page="eqxPage"
                    />
                    <base-list-status-infinite
                        v-if="info.list.length && (info.isBusy || info.isEnd)"
                        :style="`bottom:-25px;`"
                        :is-busy="info.isBusy"
                        :is-end="info.isEnd"
                        :bg-color="'rgba(255,255,255,1)'"
                    />
                </ul>
                <base-list-status
                    v-if="!info.list.length"
                    :is-busy="info.isBusy"
                    :is-empty="!info.isBusy && !info.list.length"
                    msg-result="暂无模板"
                />
            </div>
        </div>
    </transition>
</template>

<script>
import conditionBar from './ConditionBar.vue'
import templateItem from '../NavTemplateItem.vue'
export default {
    components: {
        conditionBar, templateItem
    },
    props: {
        detail: {
            type: Object,
            default: () => ({
                show: false
            })
        }
    },
    data() {
        return {
            itemCss: {},
            info: {
                list: []
            },
            key: '',
            condition: {
                mostType: 'composite', // 排序: composite 综合排序 newest 最新 hottest 最热
                freeState: false,
                memberFreeState: false,
                color: '' // 颜色
            },
            showCondition: false,
            isTwoCol: false // 模板是否显示两列，默认是一列
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        layout() {
            return this.$store.state.layout
        },
        // 模板颜色选择
        templateColorPanel() {
            return this.layout.templateColorPanel
        }
    },
    watch: {
        'detail.show'() {
            // 条件还原
            this.condition = {
                mostType: 'composite',
                freeState: false,
                memberFreeState: false,
                color: ''
            }
        },
        'detail.id'() {
            // 条件还原
            this.condition = {
                mostType: 'composite',
                freeState: false,
                memberFreeState: false,
                color: ''
            }
        },
        condition: {
            handler(newVal) {
                this.getProducts() // 刷新数据
            },
            deep: true
        },
        'templateColorPanel.colorSelectedVal': {
            handler(newVal) {
                this.condition.color = newVal
            },
            deep: true
        }
    },
    created() {
        this.setItemCss(this.eqxScene.sceneJson)
        this.getProducts()
    },
    methods: {
        closeDetailPage() {
            this.detail.show = false
        },
        detailConditionOnChange(condition) {

        },
        onScrollMove(e, info) {
            if (info.scrollY / info.maxScrollY >= 2 / 3) {
                this.getNextPage()
            }
            if (info.scrollY >= 100) {
                this.showCondition = true
            } else {
                this.showCondition = false
            }
        },
        getNextPage() {
            this.infiniteScroll.getMoreItems(this.key)
                .catch(err => err && this.logger.error(err))
        },
        setItemCss(sceneJson) {
            const defaultSize = {
                itemWidthOfOneCol: 256,
                itemWidthOfTwoCol: 124
            }
            const ratio = sceneJson.width / sceneJson.height
            let newWidth = 0
            let newHeight = 0
            if (ratio > 8 / 5) {
                newWidth = defaultSize.itemWidthOfOneCol
                this.isTwoCol = false
            } else {
                newWidth = defaultSize.itemWidthOfTwoCol
                this.isTwoCol = true
            }
            newHeight = newWidth / ratio
            this.itemCss = {
                width: newWidth + 'px',
                height: newHeight + 'px',
                size: Math.max(newWidth, newHeight)
            }
        },
        getProducts() {
            const params = {
                type: this.detail.type,
                attrValue: this.detail.id,
                tab: 'new',
                mostType: this.condition.mostType,
                free: this.condition.freeState ? 0 : '',
                memberFree: this.condition.memberFreeState ? 1 : 0,
                color: this.condition.color
            }
            this.key = this.infiniteScroll.setKey(params)
            this.info = this.infiniteScroll.getInfo(this.key)
            if (!this.info.list.length) {
                this.getNextPage()
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-template-detail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    .format {
        padding: 0 16px;
    }
    .header {
        height: 60px;
        line-height: 60px;
        display: flex;
        justify-content: space-between;
        .title {
            font-size: 18px;
            font-weight: bold;
            color: #000;
        }
        .close {
            font-size: 14px;
            color: #252b3f;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            i {
                font-size: 22px;
                margin-right: -5px;
            }
            &:hover {
                color: rgba(21, 147, 255, 1);
            }
        }
    }
    .condition-bar-detail {
        height: 36px;
        .eqc-condition-bar {
            .sort-list {
                margin-top: 0px;
            }
        }
    }
    .flex-center-detail {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .content-List {
        position: relative;
        height: calc(100% - 61px - 16px - 67px);
        padding: 0px 16px 0 16px;
        .list {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            padding-bottom: 16px;
            .eqc-template-item {
                box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.16);
                border-radius: 3px;
                &:hover {
                    box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
                    background-color: red;
                }
            }
            .eqc-list-status-infinite {
                background-color: #ffffff;
            }
        }
    }
}
</style>
