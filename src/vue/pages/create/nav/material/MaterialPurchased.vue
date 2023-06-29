<template>
    <div
        ref="wrap"
        v-scroll-bar="{onScrollMove}"
        class="eqc-material-purchased"
    >
        <ul class="list">
            <template v-for="(item,i) in list">
                <component
                    :is="getComponentByType(item.printCategoryId)"
                    :key="i"
                    :item="item"
                    :category="category"
                />
            </template>
            <base-list-status-infinite
                v-if="info.list.length && (info.isBusy || info.isEnd)"
                :is-busy="info.isBusy"
                :is-end="info.isEnd"
                :bg-color="'rgba(255,255,255,1)'"
            />
        </ul>
        <base-list-status
            v-if="!info.list.length"
            :is-busy="info.isBusy"
            :is-empty="!info.isBusy && !info.list.length"
            msg-result="暂无素材"
        />
    </div>
</template>
<script>
import MaterialFrameItem from './MaterialFrameItem.vue'
import MaterialImageItem from './MaterialImageItem.vue'
import MaterialCombineItem from './MaterialCombineItem.vue'
import MaterialShapeItem from './MaterialShapeItem.vue'
import elementType from '../../../../../config/enum.element.type'
export default {
    components: {
        MaterialFrameItem,
        MaterialImageItem,
        MaterialCombineItem,
        MaterialShapeItem
    },
    props: {
        type: {
            type: String,
            default: 'purchase' // purchase 已购买 collect 是已收藏
        },
        category: {
            type: String,
            default: 'h2'// 类型 h2 主编辑器  tcloud 字云编辑器
        }
    },
    data() {
        return {
            list: [],
            info: {
                tab: '',
                pageNo: 1,
                pageSize: 30,
                list: []
            },
            key: ''
        }
    },
    computed: {
        refreshCollectListState() {
            return Vue.store.state.layout.refreshCollectListState
        }
    },
    watch: {
        type() {
            // 重新获取data type改变
            this.info.pageNo = 1
            this.info.pageSize = 30
            this.getProduct()
        },
        'info.list'(newData) {
            const listData = []
            newData.map((item, i) => {
                // 在已收藏列表 收藏标识强制置为1 避免缓存带来的bug
                if (this.type === 'collect') {
                    item.collectionFlag = 1
                }
                if (this.type === 'purchase') {
                    //  在已购买列表强制置为true 避免缓存带来的bug
                    item.collectionFlag = 0
                    item.hasBuyFlag = true
                }
                if (this.category === 'tcloud' || this.category === 'puzzle') {
                    // 字云素材库已购，已收藏 列表过滤非图片组件的素材
                    if (item.printCategoryId === '102') {
                        listData.push(item)
                    }
                } else {
                    listData.push(item)
                }
            })
            this.list = listData
        },
        refreshCollectListState() {
            // 删除之后触发 然后刷新列表
            if (this.type === 'collect') {
                this.getProduct()
            }
        }
    },
    mounted() {
        this.getProduct()
    },
    methods: {
        // 查询数据
        getProduct() {
            this.info.tab = 'material-' + this.type
            this.info.randomId = Math.random() * 10000
            this.key = this.infiniteScroll.setKey(JSON.parse(JSON.stringify(this.info)))
            this.info = this.infiniteScroll.getInfo(this.key)
            if (!this.info.list.length) {
                this.getNextPage()
            }
            setTimeout(() => this.$refs.wrap.myScroll.scrollToTop(), 100)
        },
        // 滚动条
        onScrollMove(e, info) {
            if (info.scrollY / info.maxScrollY >= 2 / 3) {
                this.getNextPage()
            }
        },
        // 下一页
        getNextPage() {
            this.infiniteScroll.getMoreItems(this.key).catch(err => err && this.logger.error(err))
        },
        // 根据type 选择不同的组件
        getComponentByType(type) {
            let typeNum = 0
            if (type) {
                typeNum = Number(type)
            }
            if (typeNum === elementType.image) {
                return 'material-image-item'
            } else if (typeNum === elementType.frame) {
                return 'material-frame-item'
            } else if (typeNum === elementType.combine) {
                return 'material-combine-item'
            } else if (typeNum === elementType.shape) {
                return 'material-shape-item'
            }
        }
    }
}
</script>
<style lang="scss">
.eqc-material-purchased {
    position: relative;
    padding: 0px 16px;
    height: calc(100% - 108px);
    .list {
        justify-content: space-between;
        display: flex;
        flex-wrap: wrap;
        position: relative;
        padding-bottom: 42px;
    }
    .eqc-list-status-infinite {
        background: white;
    }
}
</style>
